import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const RectangleItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    width: 120,
    height: 60,
    fillColor: "#ffffff",
    strokeColor: "#000000",
    strokeWidth: 1,
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
    type: "RECTANGLE",
    item: () => ({ id, type: "RECTANGLE", settings }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMouse, setInitialMouse] = useState(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = e.target.parentElement.getBoundingClientRect();
    setInitialMouse({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: rect.width, height: rect.height });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleMouseMove = (e) => {
    const newWidth = Math.max(
      40,
      initialSize.width + (e.clientX - initialMouse.x)
    );
    const newHeight = Math.max(
      40,
      initialSize.height + (e.clientY - initialMouse.y)
    );

    const updated = { ...settings, width: newWidth, height: newHeight };
    setSettings(updated);
    updateDroppedItemSettings(id, updated);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
  };

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        width: settings.width,
        height: settings.height,
        position: "absolute",
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
      }}
    >
      <svg width={settings.width} height={settings.height}>
        <rect
          width={settings.width}
          height={settings.height}
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
        configurableKeys={[
          "width",
          "height",
          "fillColor",
          "strokeColor",
          "strokeWidth",
        ]}
      />
    </div>
  );
};

export default RectangleItem;
