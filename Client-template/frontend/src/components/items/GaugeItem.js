import React, { useContext, useState, useEffect } from "react";
import { DndProvider as BackendProvider, useDrag, useDrop } from "react-dnd";
import GaugeChart from "react-gauge-chart";
import { useDnd } from "../../contexts/DndContext";
import { useMqtt } from "../../contexts/MqttContext";
import SettingsModal from "../SettingsModal";

const GaugeItem = ({ id, style, settingsData, mode }) => {
  const isEditor = mode === "editor";
  const { removeDroppedItem, updateDroppedItemSettings } = useDnd();
  const defaultSettings = {
    title: "gauge chart",
    data_name: "test",
    min_value: 0,
    max_value: 100,
    width: 300,
    height: 200,
  };
  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...settingsData,
  });
  const { data, subscribe, unsubscribe } = useMqtt();
  useEffect(() => {
    if (settings?.data_name && id !== "1") {
      subscribe(settings.data_name);
      return () => {
        unsubscribe(settings.data_name);
      };
    }
  }, [settings.data_name]);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "GAUGE",
    item: (monitor) => {
      const clientOffset = monitor.getClientOffset();
      const element = monitor.getSourceClientOffset();
      const offset = {
        x: clientOffset.x - element.x,
        y: clientOffset.y - element.y,
      };

      return { id, offset, type: "GAUGE", settings };
    },
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleSettingsSave = (newSettings) => {
    if (
      id !== "1" &&
      settings?.data_name &&
      newSettings?.data_name &&
      newSettings.data_name !== settings.data_name
    ) {
      unsubscribe(settings.data_name);
      subscribe(newSettings.data_name);
      console.log("subscribed to", newSettings.data_name);
    }
    setSettings(newSettings);
    updateDroppedItemSettings(id, newSettings);
  };

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
    const newWidth = Math.max(20, initialWidth + (e.clientX - initialMouseX));
    const newHeight = Math.max(20, initialHeight + (e.clientY - initialMouseY));

    setSettings((prevSettings) => ({
      ...prevSettings,
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
      }}
    >
      <h3 style={{ textAlign: "center" }}>{settings.title}</h3>{" "}
      {/* Add your title here */}
      <GaugeChart
        id={`gauge-chart-${id}`}
        nrOfLevels={3}
        percent={
          !(settings.data_name in data) || id === "1"
            ? 0.6
            : data[settings.data_name] /
                (parseInt(settings.max_value) - parseInt(settings.min_value)) ||
              0
        }
        textColor="black"
        arcPadding={0.02}
        cornerRadius={3}
        arcWidth={0.3}
        colors={["#FFC371", "#FF5F6D"]}
        style={{ width: "100%", height: "100%" }}
        animate={false}
      />
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
        configurableKeys={["title", "data_name", "min_value", "max_value"]}
      />
    </div>
  );
};
export default GaugeItem;
