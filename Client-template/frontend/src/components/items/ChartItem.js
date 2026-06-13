import React, { useEffect, useState } from "react";
import { useDnd } from "../../contexts/DndContext";
import { useMqtt } from "../../contexts/MqttContext";
import { useDrag } from "react-dnd";
import SettingsModal from "../SettingsModal";
import ChartComponent from "../ChartComponent";
import BarChartComponent from "../BarChartComponent";
import AreaChartComponent from "../AreaChartComponent";

const ChartItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();
  const { data } = useMqtt();

  const defaultSettings = {
    title: "Chart",
    data_name: "test",
    chart_type: "line",
    minLimit: 25,
    maxLimit: 75,
    minValue: 0,
    maxValue: 100,
    width: 300,
    height: 200,
  };

  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });

  const [{ isDragging }, drag] = useDrag({
    type: "CHART",
    item: () => ({
      id,
      type: "CHART",
      offset: { x: 0, y: 0 },
      settings,
    }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    const elementRect = e.target.parentElement.getBoundingClientRect();
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialWidth = elementRect.width;
    const initialHeight = elementRect.height;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(
        100,
        initialWidth + (e.clientX - initialMouseX)
      );
      const newHeight = Math.max(
        100,
        initialHeight + (e.clientY - initialMouseY)
      );
      setSettings((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      updateDroppedItemSettings(id, settings);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, { once: true });
  };

  const chartData =
    id !== "1" && Array.isArray(data[settings.data_name])
      ? data[settings.data_name]
      : [];

  return (
    <div
      ref={isEditor ? drag : null}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: isEditor ? "move" : "default",
        width: `${settings.width}px`,
        height: `${settings.height}px`,
        position: "absolute",
        backgroundColor: "#1e1e1e",
        color: "#e0e0e0",
        borderRadius: "8px",
        border: "1px solid #333",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          backgroundColor: "#262626",
          padding: "4px 8px",
          fontSize: "14px",
          fontWeight: "bold",
          borderBottom: "1px solid #444",
          textAlign: "center",
          color: "#e0e0e0",
        }}
      >
        {settings.title}
      </div>

      <div style={{ flex: 1 }}>
        {settings.chart_type === "bar" ? (
          <BarChartComponent data={chartData} settings={settings} />
        ) : settings.chart_type === "area" ? (
          <AreaChartComponent data={chartData} settings={settings} />
        ) : (
          <ChartComponent data={chartData} settings={settings} />
        )}
      </div>

      {isEditor && id !== "1" && (
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
              zIndex: 10,
            }}
            onMouseDown={handleMouseDown}
          />

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              position: "absolute",
              top: 5,
              right: 30,
              background: "none",
              color: "#ccc",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ⚙
          </button>

          <button
            onClick={() => removeDroppedItem(id)}
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              background: "none",
              color: "#f55",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            ✖
          </button>
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
          "chart_type",
          "minLimit",
          "maxLimit",
          "minValue",
          "maxValue",
          "width",
          "height",
        ]}
      />
    </div>
  );
};

export default ChartItem;
