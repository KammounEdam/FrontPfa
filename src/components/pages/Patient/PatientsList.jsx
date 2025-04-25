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
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import DeleteConfirmation from "../generique/DeleteConfirmation";
import PatientForm from "../Patient/PatientForm"; // Formulaire pour l'ajout et la modification des patients

const PatientsList = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null); // patient à supprimer
  const [patients, setPatients] = useState([]);
  const [openForm, setOpenForm] = useState(false); // Contrôle d'ouverture du formulaire
  const [selectedPatient, setSelectedPatient] = useState(null); // Patient sélectionné pour modification
  const [loading, setLoading] = useState(true); // Indicateur de chargement

  const API_URL = "https://localhost:7162/api/patients";
  
  // Récupérer l'ID du médecin depuis localStorage
  const medecinId = JSON.parse(localStorage.getItem('user'))?.userId;

  // Charger les patients pour le médecin connecté
  useEffect(() => {
    if (medecinId) {
      fetchPatientsByMedecin(medecinId);
    }
  }, [medecinId]);

  const fetchPatientsByMedecin = async (medecinId) => {
    try {
      const response = await axios.get(`${API_URL}/medecin/${medecinId}/patients`);
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des patients:", error);
      setLoading(false);
    }
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
    return <Typography variant="h6">Chargement des patients...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Patients
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={handleAddPatient} // Ouvrir le formulaire d'ajout
      >
        Ajouter un Patient
      </Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Nom</b></TableCell>
              <TableCell><b>Date de Naissance</b></TableCell>
              <TableCell><b>Télephone</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {patients.map((patient) => {
  console.log(patient);  // Add this line to check the patient data
  return (
    <TableRow key={patient.id}>
      <TableCell>{patient.id}</TableCell>
      <TableCell>{patient.nom}</TableCell>
      <TableCell>{new Date(patient.dateNaissance).toLocaleDateString()}</TableCell>
      <TableCell>{patient.numTel}</TableCell>
      <TableCell>
        <IconButton color="primary" onClick={() => handleEditPatient(patient)}>
          <Edit />
        </IconButton>
        <IconButton color="error" onClick={() => handleOpenDelete(patient)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  );
})}

          </TableBody>
        </Table>
      </TableContainer>

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
    </div>
  );
};

export default PatientsList;
