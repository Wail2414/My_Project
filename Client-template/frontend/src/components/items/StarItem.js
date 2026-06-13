import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useDnd } from "../../contexts/DndContext";
import SettingsModal from "../SettingsModal";

const StarItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();

  const defaultSettings = {
    size: 100,
    strokeColor: "black",
    strokeWidth: 1,
    fillColor: "transparent",
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
    type: "STAR",
    item: () => ({ id, type: "STAR", settings }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMouse, setInitialMouse] = useState(null);
  const [initialSize, setInitialSize] = useState(null);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

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

  // Génère les points d’une étoile à 5 branches
  const getStarPoints = (cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    let path = "";

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      path += `${x},${y} `;
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      path += `${x},${y} `;
      rot += step;
    }
    return path.trim();
  };

  const size = settings.size;
  const center = size / 2;
  const outer = size / 2;
  const inner = size / 4;

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        width: size,
        height: size,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
        position: "absolute",
      }}
    >
      <svg width={size} height={size}>
        <polygon
          points={getStarPoints(center, center, 5, outer, inner)}
          stroke={settings.strokeColor}
          strokeWidth={settings.strokeWidth}
          fill={settings.fillColor}
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
        configurableKeys={["size", "strokeColor", "strokeWidth", "fillColor"]}
      />
    </div>
  );
};

export default StarItem;
