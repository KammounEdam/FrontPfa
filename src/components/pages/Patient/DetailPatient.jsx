import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  CircularProgress,
  Box,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  CalendarMonth,
  Phone,
  Edit,
  MedicalServices
} from "@mui/icons-material";
import AnalyseList from "../Analyses/AnalyseList";
import PatientForm from "./PatientForm";

function DetailPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEditForm, setOpenEditForm] = useState(false);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await axios.get(`https://localhost:7162/api/patients/${id}`);
      setPatient(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération du patient :", error);
      setError("Erreur lors de la récupération des données du patient.");
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setOpenEditForm(true);
  };

  const handleCloseEditForm = () => {
    setOpenEditForm(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Card elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: '#ffebee' }}>
          <Typography color="error" variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>⚠️</span> {error}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/patients')}
            startIcon={<ArrowBack />}
          >
            Retour à la liste des patients
          </Button>
        </Card>
      </Container>
    );
  }

  const age = patient.dateNaissance
    ? Math.floor((new Date() - new Date(patient.dateNaissance)) / (365.25 * 24 * 60 * 60 * 1000))
    : 'N/A';

  return (
    <Container maxWidth="lg" sx={{ mt: 0, mb: 6 }}>
      {/* Titre et bouton de retour en haut dans l'espace blanc */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        mt: 0,
        pt: 1
      }}>
        <Tooltip title="Retour à la liste">
          <IconButton
            color="primary"
            onClick={() => navigate('/patients')}
            sx={{
              mr: 2,
              background: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.15)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0d47a1' }}>
          Dossier Médical
        </Typography>
      </Box>

      {/* Fiche Patient en haut */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, width: '100%' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                fontSize: '1.8rem',
                mr: 2
              }}
            >
              <Person fontSize="inherit" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Fiche Patient: {patient.nom}
            </Typography>
          </Box>
          <Tooltip title="Modifier">
            <IconButton
              size="medium"
              sx={{
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
              onClick={handleEditClick}
            >
              <Edit />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      {/* Informations Personnelles sur toute la largeur comme la fiche patient */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3, width: '100%' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Person sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Informations Personnelles
          </Typography>
        </Box>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Nom</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                  {patient.nom}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Date de naissance</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <CalendarMonth sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                  {new Date(patient.dateNaissance).toLocaleDateString()}
                  <Chip
                    label={`${age} ans`}
                    size="small"
                    color="primary"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{
                p: 2,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Téléphone</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
                  {patient.numTel}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Historique des Analyses */}
      <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', width: '100%' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          <MedicalServices sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Historique des Analyses
          </Typography>
        </Box>
        <CardContent>
          <AnalyseList patientId={patient.id} />
        </CardContent>
      </Card>

      {/* Formulaire de modification */}
      <PatientForm
        open={openEditForm}
        handleClose={handleCloseEditForm}
        selectedPatient={patient}
        refreshPatients={fetchPatient}
      />
    </Container>
  );
}

export default DetailPatient;
