// mqttClient.js
const mqtt = require("mqtt");
const WebSocket = require("ws");
const { SensorData, SensorDataList } = require("./models/db");

const MAX_ENTRIES_PER_TOPIC = 10;

let notifications = {};
let data = {};
let mqttclient = null;

function startMqttClient(wss) {
  const options = {
    host: process.env.MQTT_HOST,
    port: Number(process.env.MQTT_PORT) || 1883,
    protocol: "mqtt",
    username: process.env.MQTT_USERNAME || "",
    password: process.env.MQTT_PASSWORD || "",
  };

  console.log("MQTT OPTIONS =", options);

  mqttclient = mqtt.connect(options);

  mqttclient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");

    mqttclient.subscribe("#", (err) => {
      if (err) console.error("❌ Erreur d'abonnement :", err);
      else console.log("✅ Abonnement au topic # réussi");
    });
  });

  mqttclient.on("message", async (topic, messageBuffer) => {
    try {
      const message = messageBuffer.toString();
      console.log("📩 MQTT reçu :", topic, message);

      const topicParts = topic.split("/");
      let update = {};

      if (topic !== "notification" && topicParts.length >= 2) {
        const type = topicParts.pop();
        const topicName = topicParts.join("/");
        const topicKey = `${topicName}/${type}`;

        if (type === "NotAList") {
          let rawValue;

          try {
            rawValue = JSON.parse(message);
          } catch {
            rawValue = message;
          }

          update = { [topicKey]: rawValue };

          await SensorData.create({
            time: new Date(),
            topic: topicName,
            value: rawValue,
            userId: null,
          });

          const entries = await SensorData.findAll({
            where: { topic: topicName },
            order: [["time", "DESC"]],
            offset: MAX_ENTRIES_PER_TOPIC,
          });

          if (entries.length > 0) {
            const idsToDelete = entries.map((entry) => entry.id);
            await SensorData.destroy({ where: { id: idsToDelete } });
          }
        } else if (type === "IsAList") {
          const value = parseFloat(message);
          const prev = Array.isArray(data[topicKey]) ? data[topicKey] : [];
          const timestamp = new Date();

          update = { [topicKey]: [...prev, { time: timestamp, value }] };

          await SensorDataList.create({
            time: timestamp,
            topic: topicName,
            value,
            userId: null,
          });

          const oldEntries = await SensorDataList.findAll({
            where: { topic: topicName },
            order: [["time", "DESC"]],
            offset: 100,
          });

          if (oldEntries.length > 0) {
            const ids = oldEntries.map((e) => e.id);
            await SensorDataList.destroy({ where: { id: ids } });
          }
        }

        data = { ...data, ...update };
      } else if (topic === "notification") {
        const notifKey = message.split(" ")[0];
        update = { [notifKey]: message };
        notifications = { ...notifications, ...update };
      }

      const payload = { topic, message, update };
      const payloadStr = JSON.stringify(payload);

      if (wss && wss.clients) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payloadStr);
          }
        });
      }
    } catch (err) {
      console.error("❌ Erreur traitement MQTT :", err.message);
    }
  });

  mqttclient.on("error", (err) => {
    console.error("❌ Erreur MQTT :", err.message);
  });

  mqttclient.on("reconnect", () => {
    console.log("🔁 MQTT reconnexion...");
  });

  mqttclient.on("close", () => {
    console.log("🔌 MQTT connexion fermée");
  });
}

function getMqttClient() {
  return mqttclient;
}

module.exports = {
  startMqttClient,
  getMqttClient,
};
