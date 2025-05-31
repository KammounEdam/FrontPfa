import React from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const ProSidebar = ({ collapsed, toggleSidebar, darkMode }) => {
  const location = useLocation();

  // Fonction pour vérifier si un chemin est actif
  const isActive = (path) => location.pathname === path;

  const gradientBg = darkMode
    ? 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)'
    : 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)';

  const headerGradient = darkMode
    ? 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)'
    : 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)';

  const hoverGradient = darkMode
    ? 'linear-gradient(90deg, rgba(13, 71, 161, 0.2) 0%, rgba(25, 118, 210, 0.2) 50%, rgba(66, 165, 245, 0.2) 100%)'
    : 'linear-gradient(90deg, rgba(13, 71, 161, 0.2) 0%, rgba(25, 118, 210, 0.2) 50%, rgba(66, 165, 245, 0.2) 100%)';

  const activeGradient = darkMode
    ? 'linear-gradient(90deg, rgba(13, 71, 161, 0.3) 0%, rgba(25, 118, 210, 0.3) 50%, rgba(66, 165, 245, 0.3) 100%)'
    : 'linear-gradient(90deg, rgba(13, 71, 161, 0.3) 0%, rgba(25, 118, 210, 0.3) 50%, rgba(66, 165, 245, 0.3) 100%)';

  return (
    <Box
      sx={{
        height: "100vh",
        position: "fixed",
        zIndex: 1200,
        transition: "all 0.3s ease-in-out",
        background: gradientBg,
        boxShadow: darkMode 
          ? "4px 0px 15px rgba(0, 0, 0, 0.3)"
          : "4px 0px 15px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        rootStyles={{
          background: gradientBg,
          color: "#FFFFFF",
          width: collapsed ? "80px" : "250px",
          transition: "width 0.3s ease-in-out",
          height: "100vh",
          borderRight: darkMode 
            ? "2px solid rgba(255, 255, 255, 0.05)"
            : "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Entête de la Sidebar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: "20px 20px",
            borderBottom: darkMode 
              ? "1px solid rgba(255, 255, 255, 0.05)"
              : "1px solid rgba(255, 255, 255, 0.1)",
            background: headerGradient,
            boxShadow: darkMode
              ? '0 2px 10px rgba(0, 0, 0, 0.2)'
              : '0 2px 10px rgba(0, 0, 0, 0.1)',
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
              color: "#FFFFFF",
              "&:hover": {
                background: hoverGradient,
                boxShadow: darkMode
                  ? '0 2px 5px rgba(0, 0, 0, 0.2)'
                  : '0 2px 5px rgba(0, 0, 0, 0.1)'
              },
              fontSize: "15px",
              borderRadius: "8px",
              padding: "10px 15px",
              margin: "5px 10px",
              transition: "all 0.2s ease"
            },
            subMenuContent: {
              background: 'transparent',
              color: "#fff",
              padding: '5px',
              marginTop: '5px',
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
              background: isActive("/dashboard") ? activeGradient : 'transparent',
              color: "#FFFFFF",
              fontWeight: isActive("/dashboard") ? "bold" : "normal",
              borderRadius: "8px",
              boxShadow: isActive("/dashboard") 
                ? darkMode 
                  ? '0 2px 8px rgba(0, 0, 0, 0.25)'
                  : '0 2px 8px rgba(0, 0, 0, 0.15)'
                : 'none',
              margin: "5px 10px",
            }}
          >
            Dashboard
          </MenuItem>

          {/* Gestion Médicale */}
          <SubMenu
            icon={<LocalHospitalIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />}
            label="Gestion Médicale"
            defaultOpen={isActive("/patients")}
            rootStyles={{
              ['& > .ps-menu-button']: {
                background: isActive("/patients") ? activeGradient : 'transparent',
                borderRadius: "8px",
                margin: "5px 10px",
                boxShadow: isActive("/patients")
                  ? darkMode
                    ? '0 2px 8px rgba(0, 0, 0, 0.25)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)'
                  : 'none',
                '&:hover': {
                  background: hoverGradient,
                }
              }
            }}
          >
            <MenuItem
              icon={<PeopleIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />}
              component={<Link to="/patients" />}
              style={{
                background: isActive("/patients") ? activeGradient : 'transparent',
                color: "#FFFFFF",
                fontWeight: isActive("/patients") ? "bold" : "normal",
                borderRadius: "8px",
                boxShadow: isActive("/patients")
                  ? darkMode
                    ? '0 2px 8px rgba(0, 0, 0, 0.25)'
                    : '0 2px 8px rgba(0, 0, 0, 0.15)'
                  : 'none',
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