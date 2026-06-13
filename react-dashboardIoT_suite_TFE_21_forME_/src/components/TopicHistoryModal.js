import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

const TopicHistoryModal = ({ topic, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!topic) return;
    const [rawTopic, type] = topic.split("/");
    const queryType = type === "IsAList" ? "IsAList" : "NotAList";
    setLoading(true);
    axios
      .get(
        `/data/history?topic=${encodeURIComponent(rawTopic)}&type=${queryType}`,
      )
      .then((res) => {
        const data = res.data;
        const cleaned = Array.isArray(data)
          ? data.map((entry) => ({
              id: entry.id,
              time: entry.time,
              value: entry.value,
            }))
          : [];
        setHistory(cleaned);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ Erreur fetch :", err);
        setHistory([]);
        setError("Erreur lors du chargement");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [topic]);

  const handleDelete = (id) => {
    axios
      .delete(`/data/history/${id}`)
      .then(() => {
        setHistory((prev) => prev.filter((entry) => entry.id !== id));
      })
      .catch((err) => {
        console.error("❌ Erreur suppression :", err);
      });
  };

  if (!topic) return null;

  return (
    <div style={modalStyle}>
      <h3>
        Historique du topic : <code>{topic}</code>
      </h3>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : !Array.isArray(history) ? (
        <p>❌ Données invalides</p>
      ) : history.length === 0 ? (
        <p>🕳 Aucune donnée trouvée</p>
      ) : (
        <ul style={{ maxHeight: "200px", overflowY: "auto", paddingLeft: 0 }}>
          {history.map((entry) => (
            <li
              key={entry.id}
              style={{
                listStyle: "none",
                marginBottom: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong>{new Date(entry.time).toLocaleString()}</strong> :{" "}
                {typeof entry.value === "object"
                  ? JSON.stringify(entry.value)
                  : entry.value?.toString()}
              </span>
              <button
                style={{
                  marginLeft: "10px",
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
                onClick={() => handleDelete(entry.id)}
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={onClose} style={{ marginTop: "10px" }}>
        Fermer
      </button>
    </div>
  );
};

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "20px",
  zIndex: 1001,
  borderRadius: "8px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  minWidth: "300px",
};

export default TopicHistoryModal;
