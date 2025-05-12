import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Grid,
  Paper,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import Annotate from "../../../components/Annotate/Annotate";

const AnalyseForm = ({ open, handleClose, selectedAnalyse, refreshAnalyses, dossierMedicalId }) => {
  const API_URL = "https://localhost:7162/api/Analyse";
  const API_IMAGE_URL = "https://localhost:7162/api/ImageMedicale";

  const [formData, setFormData] = useState({
    dateAnalyse: "",
    rapport: "",
    dossierMedicalId: dossierMedicalId || "",
  });

  // Définir l'ID du dossier médical automatiquement
  useEffect(() => {
    if (dossierMedicalId) {
      console.log("ID du dossier médical récupéré:", dossierMedicalId);
      setFormData(prev => ({
        ...prev,
        dossierMedicalId: dossierMedicalId
      }));
    }
  }, [dossierMedicalId]);

  // États pour la gestion des onglets
  const [tabValue, setTabValue] = useState(0);

  // États pour l'upload d'images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(false); // Pour le chargement des images existantes
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [selectedImageForAnnotation, setSelectedImageForAnnotation] = useState(null);

  // États pour la génération de rapport
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [caption, setCaption] = useState('');
  const [generating, setGenerating] = useState(false);

  // ID de l'analyse créée (pour l'upload d'images)
  const [createdAnalyseId, setCreatedAnalyseId] = useState(null);

  // Icônes FontAwesome sont utilisées directement dans le JSX

  // Fonction pour obtenir la date du jour au format YYYY-MM-DD
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fonction pour récupérer les images associées à une analyse
  const fetchAnalyseImages = async (analyseId) => {
    setImagesLoading(true);
    try {
      console.log("Récupération des images pour l'analyse ID:", analyseId);
      console.log("URL de l'API:", `${API_IMAGE_URL}/by-analyse/${analyseId}`);

      // Utiliser l'URL exacte fournie par l'API
      const response = await axios.get(`https://localhost:7162/api/ImageMedicale/by-analyse/${analyseId}`);
      console.log("Réponse brute:", response);
      console.log("Images récupérées:", response.data);

      if (!response.data || response.data.length === 0) {
        console.log("Aucune image trouvée pour cette analyse");
        setImagesLoading(false);
        return [];
      }

      // Transformer les données pour correspondre à notre format
      const images = response.data.map(img => ({
        id: img.idIm,
        url: img.url,
        analyseId: img.analyseId,
        isTemp: false // Ces images sont déjà sauvegardées
      }));

      console.log("Images transformées:", images);
      setImagesLoading(false);
      return images;
    } catch (error) {
      console.error("Erreur lors de la récupération des images:", error);
      console.error("Détails de l'erreur:", error.response || error.message);
      setImagesLoading(false);
      return [];
    }
  };

  // Log pour le montage/démontage du composant
  useEffect(() => {
    console.log("Composant AnalyseForm monté");
    return () => {
      console.log("Composant AnalyseForm démonté");
    };
  }, []);

  // Réinitialiser le formulaire à chaque ouverture
  useEffect(() => {
    console.log("État 'open' changé:", open);
    if (open) {
      const formattedDate = getTodayFormatted();
      console.log("Date du jour formatée:", formattedDate);

      if (selectedAnalyse) {
        const analyseDate = selectedAnalyse.dateAnalyse?.split("T")[0] || formattedDate;
        console.log("Utilisation de la date d'analyse existante ou date du jour:", analyseDate);

        setFormData({
          id: selectedAnalyse.id || 0,
          dateAnalyse: analyseDate,
          rapport: selectedAnalyse.rapport || "",
          dossierMedicalId: selectedAnalyse.dossierMedicalId || "",
        });

        // Récupérer les images associées à l'analyse
        if (selectedAnalyse.id) {
          console.log("Analyse sélectionnée avec ID:", selectedAnalyse.id);
          setCreatedAnalyseId(selectedAnalyse.id);

          // Récupérer les images existantes
          console.log("Appel de fetchAnalyseImages avec ID:", selectedAnalyse.id);
          fetchAnalyseImages(selectedAnalyse.id)
            .then(images => {
              console.log("Images récupérées pour l'analyse:", images);
              console.log("Nombre d'images récupérées:", images.length);

              if (images.length > 0) {
                console.log("Mise à jour de uploadedImages avec les images récupérées");
                setUploadedImages(images);

                // Si des images sont disponibles, les utiliser pour la génération de rapport
                console.log("Images disponibles pour la génération de rapport");
              } else {
                console.log("Aucune image récupérée pour cette analyse");
              }
            })
            .catch(error => {
              console.error("Erreur lors de la récupération des images:", error);
            });
        }
      } else {
        // Pour une nouvelle analyse, définir automatiquement la date à aujourd'hui
        console.log("Nouvelle analyse: utilisation de la date du jour:", formattedDate);

        setFormData({
          id: 0,
          dateAnalyse: formattedDate,
          rapport: "",
          dossierMedicalId: dossierMedicalId || "",
        });

        // Réinitialiser les autres états
        setUploadedImages([]);
        setCreatedAnalyseId(null);
        setTabValue(0);
      }
    }
  }, [open, selectedAnalyse, dossierMedicalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion des onglets
  const handleTabChange = (_, newValue) => {
    console.log("Changement d'onglet:", newValue);
    console.log("Images disponibles:", uploadedImages);
    setTabValue(newValue);
  };

  // Fonction pour uploader une image
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Stocker l'image pour la génération de rapport
    if (!image1) {
      setImage1(file);
    } else if (!image2) {
      setImage2(file);
    }

    // Ajouter l'image à la liste des images uploadées temporairement
    // même si nous n'avons pas encore d'ID d'analyse
    const tempUrl = URL.createObjectURL(file);

    setUploadedImages(prev => [...prev, {
      id: null, // ID temporaire
      url: tempUrl,
      file: file,
      isTemp: true // Marquer comme temporaire
    }]);
  };

  // Fonction pour supprimer une image
  const handleRemoveImage = (index) => {
    const imageToRemove = uploadedImages[index];

    // Mettre à jour les images pour la génération de rapport
    if (image1 && image1 === imageToRemove.file) {
      setImage1(null);
    } else if (image2 && image2 === imageToRemove.file) {
      setImage2(null);
    }

    // Si l'image est en cours d'annotation, fermer l'annotation
    if (selectedImageForAnnotation && selectedImageForAnnotation.id === imageToRemove.id) {
      setShowAnnotation(false);
      setSelectedImageForAnnotation(null);
    }

    // Supprimer l'image de la liste
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Fonction pour ouvrir l'annotation d'une image
  const handleAnnotateImage = (image) => {
    // Vérifier si l'image a un ID valide
    if (!image.id || image.isTemp) {
      // Si l'analyse existe déjà, uploader l'image d'abord
      if (selectedAnalyse || createdAnalyseId) {
        const analyseId = selectedAnalyse?.id || createdAnalyseId;

        alert("L'image doit d'abord être sauvegardée pour pouvoir être annotée. Sauvegarde en cours...");

        // Uploader l'image temporaire
        setUploadLoading(true);
        uploadImageToServer(image.file, analyseId)
          .then(uploadedImage => {
            console.log("Image uploadée avec succès:", uploadedImage);

            // Remplacer l'image temporaire par l'image uploadée
            setUploadedImages(prev =>
              prev.map(img => img === image ? uploadedImage : img)
            );

            // Ouvrir l'annotation avec l'image uploadée
            setSelectedImageForAnnotation(uploadedImage);
            setShowAnnotation(true);
            setUploadLoading(false);
          })
          .catch(error => {
            console.error("Erreur lors de l'upload de l'image:", error);
            alert("Erreur lors de la sauvegarde de l'image. Veuillez d'abord sauvegarder l'analyse.");
            setUploadLoading(false);
          });
      } else {
        alert("Veuillez d'abord sauvegarder l'analyse pour pouvoir annoter les images.");
      }
    } else {
      // L'image a déjà un ID valide, ouvrir directement l'annotation
      setSelectedImageForAnnotation(image);
      setShowAnnotation(true);
    }
  };

  // Fonction pour fermer l'annotation
  const handleCloseAnnotation = () => {
    setShowAnnotation(false);
    setSelectedImageForAnnotation(null);
  };

  // Fonction pour télécharger une image à partir de son URL
  const downloadImageAsFile = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], "image.jpg", { type: blob.type });
    } catch (error) {
      console.error("Erreur lors du téléchargement de l'image:", error);
      throw error;
    }
  };

  // Fonction pour générer un rapport
  const handleGenerateReport = async () => {
    if (uploadedImages.length === 0) {
      alert('Veuillez uploader au moins une image.');
      return;
    }

    setGenerating(true);

    try {
      const formData = new FormData();

      // Utiliser les images uploadées
      if (uploadedImages.length > 0) {
        // Vérifier si l'image a un fichier ou juste une URL
        if (uploadedImages[0].file) {
          formData.append('image1', uploadedImages[0].file);
        } else if (uploadedImages[0].url) {
          // Télécharger l'image à partir de l'URL
          try {
            const file = await downloadImageAsFile(uploadedImages[0].url);
            formData.append('image1', file);
          } catch (error) {
            console.error("Impossible de télécharger l'image 1:", error);
            alert("Erreur lors du téléchargement de l'image 1. Veuillez réessayer.");
            setGenerating(false);
            return;
          }
        }

        if (uploadedImages.length > 1) {
          if (uploadedImages[1].file) {
            formData.append('image2', uploadedImages[1].file);
          } else if (uploadedImages[1].url) {
            // Télécharger l'image à partir de l'URL
            try {
              const file = await downloadImageAsFile(uploadedImages[1].url);
              formData.append('image2', file);
            } catch (error) {
              console.error("Impossible de télécharger l'image 2:", error);
              // Continuer avec juste l'image 1
            }
          }
        }
      }

      // Appel à l'API Flask exactement comme dans AnalyseDetails.jsx
      const response = await axios.post('http://127.0.0.1:5002/', formData);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      const result = doc.querySelector('#caption')?.textContent || 'Aucun rapport généré.';

      setCaption(result);

      // Mettre à jour le champ rapport dans le formulaire
      setFormData(prev => ({
        ...prev,
        rapport: result
      }));

      // Si l'analyse existe déjà, mettre à jour le rapport
      if (createdAnalyseId || selectedAnalyse) {
        const analyseId = createdAnalyseId || selectedAnalyse.id;
        await axios.put(`${API_URL}/${analyseId}/rapport`, result, {
          headers: { 'Content-Type': 'application/json' }
        });

        // Rafraîchir la liste des analyses
        refreshAnalyses();
      }

    } catch (err) {
      console.error(err);

      // Message d'erreur plus détaillé
      if (err.code === 'ERR_NETWORK') {
        alert("Erreur de connexion au service de génération de rapport. Le service n'est pas disponible ou n'est pas démarré.");
      } else {
        alert(`Erreur lors de la génération du rapport: ${err.message}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  // Fonction pour uploader une image vers le serveur
  const uploadImageToServer = async (file, analyseId) => {
    try {
      // Étape 1: Upload de l'image
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(`${API_IMAGE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedImageUrl = uploadResponse.data.url;

      // Étape 2: Création de l'objet ImageMedicale avec l'analyseId
      const imageMedicale = {
        url: uploadedImageUrl,
        analyseId: parseInt(analyseId),
        annotationGraphics: JSON.stringify([])
      };

      const creationResponse = await axios.post(API_IMAGE_URL, imageMedicale);

      return {
        id: creationResponse.data.idIm,
        url: uploadedImageUrl,
        file: file
      };
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifier que l'ID du dossier médical est bien défini
    if (!formData.dossierMedicalId && dossierMedicalId) {
      // Si l'ID n'est pas dans formData mais est disponible en prop, l'utiliser
      setFormData(prev => ({
        ...prev,
        dossierMedicalId: dossierMedicalId
      }));
    }

    // Vérifier que tous les champs requis sont remplis
    if (!formData.dateAnalyse) {
      alert("Veuillez sélectionner une date d'analyse.");
      return;
    }

    if (!formData.dossierMedicalId) {
      alert("L'ID du dossier médical est manquant. Veuillez réessayer.");
      console.error("ID du dossier médical manquant:", { formData, dossierMedicalId });
      return;
    }

    // Formater les données pour l'API
    const formattedData = {
      ...formData,
      dateAnalyse: new Date(formData.dateAnalyse).toISOString(),
      // S'assurer que dossierMedicalId est un nombre
      dossierMedicalId: parseInt(formData.dossierMedicalId)
    };

    console.log("Données envoyées à l'API:", formattedData);

    try {
      let analyseId;

      if (selectedAnalyse) {
        await axios.put(`${API_URL}/${selectedAnalyse.id}`, formattedData);
        analyseId = selectedAnalyse.id;
      } else {
        const response = await axios.post(API_URL, formattedData);
        analyseId = response.data.id;
        setCreatedAnalyseId(analyseId);

        // Si nous avons des images temporaires, les uploader maintenant
        if (uploadedImages.length > 0) {
          setUploadLoading(true);

          try {
            const newUploadedImages = [];

            // Uploader chaque image temporaire
            for (const image of uploadedImages) {
              if (image.isTemp) {
                const uploadedImage = await uploadImageToServer(image.file, analyseId);
                newUploadedImages.push(uploadedImage);
              } else {
                newUploadedImages.push(image);
              }
            }

            // Mettre à jour la liste des images uploadées
            setUploadedImages(newUploadedImages);

            // Passer à l'onglet de génération de rapport si nous avons des images
            if (newUploadedImages.length > 0) {
              setTabValue(2);
            }
          } catch (uploadError) {
            console.error("Erreur lors de l'upload des images:", uploadError);
          } finally {
            setUploadLoading(false);
          }
        }
      }

      // Si nous sommes dans l'onglet principal et qu'il n'y a pas d'images à uploader,
      // fermer le formulaire
      if (tabValue === 0 && uploadedImages.length === 0) {
        refreshAnalyses();
        handleClose();
      } else {
        // Sinon, rafraîchir la liste des analyses
        refreshAnalyses();
      }

    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'analyse:", error);

      // Afficher un message d'erreur plus détaillé
      if (error.response) {
        console.error("Détails de l'erreur:", error.response.data);
        alert(`Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Erreur lors de l'enregistrement de l'analyse. Veuillez vérifier que tous les champs sont correctement remplis.");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", mt: 1 }}>
        {selectedAnalyse ? "Modifier l'Analyse" : "Ajouter une Analyse"}
      </DialogTitle>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        centered
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Informations" />
        <Tab label="Images" />
        <Tab label="Génération de Rapport" disabled={uploadedImages.length === 0} />
      </Tabs>

      <DialogContent>
        {/* Onglet 1: Informations de base */}
        {tabValue === 0 && (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <TextField
                  label="Date d'Analyse"
                  type="date"
                  name="dateAnalyse"
                  value={formData.dateAnalyse}
                  onChange={handleChange}
                  required
                  fullWidth
                  slotProps={{ input: { placeholder: 'AAAA-MM-JJ' } }}
                  autoFocus
                  helperText="Date automatiquement définie à aujourd'hui"
                />
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      dateAnalyse: getTodayFormatted()
                    }));
                  }}
                >
                  Aujourd'hui
                </Button>
              </Box>

              <TextField
                label="Résultat"
                name="rapport"
                value={formData.rapport}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={4}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ID du Dossier Médical
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    p: 1,
                    border: '1px solid #ccc',
                    borderRadius: 1,
                    bgcolor: '#f5f5f5'
                  }}
                >
                  {formData.dossierMedicalId || dossierMedicalId || "Non spécifié"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  L'ID du dossier médical est automatiquement renseigné
                </Typography>
              </Box>
            </Stack>

            <DialogActions sx={{ justifyContent: "flex-end", mt: 3 }}>
              <Button onClick={handleClose} color="secondary" variant="outlined">
                Annuler
              </Button>
              <Button type="submit" color="primary" variant="contained">
                {selectedAnalyse ? "Modifier" : "Ajouter"}
              </Button>
            </DialogActions>
          </Box>
        )}

        {/* Onglet 2: Upload d'images */}
        {tabValue === 1 && (
          <Box sx={{ mt: 2 }}>
            {showAnnotation && selectedImageForAnnotation ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Annotation de l'image
                </Typography>

                <Box sx={{ position: 'relative', mb: 2 }}>
                  <Annotate filedata={{ url: selectedImageForAnnotation.url, id: selectedImageForAnnotation.id }} />

                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCloseAnnotation}
                    sx={{ mt: 2 }}
                  >
                    Terminer l'annotation
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Images pour l'analyse (max: 2)
                </Typography>

                {/* Indicateur de chargement */}
                {imagesLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Chargement des images...
                    </Typography>
                  </Box>
                )}

                {/* Affichage des images uploadées */}
                {!imagesLoading && uploadedImages.length > 0 && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                    {uploadedImages.map((image, index) => (
                      <Box key={index}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 1,
                            position: 'relative',
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            display: 'flex',
                            gap: 1,
                            bgcolor: 'rgba(255,255,255,0.7)',
                            borderRadius: '4px',
                            p: 0.5
                          }}>
                            <IconButton
                              size="small"
                              color={image.id && !image.isTemp ? "primary" : "default"}
                              onClick={() => handleAnnotateImage(image)}
                              title={image.id && !image.isTemp ? "Annoter l'image" : "Sauvegardez l'analyse pour annoter"}
                              sx={{
                                position: 'relative',
                                '&::after': image.id && !image.isTemp ? {} : {
                                  content: '""',
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'rgba(0,0,0,0.1)',
                                  borderRadius: '50%'
                                }
                              }}
                            >
                              <FontAwesomeIcon icon={faFileImage} />
                              {!(image.id && !image.isTemp) && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: 'warning.main',
                                    border: '1px solid white'
                                  }}
                                />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveImage(index)}
                              title="Supprimer l'image"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Bouton d'upload */}
                {uploadedImages.length < 2 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddPhotoAlternate />}
                      disabled={uploadLoading}
                    >
                      Sélectionner une image
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                  </Box>
                )}

                <DialogActions sx={{ justifyContent: "flex-end", mt: 3 }}>
                  <Button onClick={() => setTabValue(0)} color="secondary" variant="outlined">
                    Retour
                  </Button>
                  <Button onClick={() => setTabValue(2)} color="primary" variant="contained" disabled={uploadedImages.length === 0}>
                    Générer un rapport
                  </Button>
                </DialogActions>
              </>
            )}
          </Box>
        )}

        {/* Onglet 3: Génération de rapport */}
        {tabValue === 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Génération de rapport à partir d'images
            </Typography>

            {uploadedImages.length === 0 ? (
              <Typography color="error">
                Veuillez uploader des images pour pouvoir générer un rapport.
              </Typography>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Images sélectionnées pour la génération:
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                    {uploadedImages.map((image, index) => (
                      <Box key={index}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 1,
                            position: 'relative',
                            height: 150,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <img
                            src={image.url}
                            alt={`Image ${index + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              bottom: 5,
                              left: 5,
                              bgcolor: 'rgba(255,255,255,0.7)',
                              px: 1,
                              borderRadius: 1
                            }}
                          >
                            Image {index + 1}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={generating || uploadedImages.length === 0}
                    sx={{ mt: 2 }}
                  >
                    {generating ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Génération en cours...
                      </>
                    ) : (
                      "Générer un rapport"
                    )}
                  </Button>
                </Box>

                {caption && (
                  <Paper elevation={3} sx={{ p: 2, mt: 3, bgcolor: '#f8f9fa' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      📝 Rapport généré:
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {caption}
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            <DialogActions sx={{ justifyContent: "flex-end", mt: 3 }}>
              <Button onClick={() => setTabValue(1)} color="secondary" variant="outlined">
                Retour aux images
              </Button>
              <Button
                onClick={handleClose}
                color="primary"
                variant="contained"
                disabled={generating}
              >
                Terminer
              </Button>
            </DialogActions>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyseForm;
