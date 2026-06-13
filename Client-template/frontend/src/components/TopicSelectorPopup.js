import React, { useEffect, useState, useRef } from "react";
import axios from "../axiosConfig";

const TopicSelectorPopup = ({ topics, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localTopics, setLocalTopics] = useState(topics);
  const [baseTopics, setBaseTopics] = useState([]);
  const [selectedBase, setSelectedBase] = useState(null);
  const [newCapteurName, setNewCapteurName] = useState("");
  const [newFunctionCode, setNewFunctionCode] = useState("FC1");
  const [showAddCapteurForm, setShowAddCapteurForm] = useState(false);
  const [confirmDeleteBase, setConfirmDeleteBase] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.focus();
    refreshTopics();
  }, []);

  const refreshTopics = async () => {
    try {
      const res = await axios.get("/capteur/list");
      const fullTopics = res.data;
      setLocalTopics(fullTopics);
      const uniqueBases = [...new Set(fullTopics.map((t) => t.split("/")[0]))];
      setBaseTopics(uniqueBases);
    } catch (err) {
      console.error("❌ Erreur chargement topics :", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, currentList().length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      const item = currentList()[selectedIndex];
      if (selectedBase) {
        onSelect(item);
      } else {
        setSelectedBase(item);
        setSelectedIndex(0);
      }
    } else if (e.key === "Escape") {
      if (selectedBase) {
        setSelectedBase(null);
        setSelectedIndex(0);
      } else {
        onClose();
      }
    }
  };

  const handleDeleteCapteur = (base) => {
    setConfirmDeleteBase(base);
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteBase) return;
    try {
      await axios.delete(
        `/capteur/delete-capteur/${encodeURIComponent(confirmDeleteBase)}`,
      );
      setConfirmDeleteBase(null);
      await refreshTopics();
      setSelectedBase(null);
      setSelectedIndex(0);
    } catch (error) {
      console.error("❌ Erreur suppression capteur :", error);
      alert("Erreur lors de la suppression du capteur");
    }
  };

  const handleAddCapteur = async () => {
    const validFCs = {
      FC1: "Coil",
      FC2: "Input",
      FC3: "HoldingRegister",
      FC4: "InputRegister",
    };

    if (!newCapteurName.trim()) {
      alert("❌ Nom du capteur vide.");
      return;
    }

    try {
      await axios.post("/capteur/add-capteur", {
        name: newCapteurName.trim(),
        dataType: validFCs[newFunctionCode],
      });
      alert("✅ Capteur ajouté !");
      setNewCapteurName("");
      setNewFunctionCode("FC1");
      setShowAddCapteurForm(false);
      await refreshTopics();
    } catch (error) {
      console.error("❌ Erreur ajout capteur :", error);
      alert("Erreur lors de l'ajout du capteur");
    }
  };

  const currentList = () => {
    return selectedBase
      ? localTopics.filter((t) => t.startsWith(selectedBase + "/"))
      : baseTopics;
  };

  return (
    <div
      ref={listRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: "absolute",
        top: "20px",
        left: "300px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "6px",
        boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        width: "300px",
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {!showAddCapteurForm ? (
        <button
          onClick={() => setShowAddCapteurForm(true)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1.1rem",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "10px",
            width: "100%",
          }}
        >
          ➕ Ajouter un capteur
        </button>
      ) : (
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Nom du capteur"
            value={newCapteurName}
            onChange={(e) => setNewCapteurName(e.target.value)}
            style={{
              padding: "6px",
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginBottom: "6px",
            }}
          />
          <select
            value={newFunctionCode}
            onChange={(e) => setNewFunctionCode(e.target.value)}
            style={{
              padding: "6px",
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #ccc",
              marginBottom: "6px",
            }}
          >
            <option value="FC1">FC1 - Coil</option>
            <option value="FC2">FC2 - Input</option>
            <option value="FC3">FC3 - Holding Register</option>
            <option value="FC4">FC4 - Input Register</option>
          </select>
          <button
            onClick={handleAddCapteur}
            style={{
              padding: "6px",
              width: "100%",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            OK
          </button>
        </div>
      )}

      <strong style={{ display: "block", marginBottom: "6px" }}>
        {selectedBase
          ? `Choisir format pour ${selectedBase}`
          : "Choisir un capteur :"}
      </strong>

      {selectedBase && (
        <button
          onClick={() => {
            setSelectedBase(null);
            setSelectedIndex(0);
          }}
          style={{
            margin: "5px 0 10px",
            fontSize: "0.9rem",
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
          }}
        >
          ⬅ Retour
        </button>
      )}

      <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
        {currentList().map((item, index) => (
          <li
            key={item}
            onMouseEnter={() => setSelectedIndex(index)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              backgroundColor: index === selectedIndex ? "#eee" : "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <span
              onClick={() =>
                selectedBase ? onSelect(item) : setSelectedBase(item)
              }
            >
              {selectedBase ? item.split("/")[1] : item}
            </span>
            {!selectedBase && (
              <button
                onClick={() => handleDeleteCapteur(item)}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            )}
          </li>
        ))}
      </ul>

      {confirmDeleteBase && (
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            border: "1px solid #aaa",
            padding: "20px",
            borderRadius: "8px",
            zIndex: 2000,
            boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
          }}
        >
          <p>
            🗑️ Voulez-vous vraiment supprimer le capteur
            <strong> {confirmDeleteBase}</strong> ?
          </p>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <button
              onClick={() => setConfirmDeleteBase(null)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ❌ Annuler
            </button>
            <button
              onClick={handleDeleteConfirmed}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✅ Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSelectorPopup;
