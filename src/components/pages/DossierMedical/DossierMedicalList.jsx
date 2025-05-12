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
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import DossierMedicalForm from "./DossierMedicalForm"; // Formulaire pour l'ajout et la modification des dossiers médicaux
import DeleteConfirmation from "../generique/DeleteConfirmation"; // Confirmation de suppression
import VisibilityIcon from "@mui/icons-material/Visibility";
import AnalyseListDialog from "./AnalyseListDialog";

const DossierMedicalList = () => {
  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]); // Pour stocker les données des patients
  const [openForm, setOpenForm] = useState(false); // Contrôle d'ouverture du formulaire
  const [selectedDossier, setSelectedDossier] = useState(null); // Dossier médical sélectionné pour modification
  const [openDelete, setOpenDelete] = useState(false); // Contrôle de la suppression
  const [dossierToDelete, setDossierToDelete] = useState(null); // Dossier à supprimer
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const [openAnalyses, setOpenAnalyses] = useState(false);
  const [selectedDossierId, setSelectedDossierId] = useState(null);
  const API_URL = "https://localhost:7162/api/DossiersMedicaux";
  const API_PATIENTS_URL = "https://localhost:7162/api/Patients"; // URL pour récupérer les patients

  // Charger les dossiers médicaux et les patients au début
  useEffect(() => {
    fetchDossiers();
    fetchPatients();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await axios.get(API_URL);
      setDossiers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers médicaux:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get(API_PATIENTS_URL);
      setPatients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
    }
  };

  const handleOpenAnalyses = (dossierId) => {
    setSelectedDossierId(dossierId);
    setOpenAnalyses(true);
  };

  const handleCloseAnalyses = () => {
    setOpenAnalyses(false);
    setSelectedDossierId(null);
  };

  const handleOpenForm = (dossier) => {
    setSelectedDossier(dossier);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelectedDossier(null);
    setOpenForm(false);
  };

  const handleOpenDelete = (dossier) => {
    setDossierToDelete(dossier);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setDossierToDelete(null);
    setOpenDelete(false);
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.nom : "Patient non trouvé";
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpenForm(null)}
      >
        Ajouter un Dossier Médical
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom du Patient</TableCell>
              <TableCell>Analyse</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Chargement...</TableCell>
              </TableRow>
            ) : (
              dossiers.map((dossier) => (
                <TableRow key={dossier.id}>
                  <TableCell>{dossier.id}</TableCell>
                  <TableCell>{getPatientName(dossier.patientId)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenAnalyses(dossier.id)}
                    >
                      Voir
                    </Button>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenForm(dossier)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDelete(dossier)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AnalyseListDialog
        open={openAnalyses}
        onClose={handleCloseAnalyses}
        dossierId={selectedDossierId}
      />

      {/* Formulaire pour l'ajout et la modification */}
      <DossierMedicalForm
        open={openForm}
        handleClose={handleCloseForm}
        selectedDossier={selectedDossier}
        refreshDossiers={fetchDossiers}
      />

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        open={openDelete}
        handleClose={handleCloseDelete}
        entity={dossierToDelete}
        entityName="Dossier Médical"
        refreshEntities={() => fetchDossiers()} // Rafraîchir après suppression
        apiUrl={API_URL}
      />
    </div>
  );
};

export default DossierMedicalList;
