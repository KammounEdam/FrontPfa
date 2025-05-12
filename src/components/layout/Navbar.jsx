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

const Navbar = ({  sidebarCollapsed, toggleTheme, darkMode  }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(5);
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
        background: darkMode
          ? 'linear-gradient(90deg, #0d47a1 0%, #1976d2 100%)'
          : 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        width: sidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 240px)",
        transition: "width 0.3s ease-in-out"
      }}
    >
      <Toolbar sx={{
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        height: "64px"
      }}>
        

        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Tableau de bord
        </Typography>

        <IconButton
          color="inherit"
          onClick={toggleTheme}
          sx={{
            marginRight: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(180deg)',
              transition: 'transform 0.5s ease'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        <Box sx={{
          display: "flex",
          alignItems: "center",
          marginRight: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          padding: '2px 8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
        }}>
          <IconButton color="inherit" sx={{ padding: '8px' }}>
            <SearchIcon />
          </IconButton>
          <TextField
            variant="standard"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            sx={{
              width: '150px',
              '& .MuiInput-underline:before': { borderBottom: 'none' },
              '& .MuiInput-underline:after': { borderBottom: 'none' },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
              "& input": {
                color: "white",
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1
                }
              },
            }}
          />
        </Box>

        <IconButton
          color="inherit"
          sx={{
            marginRight: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Badge
            badgeContent={notificationCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#f44336',
                boxShadow: '0 0 0 2px #1976d2'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* Affichage du Nom d'utilisateur */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            padding: '4px 12px',
            marginRight: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontWeight: 500
            }}
          >
            {username ? username : "Utilisateur"}
          </Typography>
        </Box>

        <IconButton
          color="inherit"
          onClick={handleProfileMenuClick}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease'
          }}
        >
          <AccountCircleIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          sx={{
            marginTop: "40px",
            '& .MuiPaper-root': {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(25, 118, 210, 0.1)'
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={handleCloseMenu}
            sx={{
              padding: '10px 16px',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Mon Profil</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleCloseMenu}
            sx={{
              padding: '10px 16px',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Paramètres</Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              padding: '10px 16px',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" sx={{ color: '#f44336' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>Déconnexion</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;