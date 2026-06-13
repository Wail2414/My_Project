import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminClientsPage from "./pages/AdminClientsPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import Layout from "./components/Layout";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import CreateProject from "./pages/CreateProject";
import Project from "./pages/Project";
import { AuthProvider } from "./contexts/AuthContext";
import LoginRoute from "./utils/LoginRoute";
import Logs from "./pages/Logs";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MqttProvider, useMqtt } from "./contexts/MqttContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WrappedApp = () => {
  const { notifications } = useMqtt();
  const [oldNotification, setOldNotification] = useState({});

  useEffect(() => {
    Object.keys(notifications).forEach((topicName) => {
      if (!(topicName in oldNotification)) {
        toast(notifications[topicName]);
      }
    });
    setOldNotification(notifications);
  }, [notifications]);

  return (
    <>
      <Routes>
        <Route element={<AdminClientsPage />} path="/admin/clients" />
        <Route
          element={
            <LoginRoute>
              <Login />
            </LoginRoute>
          }
          path="/login"
        />
        <Route element={<ProtectedRoutes />}>
          <Route element={<Layout />}>
            <Route element={<Dashboard />} path="/" />
            <Route element={<Users />} path="/users" />
            <Route element={<CreateUser />} path="/users/create" />
            <Route element={<CreateProject />} path="/projects/create" />
            <Route element={<Logs />} path="/logs" />
            <Route
              element={<Project />}
              path="/projects/:projectid/edit/:pageid"
            />
          </Route>
        </Route>
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MqttProvider>
          <DndProvider backend={HTML5Backend}>
            <WrappedApp />
          </DndProvider>
        </MqttProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
