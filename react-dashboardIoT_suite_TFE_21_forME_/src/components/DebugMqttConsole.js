import React, { useEffect } from "react";
import { useMqtt } from "../contexts/MqttContext";

const DebugMqttConsole = () => {
  const { data, notifications } = useMqtt();

  useEffect(() => {
    console.log("🔁 DATA MQTT ACTUELLE :", JSON.stringify(data, null, 2));
  }, [data]);

  useEffect(() => {
    console.log(
      "🔔 NOTIFS MQTT ACTUELLES :",
      JSON.stringify(notifications, null, 2)
    );
  }, [notifications]);

  return null;
};

export default DebugMqttConsole;
