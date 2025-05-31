import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  TextField,
  Divider,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: "",
    email: "",
    role: "",
    specialite: "",
    telephone: "",
    adresse: "",
    numeroInpe: "",
    dateNaissance: "",
    genre: "",
    bio: "",
  });
  const [editedData, setEditedData] = useState({...profileData});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Charger les données de l'utilisateur depuis le localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setProfileData(prevData => ({
        ...prevData,
        nom: storedUser.nom || "",
        email: storedUser.email || "",
        role: storedUser.role || "Médecin",
        // Pour le moment, on utilise des valeurs par défaut pour les autres champs
        specialite: storedUser.specialite || "Non spécifié",
        telephone: storedUser.telephone || "",
        adresse: storedUser.adresse || "",
        numeroInpe: storedUser.numeroInpe || "",
        dateNaissance: storedUser.dateNaissance || "",
        genre: storedUser.genre || "",
        bio: storedUser.bio || ""
      }));
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({...profileData});
  };

  const handleSave = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      // Mettre à jour le localStorage avec les nouvelles données
      const updatedUser = {
        ...storedUser,
        ...editedData
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setProfileData({...editedData});
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: "Profil mis à jour avec succès",
        severity: "success"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la mise à jour du profil",
        severity: "error"
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({...profileData});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" component="h1">
              Profil Médical
            </Typography>
            {!isEditing ? (
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            ) : (
              <Box>
                <IconButton onClick={handleSave} color="success">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel} color="error">
                  <CancelIcon />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{ width: 100, height: 100, mr: 3, bgcolor: 'primary.main' }}
              alt={profileData.nom}
            >
              {profileData.nom ? profileData.nom.charAt(0).toUpperCase() : "M"}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {profileData.nom || "Non spécifié"}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {profileData.role || "Médecin"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informations Personnelles
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={isEditing ? editedData.nom : profileData.nom}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={isEditing ? editedData.email : profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rôle"
                    name="role"
                    value={isEditing ? editedData.role : profileData.role}
                    onChange={handleChange}
                    disabled={true}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Informations Professionnelles
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Spécialité"
                    name="specialite"
                    value={isEditing ? editedData.specialite : profileData.specialite}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Numéro INPE"
                    name="numeroInpe"
                    value={isEditing ? editedData.numeroInpe : profileData.numeroInpe}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={isEditing ? editedData.telephone : profileData.telephone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Adresse Professionnelle
              </Typography>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                value={isEditing ? editedData.adresse : profileData.adresse}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Biographie
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Bio"
                name="bio"
                value={isEditing ? editedData.bio : profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
