import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Typography
} from "@mui/material";
import { Edit, Delete, Add, AddPhotoAlternate } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteConfirmation from "../generique/DeleteConfirmation";
import AnalyseForm from "./AnalyseForm";
import { useNavigate } from "react-router-dom";

const AnalyseList = ({ patientId }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [analyseToDelete, setAnalyseToDelete] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dossierMedicalId, setDossierMedicalId] = useState(null);

  const navigate = useNavigate();
  const API_URL = "https://localhost:7162/api/Analyse";

  useEffect(() => {
    if (patientId) {
      fetchDossierMedicalId(patientId);
    } else {
      console.error("Aucun patientId fourni.");
      setLoading(false);
      setLoadError(true);
    }
  }, [patientId]);

  const fetchDossierMedicalId = async (id) => {
    try {
      const response = await axios.get(`https://localhost:7162/api/DossiersMedicaux/patient/${id}`);
      const dossierId = response.data?.id;
      if (dossierId) {
        setDossierMedicalId(dossierId);
        console.log("✅ Dossier médical récupéré :", dossierId);
      } else {
        console.warn("⚠️ ID du dossier médical non trouvé :", response.data);
        setLoadError(true);
      }
    } catch (error) {
      console.error("❌ Erreur récupération dossier médical :", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dossierMedicalId) {
      fetchAnalyses();
    }
  }, [dossierMedicalId]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dossier/${dossierMedicalId}`);
      setAnalyses(response.data);
      setLoadError(false);
    } catch (error) {
      console.error("❌ Erreur chargement analyses :", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToAddImage = (id) => navigate(`/analyses/${id}/add-image`);
  const handleNavigateToAnalyseDetail = (id) => navigate(`/analyses/${id}/detail`);

  const handleOpenDelete = (analyse) => {
    setAnalyseToDelete(analyse);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setAnalyseToDelete(null);
  };

  const handleAddAnalyse = () => {
    setSelectedAnalyse(null);
    setOpenForm(true);
  };

  const handleEditAnalyse = (analyse) => {
    console.log("Édition de l'analyse:", analyse);
    setSelectedAnalyse(analyse);
    setOpenForm(true);
  };

  if (loading) {
    return <Typography variant="h6">Chargement des analyses...</Typography>;
  }

  return (
    <div>


      <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleAddAnalyse}>
        Ajouter une Analyse
      </Button>

      {loadError ? (
        <Typography color="error" sx={{ mt: 2 }}>
          ❌ Erreur lors du chargement des analyses ou du dossier médical.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>ID</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Rapport</b></TableCell>
                <TableCell><b>Dossier Médical</b></TableCell>
                <TableCell><b>Ajouter Image</b></TableCell>
                <TableCell><b>Voir</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyses.map((analyse) => (
                <TableRow key={analyse.id}>
                  <TableCell>{analyse.id}</TableCell>
                  <TableCell>{new Date(analyse.dateAnalyse).toLocaleDateString()}</TableCell>
                  <TableCell>{analyse.rapport}</TableCell>
                  <TableCell>{analyse.dossierMedicalId}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleNavigateToAddImage(analyse.id)} color="secondary">
                      <AddPhotoAlternate />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleNavigateToAnalyseDetail(analyse.id)} color="secondary">
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditAnalyse(analyse)} color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDelete(analyse)} color="error">
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AnalyseForm
        open={openForm}
        handleClose={() => setOpenForm(false)}
        selectedAnalyse={selectedAnalyse}
        refreshAnalyses={fetchAnalyses}
        dossierMedicalId={dossierMedicalId}
      />

      <DeleteConfirmation
        open={openDelete}
        handleClose={handleCloseDelete}
        entity={analyseToDelete}
        refreshEntities={fetchAnalyses}
        entityName="Analyse"
        apiUrl={API_URL}
      />
    </div>
  );
};

export default AnalyseList;
