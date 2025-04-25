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

const PatientForm = ({ open, handleClose, selectedPatient, refreshPatients }) => {
  const API_URL = "https://localhost:7162/api/patients";

  const [formData, setFormData] = useState({
    nom: "",
    dateNaissance: "",
    NumTel: "",
    medecinId: "",

  });

  // Remplir les données pour modification ou initialiser pour ajout
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
      id: selectedPatient?.id,
      dateNaissance: new Date(formData.dateNaissance).toISOString(),
    };
  
    console.log("Données envoyées à l'API :", formattedData); // 🔍 Debug
  
    try {
      if (selectedPatient) {
        await axios.put(`${API_URL}/${selectedPatient.id}`, formattedData);
      } else {
        await axios.post(API_URL, formattedData);
      }
  
      refreshPatients();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du patient:", error);
      console.error("Réponse du serveur :", error.response?.data);
    }
  };
  

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        {selectedPatient ? "Modifier le Patient" : "Ajouter un Patient"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="dense"
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Date de Naissance"
            type="date"
            name="dateNaissance"
            value={formData.dateNaissance}
            onChange={handleChange}
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Numéro de Téléphone"
            name="NumTel"
            value={formData.numTel}
            onChange={handleChange}
            required
          />
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedPatient ? "Modifier" : "Ajouter"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientForm;
