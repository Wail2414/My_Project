import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const EllipseItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    rx: 60,
    ry: 40,
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
    type: "ELLIPSE",
    item: () => ({ id, type: "ELLIPSE", settings }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMouse, setInitialMouse] = useState(null);
  const [initialSize, setInitialSize] = useState({ rx: 0, ry: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    setInitialMouse({ x: e.clientX, y: e.clientY });
    setInitialSize({ rx: settings.rx, ry: settings.ry });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const handleMouseMove = (e) => {
    const newRx = Math.max(10, initialSize.rx + (e.clientX - initialMouse.x));
    const newRy = Math.max(10, initialSize.ry + (e.clientY - initialMouse.y));

    const updated = { ...settings, rx: newRx, ry: newRy };
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

  const width = settings.rx * 2;
  const height = settings.ry * 2;

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        width,
        height,
        position: "absolute",
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
      }}
    >
      <svg width={width} height={height}>
        <ellipse
          cx={settings.rx}
          cy={settings.ry}
          rx={settings.rx}
          ry={settings.ry}
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
          "rx",
          "ry",
          "fillColor",
          "strokeColor",
          "strokeWidth",
        ]}
      />
    </div>
  );
};

export default EllipseItem;
