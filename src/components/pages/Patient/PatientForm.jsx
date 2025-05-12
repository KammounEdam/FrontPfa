import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Person, CalendarMonth, Phone, Save, Cancel } from "@mui/icons-material";
import axios from "axios";

const PatientForm = ({ open, handleClose, selectedPatient, refreshPatients }) => {
  const API_URL = "https://localhost:7162/api/patients";

  const [formData, setFormData] = useState({
    nom: "",
    dateNaissance: "",
    NumTel: "",
    medecinId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (selectedPatient) {
      setFormData({
        id: selectedPatient.id || 0,
        nom: selectedPatient.nom || "",
        dateNaissance: selectedPatient.dateNaissance
          ? selectedPatient.dateNaissance.split("T")[0]
          : "",
        NumTel: selectedPatient.NumTel || "",
        medecinId: selectedPatient.medecinId || "",
      });
    } else {
      setFormData({
        id: 0,
        nom: "",
        dateNaissance: "",
        NumTel: "",
        medecinId: user?.userId || "",
      });
    }
  }, [selectedPatient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation simple
    if (!formData.nom.trim()) {
      setError("Le nom du patient est requis");
      setLoading(false);
      return;
    }

    if (!formData.dateNaissance) {
      setError("La date de naissance est requise");
      setLoading(false);
      return;
    }

    if (!formData.NumTel.trim()) {
      setError("Le numéro de téléphone est requis");
      setLoading(false);
      return;
    }

    const formattedData = {
      ...formData,
      id: selectedPatient?.id,
      dateNaissance: new Date(formData.dateNaissance).toISOString(),
    };

    try {
      if (selectedPatient) {
        await axios.put(`${API_URL}/${selectedPatient.id}`, formattedData);
      } else {
        await axios.post(API_URL, formattedData);
      }

      setSuccess(true);
      refreshPatients();

      // Fermer le formulaire après un court délai pour montrer le message de succès
      setTimeout(() => {
        handleClose();
        setSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du patient:", error);
      setError(error.response?.data?.message || "Erreur lors de l'enregistrement du patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: 10,
          p: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "bold",
          fontSize: "1.5rem",
          textAlign: "center",
          mb: 1,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Person sx={{ mr: 1, fontSize: '2rem' }} />
        {selectedPatient ? "Modifier le Patient" : "Ajouter un Patient"}
      </DialogTitle>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert
          severity="error"
          sx={{ mx: 3, mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mx: 3, mb: 2 }}
        >
          Patient {selectedPatient ? "modifié" : "ajouté"} avec succès!
        </Alert>
      )}

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
            px: 1,
          }}
        >
          <TextField
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            fullWidth
            required
            sx={{ borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Date de Naissance"
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            fullWidth
            required
            sx={{ borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonth color="primary" />
                </InputAdornment>
              ),
            }}
            slotProps={{ input: { placeholder: 'AAAA-MM-JJ' } }}
          />
          <TextField
            label="Numéro de Téléphone"
            name="NumTel"
            value={formData.NumTel}
            onChange={handleChange}
            fullWidth
            required
            sx={{ borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <DialogActions sx={{ justifyContent: "space-between", pt: 3 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              color="secondary"
              startIcon={<Cancel />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
              disabled={loading}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 3,
                py: 1,
              }}
            >
              {selectedPatient ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Patient {selectedPatient ? "modifié" : "ajouté"} avec succès!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default PatientForm;
