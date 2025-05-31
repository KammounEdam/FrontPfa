import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Annotate from "./Annotate";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Box, Typography, CircularProgress } from "@mui/material";

const UploadAndDisplayImage = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const { id: analyseId } = useParams();
  const [imageId, setImageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const Trash = <FontAwesomeIcon icon={faTrashAlt} />;
  const FileImage = <FontAwesomeIcon icon={faFileImage} />;
  const navigate = useNavigate();

  const refreshPage = () => {
    if (window.confirm("You will lose all annotations along with the image! Do you want to proceed?")) {
      setImageUrl(null);
      window.location.reload(true);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Étape 1: Upload de l'image
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post('https://localhost:7162/api/ImageMedicale/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedImageUrl = uploadResponse.data.url;
      setImageUrl(uploadedImageUrl);

      // Étape 2: Création de l'objet ImageMedicale avec l'analyseId
      const imageMedicale = {
        url: uploadedImageUrl,
        analyseId: parseInt(analyseId),
        annotationGraphics: JSON.stringify([])
      };

      const creationResponse = await axios.post('https://localhost:7162/api/ImageMedicale', imageMedicale);
      setImageId(creationResponse.data.idIm);
      
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur lors de l'upload de l'image. Veuillez réessayer.");
      setImageUrl(null);
      setImageId(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour retourner à la liste des analyses
  const handleBack = () => {
    navigate(-1); // Retourne à la page précédente
  };

  // Fonction pour terminer et aller à la génération de rapport
  const handleFinish = () => {
    navigate(`/analyses/${analyseId}/detail`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Ajouter des images pour l'analyse {analyseId}
      </Typography>

      {imageUrl ? (
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Annotate filedata={{ url: imageUrl, id: imageId }} />
          <Button
            variant="outlined"
            color="error"
            onClick={refreshPage}
            startIcon={<FontAwesomeIcon icon={faTrashAlt} />}
            sx={{ mt: 2 }}
          >
            Supprimer
          </Button>
        </Box>
      ) : (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<FontAwesomeIcon icon={faFileImage} />}
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Upload en cours...
              </>
            ) : (
              "Sélectionner une image"
            )}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
              disabled={loading}
            />
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={handleBack}>
          Retour
        </Button>
        <Button variant="contained" onClick={handleFinish} disabled={!imageUrl}>
          Terminer
        </Button>
      </Box>
    </Box>
  );
};

export default UploadAndDisplayImage;