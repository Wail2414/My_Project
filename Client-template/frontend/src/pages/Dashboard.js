import React, { useState, useEffect } from "react";
import axios from "../axiosConfig"; // Import your Axios instance
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const { open } = useSidebar();

  useEffect(() => {
    // Fetch projects from backend when component mounts
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/projects", {
          withCredentials: true,
        });
        console.log(response);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // Handle error (show message, etc.)
      }
    };

    fetchProjects();
  }, []);
  const handleShare = async (projectId) => {
    const targetEmail = prompt(
      "Entrez l'adresse email de l'utilisateur avec qui partager ce projet :"
    );
    if (!targetEmail) return;

    try {
      await axios.post(
        `/projects/${projectId}/share`,
        { targetEmail },
        { withCredentials: true }
      );
      alert("Projet partagé avec succès !");
    } catch (error) {
      console.error("Erreur lors du partage :", error.response?.data || error);
      alert(
        "Erreur : " +
          (error.response?.data?.message || "Une erreur est survenue")
      );
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await axios.delete(`/projects/${projectId}`, { withCredentials: true });
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <Box
      p={3}
      sx={{ marginLeft: open ? "0px" : "-240px", transition: "margin 0.3s" }}
    >
      {projects.length === 0 ? (
        <Box textAlign="center">
          <Typography variant="h6">You have no projects.</Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/projects/create"
          >
            Create a New Project
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="h4" gutterBottom>
            Your Projects :
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/projects/create"
          >
            Create a New Project
          </Button>
          {projects.map((project) => (
            <Card key={project.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5">{project.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created by: {project.user?.email}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Modified at: {new Date(project.lastModified).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/projects/${project.id}/edit/1`}
                >
                  View Project
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleShare(project.id)}
                >
                  Share Project
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(project.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
