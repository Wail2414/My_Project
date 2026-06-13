import React from "react";
import { useParams } from "react-router-dom";
import { useDnd } from "../contexts/DndContext";
import DroppedItem from "./items/DroppedItem";
import { useDrop } from "react-dnd";

const DroppableArea = ({ mode = "editor", cursorMode = "select" }) => {
  const isEditor = mode === "editor";
  const { projectid, pageid } = useParams();

  const {
    droppedItems,
    addDroppedItem,
    updateDroppedItemPosition,
    droppedItemsRef,
  } = useDnd();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      "TEXT",
      "GAUGE",
      "NAV",
      "SLIDER",
      "CHART",
      "LED",
      "IMAGE",
      "RECTANGLE",
      "SQUARE",
      "TRIANGLE",
      "LOSANGE",
      "CIRCLE",
      "PENTAGON",
      "HEXAGON",
      "STAR",
      "ELLIPSE",
      "MOTOR",
    ],
    canDrop: () => isEditor,
    drop: (item, monitor) => {
      if (!isEditor) return;

      const offset = monitor.getClientOffset();
      const dropArea = document
        .getElementById("drop-area")
        .getBoundingClientRect();
      const offsetX = item.offset?.x || 0;
      const offsetY = item.offset?.y || 0;

      const x = offset.x - dropArea.left - offsetX;
      const y = offset.y - dropArea.top - offsetY;

      const currentDroppedItems = droppedItemsRef.current;
      const existingItem = currentDroppedItems.find(
        (droppedItem) => droppedItem.id === item.id
      );

      if (existingItem) {
        updateDroppedItemPosition(item.id, { x, y });
      } else {
        addDroppedItem(item, { x, y });
        console.log("Item dropped:", item);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleClick = (e) => {
    if (!isEditor) return;

    const boundingRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - boundingRect.left;
    const y = e.clientY - boundingRect.top;

    if (cursorMode === "select") return;

    if (cursorMode === "text") {
      addDroppedItem({
        id: Date.now().toString(),
        type: "TEXT",
        position: { x, y },
        settings: {
          title: "New text",
          fontSize: 18,
          color: "#000000",
        },
      });
      return;
    }

    if (cursorMode === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          addDroppedItem({
            id: Date.now().toString(),
            type: "IMAGE",
            position: { x, y },
            settings: {
              src: ev.target.result,
              width: 150,
              height: 150,
            },
          });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor:
          cursorMode === "text"
            ? "text"
            : cursorMode === "image"
            ? "crosshair"
            : "default",
      }}
    >
      <div
        id="drop-area"
        ref={drop}
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: isOver ? "#f9f9f9" : "white",
          position: "relative",
        }}
      >
        {droppedItems.length === 0 && (
          <p style={{ padding: "10px", color: "#aaa" }}>Drop items here</p>
        )}
        {droppedItems.map((item) => (
          <DroppedItem key={item.id} item={item} mode={mode} />
        ))}
      </div>
    </div>
  );
};

export default DroppableArea;
