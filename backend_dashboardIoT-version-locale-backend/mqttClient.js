// mqttClient.js
const mqtt = require("mqtt");
const influx = require("./influxClient");
const { CheckData } = require("./controllers/dataController");
const WebSocket = require("ws");
const { logAlert } = require("./controllers/alertController");
const { SensorData, SensorDataList } = require("./models/db");

const MAX_ENTRIES_PER_TOPIC = 10;

const options = {
  host: "192.168.2.152",
  port: 1883,
  protocol: "mqtt",
  username: "",
  password: "",
};

let notifications = {};
let data = {};

const mqttclient = mqtt.connect(options); // 🔁 Déplacé ici pour être accessible globalement

function startMqttClient(wss) {
  mqttclient.on("connect", () => {
    console.log("✅ Connected to MQTT broker");

    mqttclient.subscribe("#", (err) => {
      if (err) console.error("❌ Erreur d'abonnement :", err);
      else console.log("✅ Abonnement au topic # réussi");
    });
  });

  mqttclient.on("message", async (topic, messageBuffer) => {
    const message = messageBuffer.toString();
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
  });

  mqttclient.on("error", (err) => {
    console.error("❌ Erreur MQTT :", err);
  });
}

// ✅ Exporter les deux
module.exports = {
  startMqttClient,
  mqttclient,
};
