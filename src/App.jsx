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
import { CssBaseline, useTheme, useMediaQuery, ThemeProvider, createTheme } from "@mui/material";

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
  const [darkMode, setDarkMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation(); // Permet de récupérer la route actuelle

  // Vérifier si l'utilisateur est sur /login ou /register
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const muiTheme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#0d47a1' : '#1976d2', // Bleu médical professionnel
        light: '#42a5f5', // Bleu clair
        dark: '#0d47a1', // Bleu foncé
        contrastText: '#ffffff',
      },
      secondary: {
        main: darkMode ? '#2c5282' : '#3182ce', // Bleu médical
        light: '#63b3ed',
        dark: '#2c5282',
        contrastText: '#ffffff',
      },
      error: {
        main: '#e53e3e', // Rouge pour les erreurs
      },
      warning: {
        main: '#dd6b20', // Orange pour les avertissements
      },
      info: {
        main: '#3182ce', // Bleu informatif
      },
      success: {
        main: '#38a169', // Vert pour les succès
      },
      background: {
        default: darkMode ? '#1a202c' : '#f7fafc',
        paper: darkMode ? '#2d3748' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#f7fafc' : '#2d3748',
        secondary: darkMode ? '#e2e8f0' : '#4a5568',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '8px 16px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
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
              background: darkMode
                ? 'linear-gradient(180deg, #0d47a1 0%, #1976d2 100%)'
                : 'linear-gradient(180deg, #1976d2 0%, #42a5f5 100%)',
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
                background: darkMode
                  ? 'linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)'
                  : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
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
  setDarkMode={setDarkMode} // Passer la fonction pour basculer le mode sombre
/>
            </Box>
          )}

          <Box
            sx={{
              padding: { xs: 2, md: 3 },
              flexGrow: 1,
              overflowY: "auto",
              backgroundColor: darkMode ? "#1a202c" : "#f7fafc",
              marginTop: isAuthPage ? "0" : "64px",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
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
            path="/analyses"
            element={
              <PrivateRoute>
                <AnalyseList/>
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
            path="/dossiers"
            element={
              <PrivateRoute>
                <DossierMedicalList/>
              </PrivateRoute>
            }
          />


          <Route
            path="/analyses/:analyseId/add-image"
            element={
              <PrivateRoute>
                <UploadAndDisplayImage/>
              </PrivateRoute>
            }
          />

           <Route
            path="/analyses/:analyseId/detail"
            element={
              <PrivateRoute>
                <AnalyseDetails/>
              </PrivateRoute>
            }
          />
                     <Route
            path="/patients/:id"
            element={
              <PrivateRoute>
                <DetailPatient/>
              </PrivateRoute>
            }
          />


        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
