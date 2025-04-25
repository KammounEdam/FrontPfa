import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";
import axios from "axios";

const DeleteConfirmation = ({ open, handleClose, entity, refreshEntities, entityName, apiUrl }) => {
  // Fonction pour supprimer l'entité
  const handleDelete = async () => {
    try {
      if (entity) {
        await axios.delete(`${apiUrl}/${entity.id}`);
        refreshEntities(); // Met à jour la liste après suppression
      }
      handleClose(); // Fermer la boîte de dialogue
    } catch (error) {
      console.error(`Erreur lors de la suppression du ${entityName.toLowerCase()}:`, error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <Typography>
          Êtes-vous sûr de vouloir supprimer <strong>{entity?.nom || entity?.patientNom || entity?.id}</strong> ?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Annuler
        </Button>
        <Button onClick={handleDelete} variant="contained" color="error">
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmation;
