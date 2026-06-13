import React, { useState, useEffect } from "react";
import { DndProvider as BackendProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Button } from "@mui/material";
import { DndProvider } from "../contexts/DndContext";
import { useParams } from "react-router-dom";
import axios from "../axiosConfig";

import DroppableArea from "./DroppableArea";
import ProjectAdmin from "../pages/ProjectAdmin";
import ToolIconItem from "./items/ToolIconItem";
import ToolSidebar from "./ToolSidebar";
import { useSidebar } from "../contexts/SidebarContext";
import "./ItemLayout.css";

const ItemLayout = () => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const { projectid, pageid } = useParams();
  const { open } = useSidebar();
  const [mode, setMode] = useState("editor");
  const [cursorMode, setCursorMode] = useState("select"); // valeurs : select | text | image ...

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("/alerts", { withCredentials: true });
        setAlerts(response.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <DndProvider>
      <BackendProvider backend={HTML5Backend}>
        <div className={`main-container ${!open ? "sidebar-collapsed" : ""}`}>
          {/* Contenu principal */}
          {pageid === "0" ? (
            <ProjectAdmin />
          ) : (
            <div
              style={{ width: "100%", padding: "10px", position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: mode === "editor" ? "260px" : "20px",
                  transition: "right 0.3s",
                  zIndex: 1001,
                }}
              >
                <Button
                  variant="contained"
                  color={mode === "editor" ? "success" : "error"}
                  onClick={() =>
                    setMode((prev) => (prev === "editor" ? "user" : "editor"))
                  }
                >
                  {mode === "editor" ? "🛠️ Mode Editor" : "👀 Mode User"}
                </Button>
              </div>
              <DroppableArea mode={mode} cursorMode={cursorMode} />
              <ToolSidebar
                mode={mode}
                alerts={alerts}
                cursorMode={cursorMode}
                setCursorMode={setCursorMode}
              />
            </div>
          )}
        </div>
      </BackendProvider>
    </DndProvider>
  );
};

export default ItemLayout;
