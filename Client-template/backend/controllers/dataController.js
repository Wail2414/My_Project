// CheckData(topic,value) c'est une fonction qui vérifie si la valeur reçue d'un capteur MQTT est en dehors d'une plage limite définie dans un widget CHART.
const { ProjectPage } = require("../models/db"); //Ici on récupère le modèle Sequelize

//Fonction async qui prend un topic MQTT (topic(sujet) organise les messages et permet aux clients de s'abonner à certains types de données par exemple "capteur1/salle1" d ) et une value (la valeur envoyée par le capteur exemple "42") et puis on peut l'exports
exports.CheckData = async (topic, value) => {
  try {
    //var notification = null; //initialisation de la variable notification
    const projectPages = await ProjectPage.findAll(); //c'est une méthode de Sequelize qui permet de récuperer toutes les lignes d'une table
    /*projectPages.forEach((element) => {
      if (element.droppedItems.length !== 0) {
        element.droppedItems.forEach((item) => {
          if (
            item.type === "CHART" &&
            item.settings.data_name === topic.split("/")[0]
          ) {
            const minLimit = parseInt(item.settings.minLimit);
            const maxLimit = parseInt(item.settings.maxLimit);
            if (parseInt(value) < minLimit || parseInt(value) > maxLimit) {
              console.log("notification sent for " + topic);
              notification = {
                success: false,
                notification:
                  ("notification",
                  topic +
                    " not in range : value " +
                    value +
                    " should be between " +
                    minLimit +
                    " and " +
                    maxLimit +
                    "."),
              };
              return;
            }
          }
        });
      }
      if (notification) return;
    });*/
    //tu parcours chaque projectPages (chaque element est un projectPages)
    for (const element of projectPages) {
      //Si la taille de  droppedItems (vu que c'est un tableau de widgets) est différents de 0 alors ça rentre
      if (element.droppedItems.length !== 0) {
        //tu parcours tous les widgets
        for (const item of element.droppedItems) {
          if (
            // les widgets de type CHART
            item.type === "CHART" &&
            //le data_name correspond au nom de capteur et ici topic.split("/") ça découpe la chaine en plusieurs morceaux, là où il y a des "/" donc ici topic.split("/")[0] il prend le premier élément du tableau obtenu après le split.
            item.settings.data_name === topic.split("/")[0]
          ) {
            const minLimit = parseInt(item.settings.minLimit); // conversion en int la valeur en string de minLimit du capteur ==> oublie parseInt(...) c'est une méthode qui convertit de String vers en int
            const maxLimit = parseInt(item.settings.maxLimit); // conversion en int la valeur en string de maxLimit du capteur
            const numericValue = parseInt(value); // ca convertit la value de MQTT de string en int.
            //ici on verifie la value de MQTT s'il est en dehors de la plage entre minLimit et maxLimit alors ca lance une alerte
            if (numericValue < minLimit || numericValue > maxLimit) {
              console.log("notification sent for " + topic); //ici ca envoye le truc "capteur1/salle1" ==> "notification sent for capteur1/salle1" s'il est compris dans la plage bien sûr
              return {
                success: false,
                topic,
                message: `⚠️ ${topic} out of range: ${numericValue} not in [${minLimit}, ${maxLimit}]`,
              }; // ici en return ==> genre si c'est en dehors de la plage minLimit et maxLimit alors success: false ==> indique qu'il y a un problème, topic ici c'est le nom de capteur concerné et message ici c'est un text clair d'alerte
            }
          }
        }
      }
    }

    return null;
  } catch (err) {
    //console.log(err)
    return null;
    //return notification;
  }
};
