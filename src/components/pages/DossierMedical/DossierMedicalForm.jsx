import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";

const DossierMedicalForm = ({ open, handleClose, selectedDossier, refreshDossiers }) => {
  const API_URL = "https://localhost:7162/api/DossiersMedicaux";

  const [formData, setFormData] = useState({
    patientId: "",
    analyses: [],
  });

  // Remplir les données pour modification ou initialiser pour ajout
  useEffect(() => {
    if (selectedDossier) {
      setFormData({
        id: selectedDossier.id || 0,
        patientId: selectedDossier.patientId || "",
        analyses: selectedDossier.analyses || [],
      });
    } else {
      setFormData({
        id: 0,
        patientId: "",
        analyses: [],
      });
    }
  }, [selectedDossier]);

  // Gérer les changements des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDossier) {
        await axios.put(`${API_URL}/${selectedDossier.id}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      refreshDossiers();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du dossier médical:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        {selectedDossier ? "Modifier le Dossier Médical" : "Ajouter un Dossier Médical"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            label="Patient ID"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
          />
          {/* Ajouter des champs pour les analyses si nécessaire */}
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedDossier ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DossierMedicalForm;
