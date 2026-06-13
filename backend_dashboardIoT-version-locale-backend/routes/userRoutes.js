// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/auth");
// ici cette route c'est pour la creation d'un user, protégé par token et appelle la fonction "createUser"
router.post("/create", authenticateToken, userController.createUser);
// ici on recupere la liste des users protégé par token
router.get("/", authenticateToken, userController.getUsers);
//ici on supprime le user via son ID
router.delete("/:id", authenticateToken, userController.deleteUser);
// ici on recupere les logs d'activité de user
router.get("/logs", authenticateToken, userController.getUserActivityLogs);
module.exports = router; // on l'export
