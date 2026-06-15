const express = require("express");
const router = express.Router();
const { getMqttClient } = require("../mqttClient");

router.post("/start-motor", (req, res) => {
  const mqttclient = getMqttClient();

  if (!mqttclient || !mqttclient.connected) {
    return res.status(503).json({
      error: "MQTT client not connected",
    });
  }

  mqttclient.publish("startMotor/NotAList", "start", (error) => {
    if (error) {
      console.error("❌ Erreur publication startMotor :", error);

      return res.status(500).json({
        error: "MQTT publication failed",
      });
    }

    console.log("✅ Commande startMotor publiée");

    return res.status(200).json({
      message: "Motor started",
    });
  });
});

router.post("/stop-motor", (req, res) => {
  const mqttclient = getMqttClient();

  if (!mqttclient || !mqttclient.connected) {
    return res.status(503).json({
      error: "MQTT client not connected",
    });
  }

  mqttclient.publish("stopMotor/NotAList", "stop", (error) => {
    if (error) {
      console.error("❌ Erreur publication stopMotor :", error);

      return res.status(500).json({
        error: "MQTT publication failed",
      });
    }

    console.log("✅ Commande stopMotor publiée");

    return res.status(200).json({
      message: "Motor stopped",
    });
  });
});

router.post("/set-speed", (req, res) => {
  const mqttclient = getMqttClient();
  const speed = Number(req.body.speed);

  if (!mqttclient || !mqttclient.connected) {
    return res.status(503).json({
      error: "MQTT client not connected",
    });
  }

  if (!Number.isFinite(speed) || speed < 0 || speed > 1000) {
    return res.status(400).json({
      error: "Invalid speed",
    });
  }

  mqttclient.publish("setSpeed/NotAList", String(speed), (error) => {
    if (error) {
      console.error("❌ Erreur publication setSpeed :", error);

      return res.status(500).json({
        error: "MQTT publication failed",
      });
    }

    console.log(`✅ Vitesse publiée : ${speed} RPM`);

    return res.status(200).json({
      message: "Speed set",
      speed,
    });
  });
});

module.exports = router;
