import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Input,
  Grid,
} from '@mui/material';
import CanvasDraw from 'react-canvas-draw';

const API_URL = 'http://localhost:7162/api/ImageMedicale';

const ImageMedicale = () => {
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [annotationText, setAnnotationText] = useState('');
  const [showAnnotationCanvas, setShowAnnotationCanvas] = useState(false);
  const [newImageData, setNewImageData] = useState({
    idPatient: '',
    idMed: '',
    typeImage: '',
  });

  const canvasRef = useRef(null);

  const handleImageUpload = async () => {
    if (!selectedImageFile) return;

    const formData = new FormData();
    formData.append('file', selectedImageFile);
    formData.append('idPatient', newImageData.idPatient);
    formData.append('idMed', newImageData.idMed);
    formData.append('typeImage', newImageData.typeImage);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewImageUrl(response.data.url); // Affiche l'image uploadée
    } catch (error) {
      console.error("Erreur lors de l’upload de l’image :", error);
    }
  };

  const handleSaveAnnotation = () => {
    const canvasData = canvasRef.current.getSaveData();
    console.log("Données du dessin :", canvasData);
    console.log("Annotation textuelle :", annotationText);
    // Tu peux ici appeler une API pour sauvegarder annotation + dessin
  };

  const handleClearCanvas = () => {
    canvasRef.current.clear();
  };

  return (
    <Box p={4} bgcolor="#f8f9fa">
      <Typography variant="h4" gutterBottom color="primary">
        Uploader une Image Médicale
      </Typography>

      {/* Formulaire de données et upload */}
      <Stack spacing={2} mb={4}>
        <TextField
          label="ID Patient"
          value={newImageData.idPatient}
          onChange={(e) => setNewImageData({ ...newImageData, idPatient: e.target.value })}
        />
        <TextField
          label="ID Médecin"
          value={newImageData.idMed}
          onChange={(e) => setNewImageData({ ...newImageData, idMed: e.target.value })}
        />
        <TextField
          label="Type d'image"
          value={newImageData.typeImage}
          onChange={(e) => setNewImageData({ ...newImageData, typeImage: e.target.value })}
        />
        <Input type="file" onChange={(e) => setSelectedImageFile(e.target.files[0])} />
        <Button variant="contained" onClick={handleImageUpload}>
          Uploader l'image
        </Button>
      </Stack>

      {/* Affichage de l'image uploadée */}
      {previewImageUrl && !showAnnotationCanvas && (
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>Image Uploadée</Typography>
          <img
            src={previewImageUrl}
            alt="Image médicale"
            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
          />
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => setShowAnnotationCanvas(true)}
          >
            Annoter cette image
          </Button>
        </Box>
      )}

      {/* Zone d'annotation avec CanvasDraw */}
      {previewImageUrl && showAnnotationCanvas && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" gutterBottom>Annotation Graphique</Typography>
            <CanvasDraw
              ref={canvasRef}
              imgSrc={previewImageUrl}
              canvasWidth="100%"
              canvasHeight={500}
              brushColor="#ff0000"
              hideGrid
              lazyRadius={0}
              brushRadius={2}
              backgroundColor="transparent"
            />
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="outlined" onClick={handleClearCanvas}>Effacer</Button>
              <Button variant="contained" color="primary" onClick={handleSaveAnnotation}>
                Sauvegarder l'annotation
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h6">Annotation textuelle</Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Ajouter une note"
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ImageMedicale;
