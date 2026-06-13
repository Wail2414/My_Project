import React, { useContext, useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const TextItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();
  const defaultSettings = {
    title: "text item",
    fontSize: "24",
    fontColor: "black",
  };
  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TEXT",
    item: (monitor) => {
      const clientOffset = monitor.getClientOffset();
      const element = monitor.getSourceClientOffset();
      const offset = {
        x: clientOffset.x - element.x,
        y: clientOffset.y - element.y,
      };
      return { id, offset, type: "TEXT", settings };
    },
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

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          fontSize: `${settings.fontSize}px`,
          color: `${settings.fontColor}`,
        }}
      >
        {settings.title}
      </h3>
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
        configurableKeys={["title", "fontSize", "fontColor"]}
      />
    </div>
  );
};

export default TextItem;
