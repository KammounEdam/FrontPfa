import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Typography } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import DeleteConfirmation from "../generique/DeleteConfirmation";
import AnalyseForm from "./AnalyseForm"; // Formulaire pour l'ajout et la modification des analyses
import { useNavigate } from "react-router-dom";
import { AddPhotoAlternate } from "@mui/icons-material"; // Icône ajout image

const AnalyseList = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [analyseToDelete, setAnalyseToDelete] = useState(null); // Analyse à supprimer
  const [analyses, setAnalyses] = useState([]);
  const [openForm, setOpenForm] = useState(false); // Contrôle d'ouverture du formulaire
  const [selectedAnalyse, setSelectedAnalyse] = useState(null); // Analyse sélectionnée pour modification
  const [loading, setLoading] = useState(true); // Indicateur de chargement
  const navigate = useNavigate();
  const API_URL = "https://localhost:7162/api/Analyse";

  // Charger toutes les analyses
  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(API_URL);
      setAnalyses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des analyses:", error);
      setLoading(false);
    }
  };
  const handleNavigateToAddImage = (analyseId) => {
    navigate(`/analyses/${analyseId}/add-image`);
  };
  const handleOpenDelete = (analyse) => {
    setAnalyseToDelete(analyse);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setAnalyseToDelete(null); // Réinitialiser l'analyse à supprimer
  };

  // Gérer l'ouverture du formulaire pour ajout
  const handleAddAnalyse = () => {
    setSelectedAnalyse(null); // Aucun analyse sélectionnée (ajout)
    setOpenForm(true); // Ouvrir le formulaire
  };

  // Gérer l'ouverture du formulaire pour modification
  const handleEditAnalyse = (analyse) => {
    setSelectedAnalyse(analyse); // Assigner l'analyse pour modification
    setOpenForm(true); // Ouvrir le formulaire en mode modification
  };

  // Si les analyses sont en cours de chargement
  if (loading) {
    return <Typography variant="h6">Chargement des analyses...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Gestion des Analyses
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={handleAddAnalyse} // Ouvrir le formulaire d'ajout
      >
        Ajouter une Analyse
      </Button>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Date d'Analyse</b></TableCell>
              <TableCell><b>Résultat</b></TableCell>
              <TableCell><b>Dossier Médical</b></TableCell>
              <TableCell><b>Ajoute Image</b></TableCell>
              <TableCell><b>Voir Image</b></TableCell>
              <TableCell><b>Voir Détails</b></TableCell>
              <TableCell><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyses.map((analyse) => {
              return (
                <TableRow key={analyse.id}>
                  <TableCell>{analyse.id}</TableCell>
                  <TableCell>{new Date(analyse.dateAnalyse).toLocaleDateString()}</TableCell>
                  <TableCell>{analyse.resultat}</TableCell>
                  <TableCell>{analyse.dossierMedicalId}</TableCell>
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleNavigateToAddImage(analyse.id)}>
                      <AddPhotoAlternate />
                    </IconButton>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  {/* Affichage du champ analyse */}
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditAnalyse(analyse)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDelete(analyse)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulaire d'ajout ou modification de analyse */}
      <AnalyseForm
        open={openForm}
        handleClose={() => setOpenForm(false)} // Fermer le formulaire
        selectedAnalyse={selectedAnalyse} // Passer l'analyse pour modification
        refreshAnalyses={fetchAnalyses} // Rafraîchir la liste après modification
      />

      {/* Confirmation de suppression */}
      <DeleteConfirmation
        open={openDelete}
        handleClose={handleCloseDelete}
        entity={analyseToDelete} // Passer l'analyse à supprimer
        refreshEntities={fetchAnalyses} // Rafraîchir après suppression
        entityName="Analyse"
        apiUrl={API_URL}
      />
    </div>
  );
};

export default AnalyseList;
