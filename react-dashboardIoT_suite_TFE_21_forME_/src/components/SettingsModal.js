import React, { useState, useEffect } from "react";
import { useMqtt } from "../contexts/MqttContext";
import TopicSelectorPopup from "./TopicSelectorPopup";
import TopicHistoryModal from "./TopicHistoryModal";

const SettingsModal = ({
  isOpen,
  onClose,
  onSave,
  settings,
  setSettings,
  configurableKeys,
}) => {
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [showPopup, setShowPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { data } = useMqtt();
  const availableTopics = Object.keys(data);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (key, value) => {
    let parsedValue = value;
    if (key.includes("min") || key.includes("max") || key.includes("Size")) {
      parsedValue = value === "" ? "" : parseFloat(value);
    }
    setLocalSettings((prev) => ({ ...prev, [key]: parsedValue }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyle}>
      <h2>Paramètres</h2>

      {configurableKeys.map((key) => (
        <label key={key} style={{ display: "block", marginBottom: "10px" }}>
          {key.charAt(0).toUpperCase() + key.slice(1)}:
          {key === "data_name" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={localSettings[key] ?? ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                style={{ marginLeft: "10px", flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                style={{ marginLeft: "8px" }}
              >
                🔍
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                style={{ marginLeft: "8px" }}
                title="Afficher l'historique"
              >
                ⚙️
              </button>
            </div>
          ) : key === "chart_type" ? (
            <select
              value={localSettings[key] || "line"}
              onChange={(e) => handleInputChange(key, e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              <option value="line">📈 Ligne</option>
              <option value="bar">📊 Barres</option>
              <option value="area">🌄 Aire</option>
            </select>
          ) : (
            <input
              type={
                key.toLowerCase().includes("value") ||
                key.toLowerCase().includes("limit") ||
                key.toLowerCase().includes("width") ||
                key.toLowerCase().includes("height")
                  ? "number"
                  : "text"
              }
              value={localSettings[key] ?? ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              style={{ marginLeft: "10px" }}
            />
          )}
        </label>
      ))}

      {showPopup && (
        <TopicSelectorPopup
          topics={availableTopics}
          onSelect={(selectedTopic) => {
            handleInputChange("data_name", selectedTopic);
            setShowPopup(false);
          }}
          onClose={() => setShowPopup(false)}
        />
      )}

      {showHistory && localSettings.data_name && (
        <TopicHistoryModal
          topic={localSettings.data_name}
          onClose={() => setShowHistory(false)}
        />
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleSave}>💾 Sauvegarder</button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          ❌ Fermer
        </button>
      </div>
    </div>
  );
};

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  color: "black",
  padding: "20px",
  zIndex: 1000,
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

export default SettingsModal;
