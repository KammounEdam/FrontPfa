import React from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import ScienceIcon from "@mui/icons-material/Science";

const ProSidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();

  // Fonction pour vérifier si un chemin est actif
  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        height: "100vh",
        position: "fixed",
        zIndex: 1200,
        transition: "all 0.3s ease-in-out",
        backgroundColor: "#000000", // Fond noir
        boxShadow: "4px 0px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        rootStyles={{
          backgroundColor: "#000000", // Fond noir
          color: "#FFFFFF", // Texte blanc pour une meilleure lisibilité
          width: collapsed ? "80px" : "250px", // Largeur selon l'état de la sidebar
          transition: "width 0.3s ease-in-out", // Transition de largeur
          height: "100vh", // Hauteur de la sidebar
          borderRight: "2px solid #1F2937", // Bordure droite sombre
        }}
      >
        {/* Entête de la Sidebar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "20px 20px",
            borderBottom: "1px solid #222222",
          }}
        >
          {!collapsed && (
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
              Mon Resto
            </Typography>
          )}
          <IconButton onClick={toggleSidebar} sx={{ color: "#fff" }}>
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* Menu de la Sidebar */}
        <Menu
          menuItemStyles={{
            button: {
              color: "#E5E7EB", // Texte blanc/gris clair
              "&:hover": { backgroundColor: "#222222" }, // Hover sombre
              fontSize: "15px",
              borderRadius: "8px",
              padding: "10px 15px",
            },
            subMenuContent: {
              backgroundColor: "#000000", // Fond noir pour les sous-menus
              color: "#fff",
            },
          }}
        >
       

          {/* Menu Dashboard */}
          <MenuItem
            icon={<HomeIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />}
            component={<Link to="/dashboard" />}
            style={{
              backgroundColor: isActive("/dashboard") ? "#2563EB" : "transparent",
              color: isActive("/dashboard") ? "#fff" : "#9CA3AF",
              fontWeight: isActive("/dashboard") ? "bold" : "normal",
              borderRadius: "8px",
            }}
          >
            Dashboard
          </MenuItem>
     {/* Menu Dashboard */}
    

          {/* Sous-menu Paramètres */}
          
          {/* Gestion Médicale */}
          <SubMenu
            icon={<PeopleIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />}
            label="Gestion Médicale"
            style={{ borderRadius: "8px" }}
          >
            <MenuItem
              icon={<PeopleIcon />}
              component={<Link to="/patients" />}
              style={{
                backgroundColor: isActive("/patients") ? "#2563EB" : "transparent",
                color: isActive("/patients") ? "#fff" : "#9CA3AF",
                fontWeight: isActive("/patients") ? "bold" : "normal",
              }}
            >
              Patients
            </MenuItem>

            <MenuItem
              icon={<FolderSharedIcon />}
              component={<Link to="/dossiers" />}
              style={{
                backgroundColor: isActive("/dossiers") ? "#2563EB" : "transparent",
                color: isActive("/dossiers") ? "#fff" : "#9CA3AF",
                fontWeight: isActive("/dossiers") ? "bold" : "normal",
              }}
            >
              Dossiers Médicaux
            </MenuItem>

            <MenuItem
              icon={<ScienceIcon />}
              component={<Link to="/analyses" />}
              style={{
                backgroundColor: isActive("/analyses") ? "#2563EB" : "transparent",
                color: isActive("/analyses") ? "#fff" : "#9CA3AF",
                fontWeight: isActive("/analyses") ? "bold" : "normal",
              }}
            >
              Analyses
            </MenuItem>
          </SubMenu>

          {/* Paramètres */}
          
          <SubMenu
            icon={<SettingsIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />}
            label="Paramètres"
            style={{
              backgroundColor: "#000000",
              borderRadius: "8px",
            }}
          >
            {/* Sous-menu Profil */}
            <MenuItem
              icon={<AccountCircleIcon sx={{ color: "#FFFFFF" }} />}
              component={<Link to="/profile" />}
              style={{
                backgroundColor: isActive("/profile") ? "#2563EB" : "transparent",
                color: isActive("/profile") ? "#fff" : "#9CA3AF",
                fontWeight: isActive("/profile") ? "bold" : "normal",
                borderRadius: "8px",
              }}
            >
              Profil
            </MenuItem>

            {/* Sous-menu Sécurité */}
            <MenuItem
              icon={<SecurityIcon sx={{ color: "#FFFFFF" }} />}
              component={<Link to="/security" />}
              style={{
                backgroundColor: isActive("/security") ? "#2563EB" : "transparent",
                color: isActive("/security") ? "#fff" : "#9CA3AF",
                fontWeight: isActive("/security") ? "bold" : "normal",
                borderRadius: "8px",
              }}
            >
              Sécurité
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;