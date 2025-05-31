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
  Alert,
} from "@mui/material";
import { AddPhotoAlternate, Delete } from "@mui/icons-material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import Annotate from "../../../components/Annotate/Annotate";

const AnalyseForm = ({ 
  open, 
  onClose: handleClose, 
  analyse: selectedAnalyse, 
  dossierMedicalId, 
  onSuccess,
  currentAnalyseId 
}) => {
  const API_URL = "https://localhost:7162/api/Analyse";
  const API_IMAGE_URL = "https://localhost:7162/api/ImageMedicale";

  const [formData, setFormData] = useState({
    dateAnalyse: new Date().toISOString().split('T')[0],
    rapport: "",
    dossierMedicalId: dossierMedicalId
  });

  // États pour la gestion des onglets
  const [tabValue, setTabValue] = useState(0);

  // États pour l'upload d'images
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const [selectedImageForAnnotation, setSelectedImageForAnnotation] = useState(null);

  // États pour la génération de rapport
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [caption, setCaption] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // ID de l'analyse créée (pour l'upload d'images)
  const [createdAnalyseId, setCreatedAnalyseId] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fonction pour obtenir la date du jour au format YYYY-MM-DD
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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
    if (open) {
      // Si c'est une nouvelle analyse (ajout)
      if (!selectedAnalyse && currentAnalyseId) {
        // Passer directement à l'onglet Images
        setTabValue(1);
        setCreatedAnalyseId(currentAnalyseId);
      }
      // Si c'est une modification
      else if (selectedAnalyse) {
        setCreatedAnalyseId(selectedAnalyse.id);
        // Charger les images existantes
        fetchExistingImages(selectedAnalyse.id);
      }
    }
  }, [open, currentAnalyseId, selectedAnalyse]);

  // Fonction pour charger les images existantes
  const fetchExistingImages = async (analyseId) => {
    try {
      const response = await axios.get(`${API_IMAGE_URL}/by-analyse/${analyseId}`);
      if (response.data && response.data.length > 0) {
        const images = response.data.map(img => ({
          id: img.idIm,
          url: img.url,
          analyseId: img.analyseId,
          isTemp: false
        }));
        setUploadedImages(images);
        
        // Préparer les images pour la génération de rapport
        if (images[0]) setImage1(images[0]);
        if (images[1]) setImage2(images[1]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
      setError("Erreur lors du chargement des images existantes");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion des onglets
  const handleTabChange = (_, newValue) => {
    // Si on essaie d'aller à l'onglet Génération de rapport sans images
    if (newValue === 2 && uploadedImages.length === 0) {
      alert("Veuillez d'abord ajouter au moins une image");
      return;
    }

    setTabValue(newValue);
  };

  // Fonction pour uploader une image
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier si nous avons déjà un ID d'analyse
    if (!createdAnalyseId) {
      alert("Veuillez d'abord créer l'analyse en cliquant sur 'Ajouter' dans l'onglet Informations");
      return;
    }

    setUploadLoading(true);

    try {
      // Upload direct de l'image
      const uploadedImage = await uploadImageToServer(file, createdAnalyseId);
      
      // Ajouter l'image à la liste
      setUploadedImages(prev => [...prev, uploadedImage]);

      // Stocker l'image pour la génération de rapport
      if (!image1) {
        setImage1(file);
      } else if (!image2) {
        setImage2(file);
      }

    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      alert("Erreur lors de l'upload de l'image. Veuillez réessayer.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Fonction pour supprimer une image
  const handleRemoveImage = async (index) => {
    const imageToRemove = uploadedImages[index];

    try {
      // Supprimer l'image du serveur
      await axios.delete(`${API_IMAGE_URL}/${imageToRemove.id}`);

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

    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      alert("Erreur lors de la suppression de l'image. Veuillez réessayer.");
    }
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

  // Fonction pour générer un rapport
  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setCaption(''); // Reset any previous caption

      let imagesToUse = [];

      // Si c'est une modification d'analyse, récupérer les images depuis l'API
      if (selectedAnalyse) {
        try {
          const analyseId = selectedAnalyse.id;
          const response = await axios.get(`${API_IMAGE_URL}/by-analyse/${analyseId}`);
          
          if (response.data && response.data.length > 0) {
            // Convertir les URLs en fichiers
            const images = await Promise.all(response.data.map(async (img) => {
              const imageResponse = await fetch(img.url);
              const blob = await imageResponse.blob();
              return new File([blob], `image${img.idIm}.jpg`, { type: 'image/jpeg' });
            }));
            imagesToUse = images;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des images:", error);
          throw new Error("Erreur lors du chargement des images de l'analyse.");
        }
      } else {
        // Pour une nouvelle analyse, utiliser les images déjà en mémoire
        if (image1) imagesToUse.push(image1);
        if (image2) imagesToUse.push(image2);
      }

      if (imagesToUse.length === 0) {
        throw new Error('Veuillez sélectionner au moins une image.');
      }

      // Vérifier si le serveur est disponible
      try {
        const healthCheck = await axios.get('http://127.0.0.1:5000/');
        console.log('Server status:', healthCheck.data);
      } catch {
        throw new Error('Le serveur de génération de rapport n\'est pas accessible. Veuillez vérifier qu\'il est bien démarré.');
      }

      // Préparer le FormData avec les images
      const formData = new FormData();
      formData.append('image1', imagesToUse[0]);
      if (imagesToUse[1]) {
        formData.append('image2', imagesToUse[1]);
      }

      // Appel à l'API Flask pour la génération du rapport
      const response = await axios.post('http://127.0.0.1:5000/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 60000, // 60 secondes timeout
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || 'Erreur lors de la génération du rapport');
      }

      const result = response.data.prediction || 'Aucun rapport généré.';
      setCaption(result);

      // Mettre à jour le champ rapport dans le formulaire
      setFormData(prev => ({
        ...prev,
        rapport: result
      }));
    } catch (err) {
      console.error('Erreur:', err);
      setCaption(err.message || "Erreur lors de la génération du rapport.");
      alert(err.message || "Erreur lors de la génération du rapport.");
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

  // Fonction pour sauvegarder l'analyse avec le rapport
  const handleSave = async () => {
    setSaving(true);
    try {
      const analyseId = selectedAnalyse?.id || currentAnalyseId;
      if (!analyseId) {
        throw new Error("ID de l'analyse non trouvé");
      }

      // Récupérer d'abord l'analyse actuelle
      const response = await axios.get(`${API_URL}/${analyseId}`);
      const currentAnalyse = response.data;

      // Mettre à jour l'analyse avec le nouveau rapport
      const updatedAnalyse = {
        ...currentAnalyse,
        rapport: caption
      };

      // Envoyer la mise à jour au backend
      await axios.put(`${API_URL}/${analyseId}`, updatedAnalyse);
      
      // Rafraîchir la liste des analyses
      if (onSuccess) {
        await onSuccess();
      }
      
      // Fermer le formulaire
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'analyse:", error);
      alert("Erreur lors de la sauvegarde de l'analyse. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        ...formData,
        dossierMedicalId: parseInt(dossierMedicalId)
      };

      if (selectedAnalyse) {
        // Mode modification
        await axios.put(`${API_URL}/${selectedAnalyse.id}`, {
          ...data,
          id: selectedAnalyse.id
        });
      } else {
        // Mode ajout
        await axios.post(API_URL, data);
      }

      if (onSuccess) {
        await onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError(error.response?.data?.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
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
              <Button type="submit" color="primary" variant="contained" disabled={loading}>
                {loading ? "Enregistrement..." : (selectedAnalyse ? "Modifier" : "Ajouter")}
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

                {/* Affichage des images uploadées */}
                {uploadedImages.length > 0 && (
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
              {caption ? (
                <>
                  <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving && <CircularProgress size={20} />}
                  >
                    {saving ? "Sauvegarde en cours..." : "Sauvegarder"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleGenerateReport}
                  color="primary"
                  variant="contained"
                  disabled={generating || uploadedImages.length === 0}
                >
                  {generating ? "Génération en cours..." : "Générer un rapport"}
                </Button>
              )}
            </DialogActions>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyseForm;
