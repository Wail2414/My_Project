//C'est la DB de tous les models(data.js,alertLog.js,notification.js,...) et du coup il établit des relations entre eux.
// models/index.js
const fs = require("fs"); //File System va nous permettre de créer et gérer des fichiers
const path = require("path"); // Il gère les chemins de fichiers et de dossiers
const { Sequelize } = require("sequelize"); //Sequelize est un ORM (Object Relationel Map ==> donc cet outil va te permettre
// d'interagir avec la Database en écrivant de Javascript au lieu de SQL Brut )de Node.js

//Connexion à PostgreSQL avec Sequelize | faire ici la sécurité (mettre dans .env le port,le host, mdp et le username)
const sequelize = new Sequelize(
  process.env.DB_NAME || "postgres",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "isib123",
  {
    port: process.env.DB_PORT || 5432,
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
  },
);

const db = {}; //donc ici on prépare un objet qui est vide pour stocker les diffèrents modèles.

fs.readdirSync(__dirname) //lit tous les fichiers du dossier, càd le dossier actuel (/models) ==> pq en synchrone et pas en asynchrone car le chargement de fichier se fait une seule fois au démarrage donc pas besoin de asynchrone !
  .filter((file) => file !== "db.js" && file.endsWith(".js")) //filtre les fichiers à garder donc ici ça fait qu'on garde les fichiers javascript et on exclut "db.js" (donc y aura les autres modèles et pas db.js qui est exclut)
  .forEach((file) => {
    //Ca va charger chaque modèle donc pour chaque fichier (data.js,alertLogs.js,etc...)
    const model = require(path.join(__dirname, file))(
      //path.join(__dirname,file), il crée un chemin absolu du fichier et require(...) import le fichier donc ce fichier va exporter une fonction.
      // on execute la fonction avec :
      sequelize, // instance de connexion *
      Sequelize.DataTypes, // pour définir les types de colonnes (c'est comme les types de données)
    );
    console.log(model); // ca va afficher les propriétés du modèle ça on verra après
    db[model.name] = model; //Ici ça ajoute le modèle dans l'objet db
  });

Object.keys(db).forEach((modelName) => {
  //Object.keys(db)==>Récupère tous les noms de modèles présents dans db et forEach==> parcourt chaque modèle
  if (db[modelName].associate) {
    // vérifie si le modèle à une méthode associate()
    db[modelName].associate(db); //appelle cette méthode pour établir les relations entre modèles.
  }
});

db.sequelize = sequelize; //l'instance de connexion * ==> oui elle est lié à la Connexion PostgreSQL avec Sequelize donc on assigne cette instance de connexion à db.sequelize
//pq on fait ça c'est parce qu'après on va import sequelize et on aura accès à la connexion PostgreSQL dans toute l'app
db.Sequelize = Sequelize; // on ajoute la classe Sequelize elle-même Sequelize

module.exports = db; //on export tout l'objet db
