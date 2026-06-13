const express = require("express");
const router = express.Router();
const { mqttclient } = require("../mqttClient"); // bien comme ça

router.post("/start-motor", (req, res) => {
  if (mqttclient && mqttclient.connected) {
    mqttclient.publish("startMotor/NotAList", JSON.stringify("start")); // ou juste "start" selon ton ESP
    return res.status(200).json({ message: "Motor started" });
  }
  res.status(500).json({ error: "MQTT client not connected" });
});

router.post("/stop-motor", (req, res) => {
  if (mqttclient && mqttclient.connected) {
    mqttclient.publish("stopMotor/NotAList", JSON.stringify("stop")); // ou "stop"
    return res.status(200).json({ message: "Motor stopped" });
  }
  res.status(500).json({ error: "MQTT client not connected" });
});
router.post("/set-speed", (req, res) => {
  const { speed } = req.body;
  if (mqttclient && mqttclient.connected) {
    mqttclient.publish("setSpeed/NotAList", speed.toString());
    return res.status(200).json({ message: "Speed set", speed });
  }
  res.status(500).json({ error: "MQTT client not connected" });
});
module.exports = router;
