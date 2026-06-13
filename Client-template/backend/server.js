// backend/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const https = require("https");
const fs = require("fs");
const WebSocket = require("ws");
const { startMqttClient } = require("./mqttClient");
//require("./mqttClient");

// creation de l'app
const app = express();
const PORT = 5000;

//
const { User } = require("./models/db");
const { sequelize } = require("./models/db");
const seedAdmin = require("./seeders/seedAdmin");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const dataRoutes = require("./routes/dataRoutes");
const alertRoutes = require("./routes/alertRoutes");
const capteurRoutes = require("./routes/capteurRoutes");
const motorRoutes = require("./routes/motorRoutes");

//on autorise l'appel depuis localhost:3000 (frontend) et on autorise les cookies dans les requêtes cross-origin (credentials: true)
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000", //"https://c.technivor.net"
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// on active le support cookie et le parsing automatique
app.use(cookieParser());
app.use(bodyParser.json());

// on déclare les routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/capteur", capteurRoutes);
app.use("/api", motorRoutes);

// création du serveur HTTPS
/*const server = https.createServer(
  {
    key: fs.readFileSync("./ssl/localhost.key"),
    cert: fs.readFileSync("./ssl/localhost.crt"),
  },
  app
);*/
// Par ceci :
const server = app.listen(5000, () => {
  console.log("✅ HTTP backend running on http://localhost:5000");
});
// création du serveur WebSocket sécurisé sur /ws && wss.clients contient tous les clients WebSocket connectés
const wss = new WebSocket.Server({ server, path: "/ws" });
//cette partie c'est a chaque qu'un client de Frontend se connecte sur le BackEnd via WebSocket
wss.on("connection", (ws) => {
  console.log("🟢 Client WebSocket connecté");
});

// exporter le wss pour le mqttClient
module.exports.wss = wss;

// lancement de serveur + sync de DB
sequelize
  .sync({ alter: true, force: false })
  .then(async () => {
    console.log("Database synced");

    await seedAdmin();

    startMqttClient(wss);
    console.log("MQTT client started after DB sync");
  })
  .catch((error) => {
    console.log("unable to sync database:", error);
  });

/*// backend/server.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
// creation de l'app
const app = express();
const PORT = 5000;
//
const { User } = require("./models/db");
//

const { sequelize } = require("./models/db");
const seedAdmin = require("./seeders/seedAdmin");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const dataRoutes = require("./routes/dataRoutes");
const alertRoutes = require("./routes/alertRoutes");
const mqttClient = require("./mqttClient");

//on autorise l'appel depuis localhost:3000 (frontend) et on autorise les cookies dans les requêtes cross-origin (credentials: true)
const corsOptions = {
  origin: [
    "http://localhost:3000",
    //"https://c.technivor.net",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
// on active le support cookie et le parsing automatique
app.use(cookieParser());
app.use(bodyParser.json());

// on déclare les routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
// lancement de serveur + sync de DB
//Start The Server
// alter:true ==> adapte les tables aux modèles sans tout casser
// forcde:false ==> ne supprime pas les données existante (très important)
// puis on appelle seedAdmin() pour créer un admin par défaut si aucun n'existe
// puis on demarre le serveur avec app.listen()
sequelize
  .sync({ alter: true, force: false })
  .then(async () => {
    console.log("Database synced");
    await seedAdmin();
    /*const user = await User.findByPk(6);
    if (user) {
      const { password, ...userInfo } = user.toJSON();
      console.log("Admin user info:", userInfo);
    } else {
      console.log("User not found");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("unable to sync database:", error);
  }); */
