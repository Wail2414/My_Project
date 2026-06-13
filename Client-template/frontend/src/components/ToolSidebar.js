import React, { useState } from "react";
import ToolIconItem from "./items/ToolIconItem";
import { BsHexagon, BsPentagon } from "react-icons/bs";
import PotentiometreDisplay from "./PotentiometreDisplay";
import {
  FaTachometerAlt,
  FaFont,
  FaArrowRight,
  FaSlidersH,
  FaChartBar,
  FaLightbulb,
  FaMousePointer,
  FaImage,
  FaSquareFull,
  FaCircle,
  FaPlay,
  FaBorderAll,
  FaGem,
  FaStar,
  FaBolt,
} from "react-icons/fa";
import { PiCircleDashed } from "react-icons/pi";
import { Hexagon } from "@mui/icons-material";

const sections = [
  {
    title: "Cursor Tools",
    type: "cursor",
    items: [
      { type: "select", icon: <FaMousePointer />, label: "Select" },
      { type: "text", icon: <FaFont />, label: "Text" },
      { type: "image", icon: <FaImage />, label: "Image" },
    ],
  },
  {
    title: "Controls",
    type: "tool",
    items: [
      { type: "GAUGE", icon: <FaTachometerAlt /> },
      { type: "TEXT", icon: <FaFont /> },
      { type: "NAV", icon: <FaArrowRight /> },
      { type: "SLIDER", icon: <FaSlidersH /> },
      { type: "CHART", icon: <FaChartBar /> },
      { type: "LED", icon: <FaLightbulb /> },
      { type: "MOTOR", icon: <FaBolt /> },
    ],
  },
  {
    title: "Shapes",
    type: "shapes",
    items: [
      { type: "RECTANGLE", icon: <FaBorderAll />, label: "Rectangle" },
      { type: "SQUARE", icon: <FaSquareFull />, label: "Carré" },
      {
        type: "TRIANGLE",
        icon: <FaPlay style={{ transform: "rotate(270deg)" }} />,
        label: "Triangle",
      },
      { type: "CIRCLE", icon: <FaCircle />, label: "Cercle" },
      { type: "LOSANGE", icon: <FaGem />, label: "Losange" },
      {
        type: "PENTAGON",
        icon: <BsPentagon style={{ transform: "rotate(270deg)" }} />,
        label: "Pentagon",
      },
      {
        type: "HEXAGON",
        icon: <BsHexagon style={{ transform: "rotate(270deg)" }} />,
        label: "Hexagon",
      },
      {
        type: "STAR",
        icon: <FaStar style={{ transform: "rotate(270deg)" }} />,
        label: "Star",
      },
      {
        type: "ELLIPSE",
        icon: <PiCircleDashed style={{ transform: "rotate(270deg)" }} />,
        label: "Ellipse",
      },
    ],
  },
  {
    title: "Notifications",
    type: "notifications",
    items: [],
  },
];

const ToolSidebar = ({ mode, alerts, cursorMode, setCursorMode }) => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionTitle) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  if (mode !== "editor") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 64,
        right: 0,
        width: "240px",
        height: "calc(100% - 64px)",
        backgroundColor: "#111",
        color: "white",
        zIndex: 1000,
        overflowY: "auto",
        padding: "10px",
        boxShadow: "-2px 0px 5px rgba(0,0,0,0.5)",
      }}
    >
      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "20px" }}>
          <div
            onClick={() => toggleSection(section.title)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              padding: "8px",
              backgroundColor: "#222",
              borderRadius: "6px",
              userSelect: "none",
            }}
          >
            <span>{section.title}</span>
            <span>{openSections[section.title] ? "▲" : "▼"}</span>
          </div>

          {openSections[section.title] &&
            (section.type === "cursor" ? (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {section.items.map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setCursorMode(item.type)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor:
                        cursorMode === item.type ? "#444" : "#222",
                      borderRadius: "4px",
                      padding: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>{item.icon}</span>
                    <span style={{ fontSize: "13px" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            ) : section.type === "notifications" ? (
              <div
                style={{ padding: "8px", fontSize: "13px", marginTop: "8px" }}
              >
                {alerts?.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#888" }}>No alerts</p>
                ) : (
                  alerts.map((alert, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#222",
                        padding: "6px",
                        marginBottom: "5px",
                        borderLeft: "4px solid red",
                        borderRadius: "4px",
                      }}
                    >
                      <strong>{alert.topic}</strong>
                      <p style={{ margin: 0, fontSize: "12px" }}>
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ) : (
              section.items.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      section.type === "shapes"
                        ? "repeat(4, 1fr)"
                        : "repeat(3, 1fr)",
                    gap: "10px",
                    marginTop: "10px",
                    paddingLeft: "5px",
                  }}
                >
                  {section.items.map((item) => (
                    <div
                      key={item.type}
                      style={{
                        backgroundColor: "#222",
                        borderRadius: "3px",
                        padding: "4px",
                        textAlign: "center",
                        fontSize: "10px",
                        cursor: "grab",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#333")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#222")
                      }
                    >
                      <ToolIconItem
                        type={item.type}
                        icon={item.icon}
                        mode={mode}
                      />
                    </div>
                  ))}
                </div>
              )
            ))}
        </div>
      ))}

      <div
        style={{
          marginTop: "20px",
          backgroundColor: "#222",
          color: "black",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "12px",
        }}
      >
        <PotentiometreDisplay />
      </div>
    </div>
  );
};

export default ToolSidebar;
