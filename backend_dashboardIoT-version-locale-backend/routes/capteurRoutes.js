const express = require("express");
const router = express.Router();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const NODE_RED_URL = "http://192.168.2.144:1880";
const TARGET_FLOW_ID = "d4a5a928e8f97ebf"; // à généraliser plus tard

// Ajouter un capteur
router.post("/add-capteur", async (req, res) => {
  const { name, dataType } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Nom invalide" });
  }

  const allowedTypes = ["Coil", "Input", "HoldingRegister", "InputRegister"];
  if (!allowedTypes.includes(dataType)) {
    return res
      .status(400)
      .json({ success: false, message: "Type Modbus invalide" });
  }

  try {
    const topicName = name.trim();
    const modbusReadId = uuidv4().slice(0, 8);

    // 🔽 Récupérer le flow actuel
    const flowRes = await axios.get(`${NODE_RED_URL}/flow/${TARGET_FLOW_ID}`);
    const currentFlow = flowRes.data;

    if (!currentFlow || !currentFlow.nodes) {
      throw new Error(
        `❌ Le flow ${TARGET_FLOW_ID} est introuvable ou mal formé.`,
      );
    }

    // 🔒 Vérifie si ce capteur existe déjà
    if (currentFlow.nodes.some((n) => n.topic === topicName)) {
      return res
        .status(400)
        .json({ success: false, message: "Ce capteur existe déjà." });
    }

    // 📐 Calcul Y dynamique pour ne pas superposer
    const modbusNodes = currentFlow.nodes.filter(
      (n) => n.type === "modbus-read" && typeof n.y === "number",
    );

    let newY = 560;
    if (modbusNodes.length > 0) {
      const lastY = Math.max(...modbusNodes.map((n) => n.y));
      newY = lastY + 100;
    }

    // 🧱 Création du node modbus-read
    const modbusReadNode = {
      id: modbusReadId,
      type: "modbus-read",
      z: TARGET_FLOW_ID,
      name: topicName,
      topic: topicName,
      showStatusActivities: false,
      logIOActivities: false,
      showErrors: false,
      showWarnings: true,
      unitid: "1",
      dataType: dataType,
      adr: "0",
      quantity: "1",
      rate: "500",
      rateUnit: "ms",
      delayOnStart: true,
      startDelayTime: "2",
      server: "6d3b5d40d80741bd", // ton serveur modbus
      useIOFile: false,
      ioFile: "",
      useIOForPayload: false,
      emptyMsgOnFail: false,
      x: 200,
      y: newY,
      wires: [["5796c22f0d20b31c", "c987e4dc6d2d57a8"]], // NotAList & IsAList
    };

    // 🔄 Ajout dans le flow et update
    currentFlow.nodes.push(modbusReadNode);
    await axios.put(`${NODE_RED_URL}/flow/${TARGET_FLOW_ID}`, currentFlow);

    res.status(200).json({ success: true, message: "Capteur ajouté" });
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Supprimer un capteur
router.delete("/delete-capteur/:topic(*)", async (req, res) => {
  const topicToDelete = req.params.topic;
  console.log("➡️ Topic à supprimer :", topicToDelete);
  try {
    const flowRes = await axios.get(`${NODE_RED_URL}/flow/${TARGET_FLOW_ID}`);
    const currentFlow = flowRes.data;

    if (!currentFlow || !currentFlow.hasOwnProperty("nodes")) {
      return res
        .status(404)
        .json({ success: false, message: "Flow non trouvé" });
    }

    const nodesAfterDeletion = currentFlow.nodes.filter(
      (node) => node.topic !== topicToDelete,
    );

    if (nodesAfterDeletion.length === currentFlow.nodes.length) {
      return res.status(404).json({
        success: false,
        message: "Aucun capteur trouvé avec ce topic",
      });
    }

    currentFlow.nodes = nodesAfterDeletion;
    await axios.put(`${NODE_RED_URL}/flow/${TARGET_FLOW_ID}`, currentFlow);

    res.status(200).json({ success: true, message: "Capteur supprimé" });
  } catch (err) {
    console.error("❌ Erreur suppression capteur :", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Lister tous les capteurs disponibles
router.get("/list", async (req, res) => {
  try {
    const flowRes = await axios.get(`${NODE_RED_URL}/flow/${TARGET_FLOW_ID}`);
    const currentFlow = flowRes.data;

    if (!currentFlow || !currentFlow.hasOwnProperty("nodes")) {
      return res
        .status(404)
        .json({ success: false, message: "Flow non trouvé" });
    }

    const topics = currentFlow.nodes
      .filter((node) => node.type === "modbus-read" && node.topic)
      .map((node) => [`${node.topic}/NotAList`, `${node.topic}/IsAList`])
      .flat();

    res.status(200).json(topics);
  } catch (err) {
    console.error("❌ Erreur récupération topics :", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
