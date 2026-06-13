// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");
// ici dans la requete POST de "/login" le client envoie ses identifiants (email et passwd) et le serveur  verifie genere un Token JWT et l'envoie dans un cookie
router.post("/login", authController.login);
// ici dans la requete POST de "/logout" le client envoie une requete pour se deconnecter et le serveur  efface le cookie et l'action est logué dans logActivity
router.post("/logout", authenticateToken, authController.logout);
//ici dans la requete GET de "/me" sert à recuperer les infos de user sans le mdp ! mais necessite un token valide
router.get("/me", authenticateToken, authController.getUserInfo);

module.exports = router; // on export pour l'utiliser dans le server.js
