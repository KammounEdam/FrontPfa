import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

const Security = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    emailNotifications: true,
    loginAlerts: true,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handlePasswordChange = (prop) => (event) => {
    setPasswords({ ...passwords, [prop]: event.target.value });
  };

  const handleClickShowPassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const handleSettingChange = (setting) => (event) => {
    setSecuritySettings({ ...securitySettings, [setting]: event.target.checked });
    setSnackbar({
      open: true,
      message: "Paramètre de sécurité mis à jour",
      severity: "success",
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSnackbar({
        open: true,
        message: "Les nouveaux mots de passe ne correspondent pas",
        severity: "error",
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setSnackbar({
        open: true,
        message: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        severity: "error",
      });
      return;
    }

    // TODO: Implémenter l'appel API pour changer le mot de passe
    // Pour l'instant, on simule un succès
    setSnackbar({
      open: true,
      message: "Mot de passe mis à jour avec succès",
      severity: "success",
    });
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres de Sécurité
      </Typography>

      <Grid container spacing={3}>
        {/* Changement de mot de passe */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LockIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Changer le mot de passe</Typography>
              </Box>
              <form onSubmit={handlePasswordSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mot de passe actuel"
                  type={showPasswords.currentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange("currentPassword")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword("currentPassword")}
                          edge="end"
                        >
                          {showPasswords.currentPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nouveau mot de passe"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange("newPassword")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword("newPassword")}
                          edge="end"
                        >
                          {showPasswords.newPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirmer le nouveau mot de passe"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange("confirmPassword")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword("confirmPassword")}
                          edge="end"
                        >
                          {showPasswords.confirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Mettre à jour le mot de passe
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Paramètres de sécurité */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Paramètres de sécurité avancés</Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSettingChange("twoFactorAuth")}
                    color="primary"
                  />
                }
                label="Authentification à deux facteurs"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                Renforcez la sécurité de votre compte en ajoutant une deuxième étape de vérification
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Notifications de sécurité</Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.emailNotifications}
                    onChange={handleSettingChange("emailNotifications")}
                    color="primary"
                  />
                }
                label="Notifications par email"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                Recevez des notifications par email pour les activités importantes
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onChange={handleSettingChange("loginAlerts")}
                    color="primary"
                  />
                }
                label="Alertes de connexion"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                Soyez alerté lorsqu'une connexion est effectuée depuis un nouvel appareil
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Security;
