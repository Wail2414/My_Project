// components/ToolIconItem.js
import React from "react";
import { useDrag } from "react-dnd";
import { Tooltip } from "@mui/material";
import { GiHexagon } from "react-icons/gi";
import {
  FaChartLine,
  FaFont,
  FaSlidersH,
  FaTachometerAlt,
  FaArrowRight,
  FaLightbulb,
  FaBolt,
} from "react-icons/fa";

const iconMap = {
  CHART: <FaChartLine />,
  TEXT: <FaFont />,
  SLIDER: <FaSlidersH />,
  GAUGE: <FaTachometerAlt />,
  NAV: <FaArrowRight />,
  LED: <FaLightbulb />,
  MOTOR: <FaBolt />,
};

const ToolIconItem = ({ type, icon, mode }) => {
  const isEditor = mode === "editor";

  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: () => ({
      type,
      id: Date.now().toString(),
      settings: {},
      offset: { x: 0, y: 0 },
    }),
    canDrag: () => isEditor,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const displayedIcon = icon || iconMap[type] || type;

  return (
    <Tooltip title={type} placement="top">
      <div
        ref={drag}
        data-tool={type}
        style={{
          opacity: isDragging ? 0.4 : 1,
          fontSize: "24px",
          margin: "10px",
          cursor: isEditor ? "grab" : "not-allowed",
          textAlign: "center",
        }}
      >
        {displayedIcon}
      </div>
    </Tooltip>
  );
};

export default ToolIconItem;
