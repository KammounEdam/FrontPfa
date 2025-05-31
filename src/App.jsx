import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Box from '@mui/material/Box';
import "./components/styles/MedicalStyles.css"; // Importer nos styles médicaux personnalisés


import Navbar from "./components/layout/Navbar";
import ProSidebar from "./components/layout/ProSidebar";
import { CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider, useTheme as useCustomTheme } from './contexts/ThemeContext';

// Importer les composants de page
import Dashboard from "./components/pages/Dashboard";
import Profile from "./components/pages/Profile";
import Security from "./components/pages/Security";
import RegisterForm from "./components/pages/auth/RegisterForm";
import LoginForm from "./components/pages/auth/LoginForm";

// Importer la route privée
import PrivateRoute from "./PrivateRoute";
import PatientsList from "./components/pages/Patient/PatientsList";
import DossierMedicalList from "./components/pages/DossierMedical/DossierMedicalList";
import AnalyseList from "./components/pages/Analyses/AnalyseList";

import UploadAndDisplayImage from "./components/Annotate/UploadAndDisplayImage";
import AnalyseDetails from "./components/pages/Analyses/AnalyseDetails";
import DetailPatient from "./components/pages/Patient/DetailPatient";

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { darkMode, toggleDarkMode } = useCustomTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation(); // Permet de récupérer la route actuelle

  // Mettre à jour l'attribut data-theme du body
  React.useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Vérifier si l'utilisateur est sur /login ou /register
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />

      {/* Ne pas afficher Sidebar et Navbar sur les pages Auth */}
      {!isAuthPage && (
        <Box
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            height: "100vh",
            width: collapsed ? "80px" : "240px",
            transition: "width 0.3s ease, transform 0.3s ease",
            zIndex: 1300,
            transform: {
              xs: mobileSidebarOpen ? "translateX(0)" : "translateX(-100%)",
              md: "translateX(0)",
            },
          }}
        >
          <ProSidebar
            collapsed={collapsed}
            toggleSidebar={() => setCollapsed(!collapsed)}
            onMobileClose={() => setMobileSidebarOpen(false)}
            darkMode={darkMode}
          />
        </Box>
      )}

      <Box
        sx={{
          flexGrow: 1,
          marginLeft: {
            xs: 0,
            md: isAuthPage ? "0" : collapsed ? "80px" : "240px",
          },
          marginTop: isAuthPage ? "0" : "64px",
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {!isAuthPage && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: {
                xs: 0,
                md: collapsed ? "80px" : "240px",
              },
              width: {
                xs: "100%",
                md: `calc(100% - ${collapsed ? "80px" : "240px"})`,
              },
              height: "64px",
              zIndex: 1200,
            }}
          >
            <Navbar
              toggleSidebar={() => {
                if (isMobile) {
                  setMobileSidebarOpen(!mobileSidebarOpen);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              sidebarCollapsed={collapsed}
              darkMode={darkMode}
              onToggleTheme={toggleDarkMode}
            />
          </Box>
        )}

        <Box
          sx={{
            padding: { xs: 2, md: 3 },
            flexGrow: 1,
            overflowY: "auto",
            marginTop: isAuthPage ? "0" : "64px",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppLayout>
          <Routes>
            {/* Rediriger '/' vers '/dashboard' si l'utilisateur est connecté */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Routes publiques (indépendantes du template) */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Routes protégées (dépendantes du template) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/security"
              element={
                <PrivateRoute>
                  <Security />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <PatientsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <PrivateRoute>
                  <DetailPatient />
                </PrivateRoute>
              }
            />
            <Route
              path="/dossiers"
              element={
                <PrivateRoute>
                  <DossierMedicalList />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyses"
              element={
                <PrivateRoute>
                  <AnalyseList />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyses/:id/detail"
              element={
                <PrivateRoute>
                  <AnalyseDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/images"
              element={
                <PrivateRoute>
                  <UploadAndDisplayImage />
                </PrivateRoute>
              }
            />
            <Route
              path="/analyses/:id/add-image"
              element={
                <PrivateRoute>
                  <UploadAndDisplayImage />
                </PrivateRoute>
              }
            />
          </Routes>
        </AppLayout>
      </ThemeProvider>
    </Router>
  );
};

export default App;
