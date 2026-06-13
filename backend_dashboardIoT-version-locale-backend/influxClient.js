// influxClient.js
const Influx = require('influx');

const influx = new Influx.InfluxDB({
  host: '192.168.1.63',
  database: 'mqtt_data',
  username: 'technivor', // Replace with your admin username
  password: 'bdzaa$', // Replace with your admin password
  port: 8086,
});

module.exports = influx;
