import React from "react";
import { useMqtt } from "../contexts/MqttContext"; // adapte le chemin si besoin

const PotentiometreDisplay = () => {
  const { data } = useMqtt();

  return (
    <div style={{ fontSize: "1.5rem", color: "#00ffcc" }}>
      Valeur : {data.Potentiometre ?? "En attente..."}
    </div>
  );
};

export default PotentiometreDisplay;
