import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const AnalyseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID de l'analyse non spécifié");
        setLoading(false);
        return;
      }

      try {
        // Récupérer les détails de l'analyse
        const analyseResponse = await axios.get(`https://localhost:7162/api/Analyse/${id}`);
        setAnalyse(analyseResponse.data);

        // Récupérer les images associées
        const imagesResponse = await axios.get(`https://localhost:7162/api/ImageMedicale/by-analyse/${id}`);
        setImages(imagesResponse.data);

      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(err.response?.data?.message || "Erreur lors du chargement des détails de l'analyse");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack}>
          Retour
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Retour
        </Button>
        <Typography variant="h4" gutterBottom>
          Détails de l'analyse
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Informations générales
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Date d'analyse:</strong>{' '}
                {new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>ID Dossier Médical:</strong> {analyse.dossierMedicalId}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Rapport
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {analyse.rapport || "Aucun rapport disponible"}
            </Typography>
          </Paper>
        </Grid>

        {images.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Images associées
              </Typography>
              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item xs={12} sm={6} key={image.idIm}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '300px',
                          objectFit: 'contain'
                        }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default AnalyseDetails;
