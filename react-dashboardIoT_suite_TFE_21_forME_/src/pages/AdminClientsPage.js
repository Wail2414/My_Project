import { useEffect, useState } from "react";
import axios from "../axiosConfig";

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState("");

  const loadClients = async () => {
    const res = await axios.get("/client-stacks");
    setClients(res.data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const startAndOpenClient = async (client) => {
    await axios.post(`/client-stacks/${client.name}/start`);
    window.open(client.frontendUrl, "_blank");
  };

  const stopClient = async (client) => {
    await axios.post(`/client-stacks/${client.name}/stop`);
    alert(`${client.name} arrêté`);
  };

  const deleteClient = async (client) => {
    const confirmDelete = window.confirm(`Supprimer ${client.name} ?`);

    if (!confirmDelete) return;

    await axios.delete(`/client-stacks/${client.name}`);
    alert(`${client.name} supprimé`);
    loadClients();
  };

  const createClient = async () => {
    if (!newClientName.trim()) {
      alert("Entre un nom de client");
      return;
    }

    const res = await axios.post("/client-stacks/create", {
      clientName: newClientName,
    });

    window.open(res.data.client.frontendUrl, "_blank");
    alert(`${newClientName} créé`);
    setNewClientName("");
    loadClients();
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Gestion des stacks clients</h1>

      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "10px",
        }}
      >
        <h2>Créer un nouveau client</h2>

        <input
          type="text"
          placeholder="ex: client-b"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          style={{ padding: "10px", marginRight: "10px" }}
        />

        <button onClick={createClient}>Créer stack client</button>
      </div>

      <h2>Clients disponibles</h2>

      {clients.map((client) => (
        <div
          key={client.name}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "15px",
          }}
        >
          <h3>{client.name}</h3>

          <p>
            URL : <strong>{client.frontendUrl}</strong>
          </p>

          <button onClick={() => startAndOpenClient(client)}>
            Démarrer et entrer
          </button>

          <button onClick={() => window.open(client.frontendUrl, "_blank")}>
            Ouvrir
          </button>

          <button onClick={() => stopClient(client)}>Arrêter</button>

          <button onClick={() => deleteClient(client)}>Supprimer</button>
        </div>
      ))}
    </div>
  );
}
