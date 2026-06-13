import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const CircleItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    radius: 50,
    strokeColor: "black",
    strokeWidth: 1,
    fillColor: "white",
  };

  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      ...settingsData,
    }));
  }, [settingsData]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CIRCLE",
    item: () => ({ id, type: "CIRCLE", settings }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMouse, setInitialMouse] = useState(null);
  const [initialRadius, setInitialRadius] = useState(null);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setInitialMouse({ x: e.clientX });
    setInitialRadius(settings.radius);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleMouseMove = (e) => {
    const delta = e.clientX - initialMouse.x;
    const newRadius = Math.max(10, initialRadius + delta);
    const updated = { ...settings, radius: newRadius };
    setSettings(updated);
    updateDroppedItemSettings(id, updated);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
  };

  const diameter = settings.radius * 2;

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        width: diameter,
        height: diameter,
        position: "absolute",
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
      }}
    >
      <svg width={diameter} height={diameter}>
        <circle
          cx={settings.radius}
          cy={settings.radius}
          r={settings.radius}
          fill={settings.fillColor}
          stroke={settings.strokeColor}
          strokeWidth={settings.strokeWidth}
        />
      </svg>

      {isEditor && id !== "1" && (
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
        configurableKeys={["radius", "fillColor", "strokeColor", "strokeWidth"]}
      />
    </div>
  );
};

export default CircleItem;
