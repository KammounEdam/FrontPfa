import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Divider,
  Avatar,
  Fade
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = ({ sidebarCollapsed, onToggleTheme, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");

  // Obtenir le titre de la page en fonction de l'URL
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Tableau de bord';
      case '/patients':
        return 'Gestion des Patients';
      case '/profile':
        return 'Mon Profil';
      case '/security':
        return 'Sécurité';
      default:
        if (location.pathname.startsWith('/patients/')) {
          return 'Détails du Patient';
        }
        return 'Cabinet Médical';
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUsername(storedUser.nom || "");
      setUserRole(storedUser.role || "Médecin");
    }
  }, []);

  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleThemeToggle = () => {
    console.log("Toggling theme...");  // Pour le débogage
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        background: darkMode
          ? 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)'
          : 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
        boxShadow: darkMode 
          ? '0 4px 15px rgba(0, 0, 0, 0.3)'
          : '0 4px 15px rgba(0, 0, 0, 0.1)',
        width: sidebarCollapsed ? "calc(100% - 80px)" : "calc(100% - 240px)",
        transition: "all 0.3s ease-in-out"
      }}
    >
      <Toolbar
        sx={{
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: "64px",
          justifyContent: "space-between"
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ mr: 2, fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {getPageTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={darkMode ? "Mode clair" : "Mode sombre"} arrow>
            <IconButton
              color="inherit"
              onClick={handleThemeToggle}
              sx={{
                backgroundColor: darkMode 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Mon compte" arrow>
            <Box
              onClick={handleProfileMenuClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                backgroundColor: darkMode 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                padding: '4px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.3)',
                }}
              >
                {username ? username.charAt(0).toUpperCase() : "U"}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {username || "Utilisateur"}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>
                  {userRole}
                </Typography>
              </Box>
            </Box>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            TransitionComponent={Fade}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: 2,
                minWidth: 200,
                boxShadow: darkMode 
                  ? '0 5px 15px rgba(0, 0, 0, 0.3)'
                  : '0 5px 15px rgba(0, 0, 0, 0.15)',
                backgroundColor: darkMode 
                  ? '#1a237e'
                  : 'white',
                color: darkMode ? 'white' : 'inherit',
                border: darkMode 
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(25, 118, 210, 0.1)',
                mt: 1
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Connecté en tant que
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {username || "Utilisateur"}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'inherit' }} />
            
            <MenuItem 
              onClick={() => { handleCloseMenu(); navigate('/profile'); }}
              sx={{
                color: darkMode ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: darkMode ? 'white' : 'inherit' }} />
              </ListItemIcon>
              Profile
            </MenuItem>

            <MenuItem 
              onClick={() => { handleCloseMenu(); navigate('/security'); }}
              sx={{
                color: darkMode ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: darkMode 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(25, 118, 210, 0.1)'
                }
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: darkMode ? 'white' : 'inherit' }} />
              </ListItemIcon>
              Sécurité
            </MenuItem>

            <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'inherit' }} />

            <MenuItem 
              onClick={handleLogout}
              sx={{
                color: darkMode ? '#ff6b6b' : '#f44336',
                '&:hover': {
                  backgroundColor: darkMode 
                    ? 'rgba(255, 107, 107, 0.1)'
                    : 'rgba(244, 67, 54, 0.1)'
                }
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" sx={{ color: darkMode ? '#ff6b6b' : '#f44336' }} />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;