import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Pour la redirection après logout
import { 
  AppBar, Toolbar, Typography, IconButton, Box, TextField, Badge, Menu, MenuItem, ListItemIcon 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const Navbar = ({ toggleSidebar, sidebarCollapsed, toggleTheme, darkMode  }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState(""); // Stocker le nom d'utilisateurconst

  useEffect(() => {
    // Charger les informations de l'utilisateur depuis localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    console.log(storedUser);  // Vérifie que l'utilisateur est bien stocké
  
    if (storedUser && storedUser.nom) {  // Utiliser "nom" au lieu de "username"
      setUsername(storedUser.nom);  // Met à jour le nom d'utilisateur
    }
  }, []);


  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Supprimer l'utilisateur du stockage local
    console.log("Utilisateur déconnecté"); // Pour le débogage
    navigate("/login"); // Rediriger vers la page de connexion
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: darkMode ? "#1E1E2D" : "#1976d2",
        boxShadow: 3,
        width: sidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 240px)", 
        transition: "width 0.3s ease-in-out" 
      }}
    >
      <Toolbar sx={{ padding: "0 20px", display: "flex", alignItems: "center" }}>
        <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Tableau de bord
        </Typography>

        <IconButton color="inherit" onClick={toggleTheme} sx={{ marginRight: 1 }}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <TextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            sx={{
              backgroundColor: darkMode ? "#333" : "#f5f5f5",
              borderRadius: 1,
              "& input": { color: darkMode ? "white" : "black" },
            }}
          />
        </Box>

        <IconButton color="inherit" sx={{ marginRight: 2 }}>
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Affichage du Nom d'utilisateur */}
        <Typography variant="body2" sx={{ color: "white", marginRight: 2 }}>
          {username ? username : "Utilisateur"}
        </Typography>

        <IconButton 
          color="inherit" 
          onClick={handleProfileMenuClick}
          sx={{ "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
        >
          <AccountCircleIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          sx={{ marginTop: "40px" }}
        >
          <MenuItem onClick={handleCloseMenu}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Mon Profil
          </MenuItem>
          <MenuItem onClick={handleCloseMenu}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Paramètres
          </MenuItem>
          <MenuItem onClick={handleLogout}>

            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 