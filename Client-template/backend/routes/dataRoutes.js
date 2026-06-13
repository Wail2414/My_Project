const express = require("express");
const router = express.Router();
const influx = require("../influxClient");
const { SensorData, SensorDataList } = require("../models/db");
//const { Op } = require("sequelize");

// Get data from InfluxDB
// on crée une route
router.get("/test", async (req, res) => {
  try {
    const result = await influx.query(`
      SELECT * FROM test_data
      ORDER BY time DESC
      LIMIT 100
    `); // ici ca fait une requete influxQL qui lit les 100 derniers lignes de la measurement de "test_data" et ca trie par time décroissant
    res.json(result.reverse()); // on envoie au client en utilisant la méthode reverse() pour remettre dans l'ordre au plus ancien au plus récent
  } catch (error) {
    console.error("Error fetching data from InfluxDB:", error);
    res.status(500).json({ error: "Internal Server Error" }); // si error alors catch message error au --> console.log + envoie au client
  }
});
//ici on crée la route pour l'historique de SensorData
router.get("/history", async (req, res) => {
  const { topic, type = "NotAList" } = req.query;

  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const model = type === "IsAList" ? SensorDataList : SensorData;

  try {
    const data = await model.findAll({
      where: { topic },
      order: [["time", "DESC"]],
      limit: 100,
    });

    res.json(data);
  } catch (error) {
    console.error("Erreur lors de la lecture de l'historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Supprimer les données d’un topic
router.delete("/history/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await SensorData.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ error: "Entrée non trouvée" });
    }

    res.json({ message: "Entrée supprimée avec succès" });
  } catch (error) {
    console.error("Erreur suppression :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router; // on export pour l'utiliser dans le server.js
