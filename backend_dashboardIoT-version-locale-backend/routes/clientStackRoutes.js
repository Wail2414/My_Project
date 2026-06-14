const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const projectRoot = path.join(__dirname, "..", "..");

let clients = [];

function loadClientsFromComposeFiles() {
  const files = fs.readdirSync(projectRoot);

  clients = files
    .filter(
      (file) =>
        file.startsWith("docker-compose.client-") && file.endsWith(".yaml"),
    )
    .map((file, index) => {
      const clientName = file
        .replace("docker-compose.", "")
        .replace(".yaml", "");

      return {
        name: clientName,
        frontendUrl: `http://192.168.0.138:${3001 + index}`,
        backendUrl: `http://192.168.0.138:${5001 + index}`,
        composeFile: file,
      };
    });
}

loadClientsFromComposeFiles();

function generateCompose(clientName, index) {
  const frontendPort = 3001 + index;
  const backendPort = 5001 + index;
  const dbPort = 5433 + index;
  const mqttPort = 1884 + index;

  return `name: ${clientName.replace(/-/g, "")}

services:
  frontend-${clientName}:
    build:
      context: ./Client-template/frontend
      args:
        REACT_APP_FRONTEND_URL: http://192.168.0.138:${frontendPort}
        REACT_APP_API_URL: http://192.168.0.138:${backendPort}/api
        REACT_APP_WS_URL: ws://192.168.0.138:${backendPort}/ws
    container_name: frontend-${clientName}
    ports:
      - "${frontendPort}:80"
    depends_on:
      - backend-${clientName}

  backend-${clientName}:
    build:
      context: ./Client-template/backend
    container_name: backend-${clientName}
    ports:
      - "${backendPort}:5000"
    environment:
      FRONTEND_URL: http://192.168.0.138:${frontendPort}
      DB_HOST: database-${clientName}
      DB_PORT: 5432
      DB_NAME: postgres
      DB_USER: postgres
      DB_PASSWORD: isib123
      MQTT_HOST: 192.168.0.138
      MQTT_PORT: 1883
      ADMIN_EMAIL: admin@example.com
      ADMIN_PASSWORD: admin123
      JWT_SECRET: your_secret_key
    depends_on:
      - database-${clientName}

  database-${clientName}:
    image: postgres:16
    container_name: database-${clientName}
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: isib123
    ports:
      - "${dbPort}:5432"
    volumes:
      - postgres_${clientName.replace(/-/g, "_")}_data:/var/lib/postgresql/data

volumes:
  postgres_${clientName.replace(/-/g, "_")}_data:
`;
}

router.get("/", (req, res) => {
  res.json(clients);
});

router.post("/create", (req, res) => {
  const { clientName } = req.body;

  if (!clientName) {
    return res.status(400).json({
      success: false,
      message: "Nom client requis",
    });
  }

  const cleanClientName = clientName.toLowerCase().trim().replace(/\s+/g, "-");

  const exists = clients.find((client) => client.name === cleanClientName);

  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Client existe déjà",
    });
  }

  const index = clients.length;
  const composeFile = `docker-compose.${cleanClientName}.yaml`;
  const composePath = path.join(projectRoot, composeFile);
  const composeContent = generateCompose(cleanClientName, index);

  fs.writeFileSync(composePath, composeContent);

  exec(
    `docker compose -f ${composeFile} up -d --build`,
    { cwd: projectRoot },
    (error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      const frontendPort = 3001 + index;
      const backendPort = 5001 + index;

      const newClient = {
        name: cleanClientName,
        frontendUrl: `http://192.168.0.138:${frontendPort}`,
        backendUrl: `http://192.168.0.138:${backendPort}`,
        composeFile,
      };

      clients.push(newClient);

      res.json({
        success: true,
        message: `${cleanClientName} créé et démarré`,
        client: newClient,
      });
    },
  );
});

router.post("/:clientName/start", (req, res) => {
  const { clientName } = req.params;
  const composeFile = `docker-compose.${clientName}.yaml`;

  exec(
    `docker compose -f ${composeFile} up -d`,
    { cwd: projectRoot },
    (error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      res.json({
        success: true,
        message: `${clientName} démarré`,
      });
    },
  );
});

router.post("/:clientName/stop", (req, res) => {
  const { clientName } = req.params;
  const composeFile = `docker-compose.${clientName}.yaml`;

  exec(
    `docker compose -f ${composeFile} stop`,
    { cwd: projectRoot },
    (error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      res.json({
        success: true,
        message: `${clientName} arrêté`,
      });
    },
  );
});

router.delete("/:clientName", (req, res) => {
  const { clientName } = req.params;
  const composeFile = `docker-compose.${clientName}.yaml`;
  const composePath = path.join(projectRoot, composeFile);

  exec(
    `docker compose -f ${composeFile} down -v --rmi all`,
    { cwd: projectRoot },
    (error) => {
      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      if (fs.existsSync(composePath)) {
        fs.unlinkSync(composePath);
      }

      clients = clients.filter((client) => client.name !== clientName);

      res.json({
        success: true,
        message: `${clientName} supprimé complètement`,
      });
    },
  );
});

module.exports = router;
