// routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authenticateToken = require("../middleware/auth");

//ici on recupere tous les projets de la base de données qui sont protégé par token et on appelle getProjects pour les recupèrer
router.get("/", authenticateToken, projectController.getProjects);
//ici on crée un project et qui est protégé par token meme chose avec l'autre on appele createProject pour que ca fonctionne
router.post("/", authenticateToken, projectController.createProject);
//route pour partager un project avec un autre user
router.post(
  "/:projectId/share",
  authenticateToken,
  projectController.shareProject
);
// route pour supprimer un project
router.delete(
  "/:projectId",
  authenticateToken,
  projectController.deleteProject
);

// ca on recuperer les DroppedItems sur une page et on appele getDroppedItems pour que ca marche
router.get(
  "/:projectId/pages/:page/dropped-items",
  projectController.getDroppedItems
);
// ici on crée ou on fait une mise a jour de DroppedItems et on appele UpdateDroppedItems pour que ca marche
router.post(
  "/:projectId/pages/:page/dropped-items",
  projectController.UpdateDroppedItems
);
// ca on recupere les data dans la table Data avec les données de projectId et les topics et on appele getProjectData pour que ca marche
router.post("/:projectId/data", projectController.getProjectData);
// ici on met à jour le minLim et le maxLim de topics
router.put("/:projectId/data", projectController.updateProjectData);

module.exports = router; // on l'export
