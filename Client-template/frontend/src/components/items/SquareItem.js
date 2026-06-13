import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const SquareItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    title: "",
    backgroundColor: "white",
    size: 60,
    borderColor: "black",
    borderWidth: 1,
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
    type: "SQUARE",
    item: () => ({ id, type: "SQUARE", settings }),
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

  const [initialMouse, setInitialMouse] = useState(null);
  const [initialSize, setInitialSize] = useState(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = e.target.parentElement.getBoundingClientRect();
    setInitialMouse({ x: e.clientX, y: e.clientY });
    setInitialSize(rect.width);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleMouseMove = (e) => {
    const delta = Math.max(20, initialSize + (e.clientX - initialMouse.x));
    const newSettings = { ...settings, size: delta };
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
  };

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        width: settings.size,
        height: settings.size,
        backgroundColor: settings.backgroundColor,
        border: `${settings.borderWidth}px solid ${settings.borderColor}`,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
        position: "absolute",
      }}
    >
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
          "size",
          "backgroundColor",
          "borderColor",
          "borderWidth",
        ]}
      />
    </div>
  );
};

export default SquareItem;
