const mqtt = require("mqtt");

const client = mqtt.connect({
  host: "localhost",
  port: 1883,
  username: "technivor",
  password: "bdzaa$",
});

client.on("connect", () => {
  console.log("✅ Connecté au broker");

  client.publish("Potentiometre/NotAList", "642", {}, (err) => {
    if (err) {
      console.error("❌ Erreur d'envoi :", err);
    } else {
      console.log("✅ Message publié !");
    }
    client.end();
  });
});
