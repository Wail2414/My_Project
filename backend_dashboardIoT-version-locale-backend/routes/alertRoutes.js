// routes/authRoutes.js
const express = require("express"); // on import express
const router = express.Router(); // ca me permet de définir les routes dans un module à part
const alertController = require("../controllers/alertController"); // on import alerController donc le controlleur
const authenticateToken = require("../middleware/auth"); // aussi le auth dans le middleware pour la protection à certaines routes
// le client envoie une requete GET /alerts ("/" dans la page ca va montrer GET /alerts) du coup express passe par "authenticateToken" si c'est ok alors on appelle "getLogsAlert" qui renvoie les 10 derniers alertes en JSON
// du coup ici lorsque le client appelle /alerts alors il recevra les 10 derniers alertes
router.get("/", authenticateToken, alertController.getLogsAlert);
module.exports = router; // on l'export on va l'utiliser dans le server.js pour les routes
