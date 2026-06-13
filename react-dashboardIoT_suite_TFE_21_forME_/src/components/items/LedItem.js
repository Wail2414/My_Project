import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import { useMqtt } from "../../contexts/MqttContext";
import SettingsModal from "../SettingsModal";

const LedItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();
  const { data, publish } = useMqtt();

  const defaultSettings = {
    title: "LED",
    data_name: "test",
    ledColorOn: "#00FF00",
    ledColorOff: "#440000",
    publishTopic: "",
    width: 40,
    height: 40,
  };

  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "LED",
    item: { id, type: "LED", settings },
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getLedColor = () => {
    const value = data[settings.data_name];
    if (value === undefined || value === null) {
      return "white"; // Couleur quand il n'y a pas encore de données
    }
    const isOn =
      value === true || value === "true" || value === 1 || value === "1";
    return isOn ? settings.ledColorOn : settings.ledColorOff;
  };

  const isLedOn = () => {
    const value = data[settings.data_name];
    return value === true || value === "true" || value === 1 || value === "1";
  };

  const handleClick = () => {
    if (settings.publishTopic) {
      const newValue = isLedOn() ? "0" : "1";
      publish(settings.publishTopic, newValue);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        position: "absolute",
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "pointer",
        width: settings.width,
        height: settings.height,
      }}
    >
      <div
        onClick={handleClick}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          backgroundColor: getLedColor(),
          boxShadow: isLedOn()
            ? `0 0 12px ${settings.ledColorOn}, inset 0 0 8px #ffffff88`
            : "inset 0 0 6px #000000aa",
          border: "2px solid #222",
          transition: "background-color 0.3s, box-shadow 0.3s",
        }}
      />

      {id !== "1" && isEditor && (
        <>
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "gray",
              cursor: "nw-resize",
              position: "absolute",
              right: 0,
              bottom: 0,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const rect = e.target.parentElement.getBoundingClientRect();
              const initialX = e.clientX;
              const initialY = e.clientY;
              const initialWidth = rect.width;
              const initialHeight = rect.height;

              const handleMouseMove = (e) => {
                const newWidth = Math.max(
                  20,
                  initialWidth + (e.clientX - initialX)
                );
                const newHeight = Math.max(
                  20,
                  initialHeight + (e.clientY - initialY)
                );
                const updated = {
                  ...settings,
                  width: newWidth,
                  height: newHeight,
                };
                setSettings(updated);
                updateDroppedItemSettings(id, updated);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener(
                "mouseup",
                () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                },
                { once: true }
              );
            }}
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
        configurableKeys={[
          "title",
          "data_name",
          "ledColorOn",
          "ledColorOff",
          "publishTopic",
          "width",
          "height",
        ]}
      />
    </div>
  );
};

export default LedItem;
