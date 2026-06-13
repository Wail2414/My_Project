// controllers/userActivityController.js
const { UserActivityLog } = require("../models/db"); //on import la db.js

// cette fonction async qui va être export sert à ajouter une nouvelle ligne à chaque fois un user fais une action importante
exports.logActivity = async (userId, userEmail, action, details) => {
  try {
    await UserActivityLog.create({ userId, userEmail, action, details }); // elle va insérer une nouvelle ligne dans la table UserActivityLog avec 4 champs
  } catch (error) {
    console.error("Error logging user activity:", error); // en cas d'erreur de l'insertion dans la db. (on utilise try catch pour ça)
  }
};
