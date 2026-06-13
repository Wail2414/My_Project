// Step 4: Use the Chart Component in App.js
import React, { useEffect } from 'react';
import ChartComponent from '../components/ChartComponent';
import mqtt from 'mqtt';
import ItemLayout from '../components/ItemLayout';
import "./Project.css";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Project = () => {
  return (
      <ItemLayout/>
  )
  /*
  const [messages, setMessages] = React.useState([]);
  useEffect(() => {
    // Initialize the MQTT client
    const mqttClient = mqtt.connect('wss://api.technivor.net/ws',{
      username: 'technivor',
      password: 'bdzaa$'
    });

    // Handle connection
    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker via Websockets');
      mqttClient.subscribe('test', (err) => {
        if (err) {
          console.error('Error subscribing to topic:', err);
        } else {
          console.log('Subscribed to test');
        }
      });
    });

    // Handle incoming messages
    mqttClient.on('message', (topic, value) => {
      const time = new Date().toISOString();
      setData((prevData) => [...prevData, { topic, value, time }]);
    });

    // Handle errors
    mqttClient.on('error', (err) => {
      console.error('Connection error:', err);
    });

    // Handle disconnection
    mqttClient.on('close', () => {
      console.log('Connection closed');
    });

    // Cleanup on unmount
    return () => {
      mqttClient.end();
      console.log('Disconnected from MQTT broker');
    };
  }, []);
  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000).toISOString();
  const filteredData = data.filter(msg => msg.time > oneHourAgo);
  return (
    <div className="App">
      <header className="App-header">
        <ChartComponent data={filteredData}/>
      </header>
    </div>
  );*/
}

export default Project;