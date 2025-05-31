import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import axios from "axios";

const DeleteConfirmation = ({ open, handleClose, entity, refreshEntities, entityName, apiUrl }) => {
  const handleDelete = async () => {
    try {
      // Si c'est une analyse, supprimer d'abord les images associées
      if (entityName === "Analyse") {
        try {
          // Récupérer les images associées
          const imagesResponse = await axios.get(`https://localhost:7162/api/ImageMedicale/by-analyse/${entity.id}`);
          const images = imagesResponse.data;

          // Supprimer chaque image
          for (const image of images) {
            await axios.delete(`https://localhost:7162/api/ImageMedicale/${image.idIm}`);
          }
        } catch (error) {
          console.error("Erreur lors de la suppression des images:", error);
        }
      }

      // Supprimer l'entité
      await axios.delete(`${apiUrl}/${entity.id}`);
      console.log(`${entityName} supprimé avec succès`);
      refreshEntities();
      handleClose();
    } catch (error) {
      console.error(`Erreur lors de la suppression du ${entityName.toLowerCase()}: `, error);
      alert(`Erreur lors de la suppression. ${error.response?.data?.message || "Veuillez réessayer."}`);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Confirmer la suppression</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer {entityName.toLowerCase()} #{entity?.id} ?
          Cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Annuler
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained">
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmation;
