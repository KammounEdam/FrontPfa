import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import axios from "axios";

const AnalyseForm = ({ open, handleClose, selectedAnalyse, refreshAnalyses }) => {
  const API_URL = "https://localhost:7162/api/Analyse";

  const [formData, setFormData] = useState({
    dateAnalyse: "",
    resultat: "",
    dossierMedicalId: "",
  });

  // Remplir les données pour modification ou initialiser pour ajout
  useEffect(() => {
    if (selectedAnalyse) {
      setFormData({
        id: selectedAnalyse.id || 0,
        dateAnalyse: selectedAnalyse.dateAnalyse
          ? selectedAnalyse.dateAnalyse.split("T")[0]
          : "",
        resultat: selectedAnalyse.resultat || "",
        dossierMedicalId: selectedAnalyse.dossierMedicalId || "",
      });
    } else {
      setFormData({
        id: 0,
        dateAnalyse: "",
        resultat: "",
        dossierMedicalId: "",
      });
    }
  }, [selectedAnalyse]);

  // Gérer les changements des champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      dateAnalyse: new Date(formData.dateAnalyse).toISOString(),
    };

    try {
      if (selectedAnalyse) {
        await axios.put(`${API_URL}/${selectedAnalyse.id}`, formattedData);
      } else {
        await axios.post(API_URL, formattedData);
      }

      refreshAnalyses();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'analyse:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        {selectedAnalyse ? "Modifier l'Analyse" : "Ajouter une Analyse"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            label="Date d'Analyse"
            type="date"
            name="dateAnalyse"
            value={formData.dateAnalyse}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Résultat"
            name="resultat"
            value={formData.resultat}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Dossier Médical ID"
            name="dossierMedicalId"
            value={formData.dossierMedicalId}
            onChange={handleChange}
            required
          />
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Annuler
            </Button>
            <Button type="submit" color="primary">
              {selectedAnalyse ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyseForm;
