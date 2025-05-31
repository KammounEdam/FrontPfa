import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  Container,
  Divider,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Person, PersonAdd, Search } from "@mui/icons-material";
import DeleteConfirmation from "../generique/DeleteConfirmation";
import PatientForm from "../Patient/PatientForm"; // Formulaire pour l'ajout et la modification des patients
import { useNavigate } from "react-router-dom";

const PatientsList = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null); // patient à supprimer
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openForm, setOpenForm] = useState(false); // Contrôle d'ouverture du formulaire
  const [selectedPatient, setSelectedPatient] = useState(null); // Patient sélectionné pour modification
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const navigate = useNavigate();

  const API_URL = "https://localhost:7162/api/patients";

  // Récupérer l'ID du médecin depuis localStorage
  const medecinId = JSON.parse(localStorage.getItem('user'))?.userId;

  // Charger les patients pour le médecin connecté
  useEffect(() => {
    if (medecinId) {
      fetchPatientsByMedecin(medecinId);
    }
  }, [medecinId]);

  useEffect(() => {
    // Filtrer les patients en fonction de la recherche
    const filtered = patients.filter(patient =>
      patient.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  const fetchPatientsByMedecin = async (medecinId) => {
    try {
      const response = await axios.get(`${API_URL}/medecin/${medecinId}/patients`);
      const sortedPatients = response.data.sort((a, b) => a.nom.localeCompare(b.nom));
      setPatients(sortedPatients);
      setFilteredPatients(sortedPatients);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenDelete = (patient) => {
    setPatientToDelete(patient);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setPatientToDelete(null); // Réinitialiser le patient à supprimer
  };

  // Gérer l'ouverture du formulaire pour ajout
  const handleAddPatient = () => {
    setSelectedPatient(null); // Aucun patient sélectionné (ajout)
    setOpenForm(true); // Ouvrir le formulaire
  };

  // Gérer l'ouverture du formulaire pour modification
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient); // Assigner le patient pour modification
    setOpenForm(true); // Ouvrir le formulaire en mode modification
  };

  // Si les patients sont en cours de chargement
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Chargement des patients...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-5px)'
          }
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 3,
            background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 50%, #42a5f5 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Gestion des Patients
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  placeholder="Rechercher un patient..."
                  value={searchQuery}
                  onChange={handleSearch}
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: '250px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleAddPatient}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                    background: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #01579b 0%, #0288d1 100%)',
                      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Ajouter un Patient
                </Button>
              </Box>
            </Box>
          </Box>

          <Divider />

          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    Nom
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    Date de Naissance
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    Téléphone
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: '#e3f2fd',
                      color: '#0d47a1',
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    hover
                    sx={{
                      cursor: "pointer",
                      '&:nth-of-type(even)': { backgroundColor: '#f5f9ff' },
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        boxShadow: 'inset 0 0 0 1px #bbdefb'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <TableCell>{patient.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{patient.nom}</TableCell>
                    <TableCell>{new Date(patient.dateNaissance).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.numTel}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleEditPatient(patient)}
                          sx={{
                            mr: 1,
                            color: '#1976d2',
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.15)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleOpenDelete(patient)}
                          sx={{
                            color: '#f44336',
                            backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.15)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 3px 5px rgba(0, 0, 0, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout ou modification de patient */}
      <PatientForm
        open={openForm}
        handleClose={() => setOpenForm(false)} // Fermer le formulaire
        selectedPatient={selectedPatient} // Passer le patient pour modification
        refreshPatients={() => fetchPatientsByMedecin(medecinId)} // Rafraîchir la liste après modification
      />

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        open={openDelete}
        handleClose={handleCloseDelete}
        entity={patientToDelete} // Passer le patient à supprimer
        refreshEntities={() => fetchPatientsByMedecin(medecinId)} // Rafraîchir après suppression
        entityName="Patient"
        apiUrl={API_URL}
      />
    </Container>
  );
};

export default PatientsList;
