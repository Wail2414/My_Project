// src/contexts/MqttContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [notifications, setNotifications] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    //const ws = new WebSocket("wss://localhost:5000/ws");
    //const ws = new WebSocket("wss://api.technivor.net/ws"); // ton backend WebSocket
    const ws = new WebSocket(
      process.env.REACT_APP_WS_URL || "ws://localhost:5000/ws",
    );
    setSocket(ws);

    ws.onopen = () => console.log("🟢 WebSocket ouvert");
    console.log("test");
    ws.onmessage = (event) => {
      console.log("🧪 Brute WebSocket event.data :", event.data); //
      console.log("📨 WS reçu frontend =", event.data);
      try {
        const parsed = JSON.parse(event.data);
        console.log("📡 WebSocket RAW :", parsed); // 👈 test critique

        // pour voir TOUT ce qui arrive
        console.log(
          "🔍 Contenu complet reçu :",
          JSON.stringify(parsed, null, 2),
        );

        // extraction propre
        const { topic, message, update } = parsed;

        if (topic === "notification") {
          setNotifications((prev) => {
            const merged = { ...prev, ...update };
            console.log("🔔 NOTIFS MQTT ACTUELLES :", merged);
            return merged;
          });
        } else {
          setData((prev) => {
            const merged = { ...prev, ...update };
            console.log("📦 DATA MQTT ACTUELLE :", merged);
            return merged;
          });
        }
      } catch (e) {
        console.error("❌ Erreur parsing WebSocket :", e);
      }
    };

    ws.onerror = (err) => {
      console.error("Erreur WebSocket :", err);
    };

    return () => {
      ws.close();
    };
  }, []);
  const subscribe = (topic) => {
    console.log(`(frontend) pretend to subscribe to ${topic}`);
  };

  const unsubscribe = (topic) => {
    console.log(`(frontend) pretend to unsubscribe from ${topic}`);
  };
  return (
    <MqttContext.Provider
      value={{ data, notifications, subscribe, unsubscribe }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);
