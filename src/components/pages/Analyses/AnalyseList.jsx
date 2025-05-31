import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, Typography, Container, Box, CircularProgress, TablePagination
} from "@mui/material";
import { Edit, Delete, Add, AddPhotoAlternate } from "@mui/icons-material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import jsPDF from "jspdf";
import DeleteConfirmation from "../generique/DeleteConfirmation";
import AnalyseForm from "./AnalyseForm";
import { useNavigate } from "react-router-dom";

const AnalyseList = ({ patientId }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [analyseToDelete, setAnalyseToDelete] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAnalyse, setSelectedAnalyse] = useState(null);
  const [currentAnalyseId, setCurrentAnalyseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dossierMedicalId, setDossierMedicalId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const API_URL = "https://localhost:7162/api/Analyse";

  useEffect(() => {
    if (patientId) {
      console.log("Chargement du dossier médical pour le patient:", patientId);
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
    if (!dossierMedicalId) {
      console.warn("Pas de dossier médical ID disponible pour charger les analyses");
      setAnalyses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Chargement des analyses pour le dossier médical:", dossierMedicalId);
      const response = await axios.get(`${API_URL}/dossier/${dossierMedicalId}`);
      
      // Trier les analyses par date la plus récente
      const sortedAnalyses = response.data.sort((a, b) => {
        return new Date(b.dateAnalyse) - new Date(a.dateAnalyse);
      });
      
      setAnalyses(sortedAnalyses);
      setLoadError(false);
    } catch (error) {
      console.error("❌ Erreur chargement analyses :", error);
      setLoadError(true);
      setAnalyses([]);
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

  const handleAddAnalyse = async () => {
    if (!dossierMedicalId) {
      alert("Erreur: Impossible de créer une analyse sans dossier médical associé");
      return;
    }

    try {
      // Créer une nouvelle analyse avec la date du jour
      const formattedData = {
        dateAnalyse: new Date().toISOString(),
        dossierMedicalId: parseInt(dossierMedicalId),
        rapport: ""
      };

      console.log("Création d'une nouvelle analyse avec les données:", formattedData);

      // Appeler l'API pour créer l'analyse
      const response = await axios.post("https://localhost:7162/api/Analyse", formattedData);
      
      if (response.data && response.data.id) {
        console.log("Analyse créée avec succès, ID:", response.data.id);
        
        // Mettre à jour l'ID de l'analyse en cours
        setCurrentAnalyseId(response.data.id);
        
        // Ouvrir le formulaire en mode ajout
        setSelectedAnalyse(null);
        setOpenForm(true);
        
        // Rafraîchir la liste des analyses
        await fetchAnalyses();
      } else {
        throw new Error("La réponse de l'API ne contient pas l'ID de l'analyse");
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de l'analyse:", error);
      alert("Erreur lors de la création de l'analyse. Veuillez réessayer.");
    }
  };

  const handleEditAnalyse = (analyse) => {
    setSelectedAnalyse(analyse);
    setCurrentAnalyseId(analyse.id);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAnalyse(null);
    setCurrentAnalyseId(null);
    fetchAnalyses(); // Rafraîchir la liste après fermeture
  };

  const handleGeneratePDF = async (analyse) => {
    try {
      // Récupérer les informations du patient
      const dossierResponse = await axios.get(`https://localhost:7162/api/DossiersMedicaux/${analyse.dossierMedicalId}`); 
      const patientResponse = await axios.get(`https://localhost:7162/api/Patients/${dossierResponse.data.patientId}`); 
      const patient = patientResponse.data;
  
      // Informations médecin
      const medecin = JSON.parse(localStorage.getItem('user'));
  
      // Récupérer les images associées à l'analyse
      const imagesResponse = await axios.get(`https://localhost:7162/api/ImageMedicale/by-analyse/${analyse.id}`); 
      const images = imagesResponse.data;
  
      // Créer le PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 30;
  
      // En-tête
      pdf.setFont("helvetica");
      pdf.setFontSize(20);
      pdf.setTextColor(0, 83, 155); // Bleu professionnel
      pdf.text("Rapport d'Analyse Médicale", pageWidth / 2, 20, { align: "center" });
  
      // Infos médecin
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Médecin traitant:", 20, 40);
      pdf.text(`Dr. ${medecin?.name || 'Non spécifié'}`, 80, 40);
  
      // Infos patient
      pdf.text("Patient:", 20, 50);
      pdf.text(patient?.nom || 'Non spécifié', 80, 50);
      pdf.text("Date de naissance:", 20, 60);
      pdf.text(
        patient?.dateNaissance ? new Date(patient.dateNaissance).toLocaleDateString('fr-FR') : 'Non spécifiée',
        80,
        60
      );
      pdf.text("Téléphone:", 20, 70);
      pdf.text(patient?.NumTel || 'Non spécifié', 80, 70);
  
      pdf.text("Date de l'analyse:", 20, 80);
      pdf.text(
        new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        80,
        80
      );
  
      // Ligne de séparation
      pdf.setDrawColor(0, 83, 155);
      pdf.line(20, 90, 190, 90);
  
      // Rapport
      pdf.setFontSize(14);
      pdf.text("Rapport détaillé", 20, 100);
      pdf.setFontSize(12);
      const splitRapport = pdf.splitTextToSize(analyse.rapport || "Aucun rapport disponible", 170);
      pdf.text(splitRapport, 20, 110);
  
      // Fonction utilitaire pour charger une image en base64
      const loadImageAsBase64 = async (url) => {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (!response.ok) throw new Error(`Échec du chargement de l’image : ${url}`);
          
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // Base64
            reader.onerror = () => reject(new Error("Erreur lors de la conversion de l'image"));
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Impossible de charger l’image :", error);
          return null;
        }
      };
  
      // Ajouter les images au PDF
      if (images && images.length > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text("Images associées", 20, 20);
        yPos = 30;
      }
  
      for (const image of images) {
        try {
          const imgData = await loadImageAsBase64(image.url);
          if (!imgData) continue;
  
          // Dimensions adaptées à la page
          const margin = 20;
          const imgMaxWidth = pageWidth - 2 * margin;
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.width / imgProps.height;
          const imgHeight = imgMaxWidth / ratio;
  
          // Vérifier si on dépasse la page
          if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yPos = 30;
          }
  
          // Ajouter l'image
          pdf.addImage(imgData, 'JPEG', margin, yPos, imgMaxWidth, imgHeight);
          yPos += imgHeight + 20;
        } catch (error) {
          console.error("Erreur lors de l'ajout d'une image au PDF :", error);
        }
      }
  
      // Pied de page
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      const currentDate = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Document généré le ${currentDate}`, 20, pdf.internal.pageSize.height - 10);
  
      // Nom du fichier
      const fileName = `analyse_${patient?.nom || 'patient'}_${new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
  
      // Télécharger le PDF
      pdf.save(fileName);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Liste des Analyses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddAnalyse}
        >
          Nouvelle Analyse
        </Button>
      </Box>

      {loadError ? (
        <Typography color="error" sx={{ mt: 2 }}>
          ❌ Erreur lors du chargement des analyses.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <b>Date</b>
                  </Box>
                </TableCell>
                <TableCell><b>Rapport</b></TableCell>
                <TableCell align="center"><b>Images</b></TableCell>
                <TableCell align="center"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? analyses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : analyses
              ).map((analyse) => (
                <TableRow 
                  key={analyse.id}
                  onClick={() => handleNavigateToAnalyseDetail(analyse.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <TableCell>
                    {new Date(analyse.dateAnalyse).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {analyse.rapport || "Aucun rapport disponible"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToAddImage(analyse.id);
                      }}
                      title="Ajouter des images"
                    >
                      <AddPhotoAlternate />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAnalyse(analyse);
                      }}
                      title="Modifier"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGeneratePDF(analyse);
                      }}
                      title="Générer PDF"
                      sx={{ mr: 1 }}
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(analyse);
                      }}
                      title="Supprimer"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={analyses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
          />
        </TableContainer>
      )}

      <DeleteConfirmation
        open={openDelete}
        handleClose={handleCloseDelete}
        entity={analyseToDelete}
        refreshEntities={fetchAnalyses}
        entityName="Analyse"
        apiUrl={API_URL}
      />

      <AnalyseForm
        open={openForm}
        onClose={handleCloseForm}
        analyse={selectedAnalyse}
        currentAnalyseId={currentAnalyseId}
        onSuccess={fetchAnalyses}
        dossierMedicalId={dossierMedicalId}
      />
    </Container>
  );
};

export default AnalyseList;
