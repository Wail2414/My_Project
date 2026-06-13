//enregistre une nouvelle alerte dans la base de données et affiche les 10 derniers alertes enregistré
// controllers/userActivityController.js
const { AlertLog } = require("../models/db"); //ici on import le modèle AlertLogs défini dans le fichier db.js
//ici c'est une fonction async qui va être exporté appelé logAlert
exports.logAlert = async (topic, message) => {
  try {
    await AlertLog.create({ topic, message }); // ajoute un nouveau log alerte dans la db avec les champs topic (exemple: temperature) et le message (exemple:temperature au dessus de 70°C )
  } catch (error) {
    console.error("Error logging alert:", error); // en cas d'erreur on a mis un try catch
  }
};
// ca c'est une route express qui va être exporté
exports.getLogsAlert = async (req, res) => {
  try {
    //renvoyé les 10 derniers logs d'alerte trié par date("timestamp" and "DESC" donc un timestamp décroissant = de plus récent au plus ancien)
    const alertLogs = await AlertLog.findAll({
      order: [["timestamp", "DESC"]],
      limit: 10,
    });
    res.status(200).json(alertLogs); //renvoie au client en JSON avec un status 200 ==> OK (res ==> response (réponse)==> C’est lui qui permet au serveur d’envoyer une réponse au client qui a fait une requête HTTP.)
  } catch (err) {
    res.status(500).json({ error: err }); // on a utilisé try catch en cas d'erreur et du coup en cas d'erreur on envoie vers le status 500 (Internal Server Error)
  }
};
