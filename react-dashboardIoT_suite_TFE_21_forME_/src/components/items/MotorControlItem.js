import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";
import axios from "axios";

const MotorControlItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    title: "Commande moteur",
    data_name: "startMotor", // topic
    width: 200,
    height: 100,
  };

  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "MOTOR",
    item: () => ({ id, type: "MOTOR", settings }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  const handleStart = async () => {
    await axios.post("http://localhost:5000/api/start-motor");
  };

  const handleStop = async () => {
    await axios.post("http://localhost:5000/api/stop-motor");
  };

  // Redimensionnement
  const [initialMouseX, setInitialMouseX] = useState(null);
  const [initialMouseY, setInitialMouseY] = useState(null);
  const [initialWidth, setInitialWidth] = useState(null);
  const [initialHeight, setInitialHeight] = useState(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const elementRect = e.target.parentElement.getBoundingClientRect();
    setInitialMouseX(e.clientX);
    setInitialMouseY(e.clientY);
    setInitialWidth(elementRect.width);
    setInitialHeight(elementRect.height);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleMouseMove = (e) => {
    const newWidth = Math.max(100, initialWidth + (e.clientX - initialMouseX));
    const newHeight = Math.max(50, initialHeight + (e.clientY - initialMouseY));

    setSettings((prev) => ({
      ...prev,
      width: newWidth,
      height: newHeight,
    }));
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
  };

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
        width: `${settings.width}px`,
        height: `${settings.height}px`,
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px",
        position: "relative",
        backgroundColor: "#f4f4f4",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "8px" }}>
        {settings.title}
      </h3>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button
          onClick={handleStart}
          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
        >
          Démarrer
        </button>
        <button
          onClick={handleStop}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Arrêter
        </button>
      </div>

      {id !== "1" && isEditor && (
        <>
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "gray",
              position: "absolute",
              bottom: 0,
              right: 0,
              cursor: "nw-resize",
            }}
            onMouseDown={handleMouseDown}
          />
          <label
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "absolute",
              top: 0,
              right: 24,
              padding: "2px 5px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            ⚙
          </label>
          <label
            onClick={() => removeDroppedItem(id)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              padding: "2px 5px",
              fontSize: "12px",
              cursor: "pointer",
              color: "red",
            }}
          >
            X
          </label>
        </>
      )}

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSettingsSave}
        settings={settings}
        setSettings={setSettings}
        configurableKeys={["title"]}
      />
    </div>
  );
};

export default MotorControlItem;
