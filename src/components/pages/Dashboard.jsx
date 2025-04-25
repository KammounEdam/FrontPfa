import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Dashboard = ({ darkMode }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: darkMode ? "#fff" : "#000" }}>
        Tableau de bord
      </Typography>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          backgroundColor: darkMode ? "#1E1E2D" : "#fff",
          color: darkMode ? "#fff" : "#000"
        }}
      >
        <Typography paragraph>
          Bienvenue sur votre tableau de bord. Vous pouvez naviguer entre les différentes sections 
          en utilisant le menu de gauche.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;