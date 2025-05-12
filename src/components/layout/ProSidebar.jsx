import React from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";

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
        background: 'linear-gradient(180deg, #0d47a1 0%, #1976d2 100%)',
        boxShadow: "4px 0px 15px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        rootStyles={{
          background: 'linear-gradient(180deg, #0d47a1 0%, #1976d2 100%)',
          color: "#FFFFFF", // Texte blanc pour une meilleure lisibilité
          width: collapsed ? "80px" : "250px", // Largeur selon l'état de la sidebar
          transition: "width 0.3s ease-in-out", // Transition de largeur
          height: "100vh", // Hauteur de la sidebar
          borderRight: "2px solid rgba(255, 255, 255, 0.1)", // Bordure droite subtile
        }}
      >
        {/* Entête de la Sidebar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "20px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: 'linear-gradient(90deg, #0d47a1 0%, #1565c0 100%)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {!collapsed && (
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
              Cabinet Médical
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
              color: "#FFFFFF", // Texte blanc
              "&:hover": {
                background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.2) 0%, rgba(66, 165, 245, 0.2) 100%)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
              },
              fontSize: "15px",
              borderRadius: "8px",
              padding: "10px 15px",
              margin: "5px 10px",
              transition: "all 0.2s ease"
            },
            subMenuContent: {
              background: 'linear-gradient(180deg, rgba(13, 71, 161, 0.9) 0%, rgba(25, 118, 210, 0.9) 100%)',
              color: "#fff",
              boxShadow: 'inset 0 5px 10px rgba(0, 0, 0, 0.1)',
              padding: '5px',
              marginTop: '5px',
              borderRadius: '8px'
            },
            subMenuLabel: {
              color: "#FFFFFF"
            },
          }}
        >


          {/* Menu Dashboard */}
          <MenuItem
            icon={<HomeIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />}
            component={<Link to="/dashboard" />}
            style={{
              background: isActive("/dashboard")
                ? 'linear-gradient(90deg, rgba(66, 165, 245, 0.3) 0%, rgba(25, 118, 210, 0.3) 100%)'
                : 'linear-gradient(90deg, rgba(13, 71, 161, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
              color: isActive("/dashboard") ? "#fff" : "#FFFFFF",
              fontWeight: isActive("/dashboard") ? "bold" : "normal",
              borderRadius: "8px",
              boxShadow: isActive("/dashboard") ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
              margin: "5px 10px",
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
            defaultOpen={isActive("/patients")}
            rootStyles={{
              ['& > .ps-menu-button']: {
                background: isActive("/patients")
                  ? 'linear-gradient(90deg, rgba(66, 165, 245, 0.3) 0%, rgba(25, 118, 210, 0.3) 100%)'
                  : 'linear-gradient(90deg, rgba(13, 71, 161, 0.2) 0%, rgba(25, 118, 210, 0.2) 100%)',
                borderRadius: "8px",
                margin: "5px 10px",
                boxShadow: isActive("/patients") ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                '&:hover': {
                  background: 'linear-gradient(90deg, rgba(13, 71, 161, 0.3) 0%, rgba(25, 118, 210, 0.3) 100%)',
                }
              }
            }}
          >
            <MenuItem
              icon={<PeopleIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />}
              component={<Link to="/patients" />}
              style={{
                background: isActive("/patients")
                  ? 'linear-gradient(90deg, rgba(66, 165, 245, 0.4) 0%, rgba(25, 118, 210, 0.4) 100%)'
                  : 'linear-gradient(90deg, rgba(13, 71, 161, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)',
                color: isActive("/patients") ? "#fff" : "#FFFFFF",
                fontWeight: isActive("/patients") ? "bold" : "normal",
                borderRadius: "8px",
                boxShadow: isActive("/patients") ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
                margin: "5px 10px",
                padding: "8px 12px",
              }}
            >
              Patients
            </MenuItem>


          </SubMenu>


        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;