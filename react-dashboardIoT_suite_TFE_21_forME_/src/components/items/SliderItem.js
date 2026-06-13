import React, { useState, useRef } from "react";
import { useDrag } from "react-dnd";
import axios from "axios";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const SliderItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();
  const isSliderHovered = useRef(false);

  const defaultSettings = {
    title: "Contrôle Vitesse Moteur",
    minimum_value: "0",
    maximum_value: "300",
  };

  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });

  const [sliderValue, setSliderValue] = useState(300);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SLIDER",
    item: () => ({
      id,
      type: "SLIDER",
      settings,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => isEditor && !isSliderHovered.current,
  }));

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
  };

  const handleMouseUp = async () => {
    try {
      await axios.post("http://localhost:5000/api/set-speed", {
        speed: sliderValue,
      });
      console.log("Speed sent:", sliderValue);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la vitesse :", error);
    }
  };

  const handleSliderHovered = () => {
    isSliderHovered.current = true;
  };

  const handleSliderLeaved = () => {
    isSliderHovered.current = false;
  };

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
        padding: "10px",
        backgroundColor: "#f2f2f2",
        borderRadius: "8px",
        boxShadow: "0px 0px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        {settings.title}
      </h3>

      <input
        type="range"
        min={settings.minimum_value}
        max={settings.maximum_value}
        value={sliderValue}
        onChange={handleSliderChange}
        onMouseUp={handleMouseUp}
        onMouseEnter={handleSliderHovered}
        onMouseLeave={handleSliderLeaved}
        style={{ width: "100%" }}
      />

      <div style={{ textAlign: "center", marginTop: "5px" }}>
        Vitesse : {sliderValue} RPM
      </div>

      {id !== "1" && isEditor && (
        <>
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
        configurableKeys={["title", "minimum_value", "maximum_value"]}
      />
    </div>
  );
};

export default SliderItem;
