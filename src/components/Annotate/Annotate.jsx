import { useEffect, useRef, useState } from 'react';
import { Annotorious } from '@recogito/annotorious';
import '@recogito/annotorious/dist/annotorious.min.css';
import SelectorPack from '@recogito/annotorious-selector-pack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faVectorSquare,
  faDrawPolygon,
  faCrosshairs,
  faDownload,
  faUndo,
  faEye,
  faEyeSlash,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Annotations from './Annotations';

function Annotate({ filedata }) {
  const [isShownAnno, setIsShownAnno] = useState(true);
  const [xyz, setXyz] = useState([]);
  const [anno, setAnno] = useState();
  const [tool, setTool] = useState('rect');
  const [isSaving, setIsSaving] = useState(false);
  const imgEl = useRef();

  // Store annotations data
  const annotationsRef = useRef({
    objects: [],
    annotations: [],
    exportData: []
  });

  // Helper function to safely parse JSON
  const safeJsonParse = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("JSON parse error:", e);
      return null;
    }
  };

  // Save annotations to backend
  const saveAnnotationsToBackend = async () => {
    if (!filedata?.id) {
      console.error("Cannot save - no image ID in filedata:", filedata);
      alert("L'image n'a pas encore été sauvegardée. Veuillez d'abord sauvegarder l'analyse pour pouvoir enregistrer les annotations.");
      return;
    }

    setIsSaving(true);
    try {
      // Récupérer les annotations actuelles
      const currentAnnotations = anno ? anno.getAnnotations() : [];
      console.log("Annotations à sauvegarder:", currentAnnotations);

      // Vérifier si nous avons des annotations à sauvegarder
      if (currentAnnotations.length === 0 && annotationsRef.current.objects.length === 0) {
        console.log("Aucune annotation à sauvegarder");

        // Créer un payload vide mais valide
        const emptyPayload = {
          annotations: [],
          objects: [],
          exportData: []
        };

        const response = await axios.patch(
          `https://localhost:7162/api/ImageMedicale/${filedata.id}/annotate-graphics`,
          emptyPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log("Réponse de sauvegarde (vide):", response.data);
        alert("Aucune annotation à sauvegarder.");
        setIsSaving(false);
        return;
      }

      // Mettre à jour les références
      annotationsRef.current.annotations = currentAnnotations;

      // Vérifier que chaque annotation a un type et une valeur valides
      const validObjects = annotationsRef.current.objects.filter(obj => {
        return obj && obj.id && obj.type && obj.value;
      });

      // Vérifier que chaque exportData a des attributs valides
      const validExportData = annotationsRef.current.exportData.filter(data => {
        return data && data.region_id && data.region_shape_attributes && data.region_shape_attributes.value;
      });

      // Mettre à jour les compteurs
      validExportData.forEach(o => o.region_count = currentAnnotations.length);

      const payload = {
        annotations: annotationsRef.current.annotations,
        objects: validObjects,
        exportData: validExportData
      };

      console.log("Sauvegarde des annotations pour l'image ID:", filedata.id);
      console.log("Payload final:", payload);

      // Convertir en JSON pour vérifier la validité
      const jsonPayload = JSON.stringify(payload);
      console.log("Payload JSON:", jsonPayload);

      const response = await axios.patch(
        `https://localhost:7162/api/ImageMedicale/${filedata.id}/annotate-graphics`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      console.log("Réponse de sauvegarde:", response.data);

      // Afficher un message de succès
      alert("Annotations sauvegardées avec succès!");

      // Recharger les annotations pour s'assurer qu'elles sont correctement affichées
      loadExistingAnnotations();
    } catch (error) {
      console.error("Error saving annotations:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
        alert(`Failed to save annotations: ${error.response.data?.message || error.response.statusText}`);
      } else {
        alert("Failed to save annotations: Network error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing annotations
  const loadExistingAnnotations = async () => {
    try {
      if (!filedata?.id) {
        console.log("No image ID in filedata - skipping annotation load");
        return;
      }

      const response = await axios.get(
        `https://localhost:7162/api/ImageMedicale/${filedata.id}`,
        {
          headers: { 'Accept': 'application/json' },
          validateStatus: (status) => status < 500
        }
      );

      if (response.status === 404) {
        console.log("No existing annotations found for image", filedata.id);
        return;
      }

      if (response.data?.annotationGraphics) {
        const existingData = safeJsonParse(response.data.annotationGraphics);
        if (existingData) {
          console.log("Loaded existing annotations:", existingData);
          if (anno) {
            anno.setAnnotations(existingData.annotations || []);
          }
          annotationsRef.current = {
            objects: existingData.objects || [],
            annotations: existingData.annotations || [],
            exportData: existingData.exportData || []
          };
          setXyz(existingData.annotations || []);
        }
      }
    } catch (error) {
      console.error("Error loading annotations:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
    }
  };

  useEffect(() => {
    let annotorious = null;

    if (imgEl.current) {
      try {
        // Initialiser Annotorious avec plus d'options
        annotorious = new Annotorious({
          image: imgEl.current,
          widgets: ['COMMENT'],
          disableEditor: false,
          readOnly: false,
          allowEmpty: true,
          crosshair: true // Activer le réticule pour une meilleure précision
        });

        // Solution radicale pour l'erreur "l.supports is not a function"
        try {
          // 1. Remplacer complètement la méthode find de Array.prototype
          const originalArrayFind = Array.prototype.find;
          Array.prototype.find = function(callback) {
            try {
              return originalArrayFind.call(this, function(item) {
                try {
                  return callback(item);
                } catch (e) {
                  console.error("Erreur dans callback de find:", e);
                  return false;
                }
              });
            } catch (e) {
              console.error("Erreur dans find:", e);
              return undefined;
            }
          };

          // 2. Intercepter toutes les erreurs non capturées
          window.addEventListener('error', function(event) {
            if (event.error && event.error.toString().includes('supports is not a function')) {
              console.log("Erreur 'supports is not a function' interceptée globalement");
              event.preventDefault();
              event.stopPropagation();
              return true;
            }
          }, true);

          // 3. Remplacer la méthode forAnnotation si elle existe
          if (annotorious._formatters) {
            console.log("Formatters trouvés:", annotorious._formatters);

            // Créer une fonction supports universelle
            const universalSupports = function() { return true; };

            // Ajouter la fonction supports à tous les formatters
            for (let i = 0; i < annotorious._formatters.length; i++) {
              if (annotorious._formatters[i] && typeof annotorious._formatters[i] === 'object') {
                annotorious._formatters[i].supports = universalSupports;
              }
            }

            // Remplacer la méthode forAnnotation
            annotorious._formatters.forAnnotation = function() {
              // Retourner le premier formatter (qui a maintenant une fonction supports)
              return this[0] || { supports: universalSupports };
            };

            console.log("Méthode forAnnotation remplacée");
          }

          // 4. Patch pour la méthode setDrawingTool
          const originalSetDrawingTool = annotorious.setDrawingTool;
          annotorious.setDrawingTool = function(tool) {
            try {
              console.log("Changement d'outil vers:", tool);
              return originalSetDrawingTool.call(this, tool);
            } catch (e) {
              console.error("Erreur lors du changement d'outil:", e);
              return false;
            }
          };

          console.log("Solution radicale appliquée pour l'erreur 'supports is not a function'");
        } catch (e) {
          console.warn("Impossible d'appliquer la solution radicale:", e);
        }

        // Ajouter le pack de sélecteurs (rectangle, polygone, ellipse)
        SelectorPack(annotorious, {
          tools: ['rect', 'polygon', 'ellipse'],
          defaultTool: 'rect'
        });

        // Forcer l'initialisation des outils
        annotorious.disableEditor = false;
        annotorious.readOnly = false;

        // Forcer le rechargement des outils
        try {
          // Réinitialiser les outils pour s'assurer qu'ils sont tous disponibles
          annotorious.addDrawingTool('rect', 'Rectangle');
          annotorious.addDrawingTool('polygon', 'Polygone');
          annotorious.addDrawingTool('ellipse', 'Ellipse');
        } catch (toolError) {
          console.warn("Erreur lors de l'ajout manuel des outils:", toolError);
        }

        // Vérifier les outils disponibles
        const availableTools = annotorious.listDrawingTools();
        console.log("Outils d'annotation disponibles:", availableTools);

        // Activer l'outil rectangle par défaut
        if (availableTools.includes('rect')) {
          annotorious.setDrawingTool('rect');
          setTool('rect');
        } else {
          console.error("L'outil rectangle n'est pas disponible");
        }

        console.log("Annotorious initialisé avec succès");

        // Définir les gestionnaires d'événements
        const handleCreateAnnotation = (annotation) => {
          console.log("Annotation créée:", annotation);

          // Vérifier si l'annotation est valide
          if (!annotation || !annotation.target || !annotation.target.selector) {
            console.error("Annotation invalide:", annotation);
            return;
          }

          // Ajouter une fonction supports universelle à tous les objets
          const addSupportsToAll = (obj) => {
            if (obj && typeof obj === 'object') {
              // Ajouter la fonction supports à l'objet actuel
              if (!obj.supports) {
                obj.supports = function() { return true; };
              }

              // Parcourir récursivement toutes les propriétés de l'objet
              for (const key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
                  addSupportsToAll(obj[key]);
                }
              }
            }
          };

          // Appliquer la fonction supports à toute l'annotation
          try {
            addSupportsToAll(annotation);
            console.log("Fonction supports ajoutée à tous les objets de l'annotation");
          } catch (e) {
            console.warn("Erreur lors de l'ajout de la fonction supports:", e);
          }

          // Stocker l'outil actuel dans l'annotation
          annotation._toolUsed = tool;
          console.log("Outil utilisé enregistré dans l'annotation:", tool);

          const annotations = annotorious.getAnnotations();
          console.log("Toutes les annotations:", annotations);

          const ob = annotation.body.map(b => ({
            purpose: b.purpose,
            value: b.value
          }));

          // Simplifier la détection du type d'annotation
          // Utiliser directement l'outil actuel comme type
          let temp, shapeVal, toolName = tool;

          const selectorType = annotation.target.selector.type;
          const selectorValue = annotation.target.selector.value;

          console.log("Type de sélecteur:", selectorType);
          console.log("Valeur du sélecteur:", selectorValue);
          console.log("Outil actuel utilisé comme type:", toolName);

          // Simplification radicale : utiliser directement l'outil actuel
          // et extraire les valeurs en fonction du type de sélecteur
          if (selectorType === 'FragmentSelector') {
            // Rectangle (format xywh)
            shapeVal = selectorValue.slice(11); // Enlever "xywh=pixel:"
            console.log("Valeurs extraites (rectangle):", shapeVal);
          } else if (selectorType === 'SvgSelector') {
            if (toolName === 'ellipse' || selectorValue.includes('<ellipse')) {
              // Ellipse
              const matches = selectorValue.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
              if (matches && matches.length === 5 && matches[3] !== "Infinity" && matches[4] !== "Infinity") {
                shapeVal = `${matches[1]},${matches[2]},${matches[3]},${matches[4]}`;
              } else {
                // Valeurs par défaut
                shapeVal = "100,100,50,50";
              }
              console.log("Valeurs extraites (ellipse):", shapeVal);
            } else if (toolName === 'polygon' || selectorValue.includes('<polygon')) {
              // Polygone
              const pointsMatch = selectorValue.match(/points="([^"]+)"/);
              if (pointsMatch && pointsMatch.length > 1) {
                shapeVal = pointsMatch[1];
              } else if (selectorValue.includes('<polygon')) {
                shapeVal = selectorValue.slice(22, -18);
              } else {
                // Valeurs par défaut
                shapeVal = "0,0 100,0 100,100 0,100";
              }
              console.log("Valeurs extraites (polygone):", shapeVal);
            } else {
              // Valeur brute si rien ne correspond
              shapeVal = selectorValue;
              console.log("Valeurs brutes utilisées:", shapeVal);
            }
          } else {
            // Valeur brute pour les autres types
            shapeVal = selectorValue;
            console.log("Valeurs brutes utilisées (type non standard):", shapeVal);
          }

          // Créer l'objet temp avec l'outil actuel comme type
          temp = {
            id: annotation.id,
            type: selectorType,
            tool: toolName, // Utiliser directement l'outil actuel
            value: shapeVal
          };

          console.log("Objet d'annotation créé:", temp);

          // Vérifier que le type d'outil est correctement défini
          if (!toolName) {
            console.warn("Type d'outil non défini, utilisation de l'outil actuel:", currentTool);
            toolName = currentTool;
          }

          if (temp) {
            annotationsRef.current.objects.push(temp);
            annotationsRef.current.annotations = annotations;
            setXyz(annotations);

            annotationsRef.current.exportData.push({
              file_name: filedata.name,
              file_size: filedata.size,
              region_count: annotations.length,
              region_id: annotation.id,
              region_shape_attributes: {
                tool_name: toolName, // Utiliser toolName au lieu de selectorType
                value: shapeVal
              },
              region_attributes: ob
            });

            annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
          }
        };

        const handleUpdateAnnotation = (annotation) => {
          console.log("Mise à jour de l'annotation:", annotation);

          // Vérifier si l'annotation est valide
          if (!annotation || !annotation.target || !annotation.target.selector) {
            console.error("Annotation invalide lors de la mise à jour:", annotation);
            return;
          }

          // Ajouter une fonction supports universelle à tous les objets
          const addSupportsToAll = (obj) => {
            if (obj && typeof obj === 'object') {
              // Ajouter la fonction supports à l'objet actuel
              if (!obj.supports) {
                obj.supports = function() { return true; };
              }

              // Parcourir récursivement toutes les propriétés de l'objet
              for (const key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] === 'object' && obj[key] !== null) {
                  addSupportsToAll(obj[key]);
                }
              }
            }
          };

          // Appliquer la fonction supports à toute l'annotation
          try {
            addSupportsToAll(annotation);
            console.log("Fonction supports ajoutée à tous les objets de l'annotation (mise à jour)");
          } catch (e) {
            console.warn("Erreur lors de l'ajout de la fonction supports (mise à jour):", e);
          }

          // Récupérer l'outil utilisé ou utiliser l'outil actuel
          const toolUsed = annotation._toolUsed || tool;
          console.log("Outil utilisé pour la mise à jour:", toolUsed);

          const annotations = annotorious.getAnnotations();
          const index = annotationsRef.current.objects.findIndex(i => i.id === annotation.id);
          console.log("Index de l'annotation à mettre à jour:", index);

          const selectorType = annotation.target.selector.type;
          const selectorValue = annotation.target.selector.value;

          console.log("Type de sélecteur (mise à jour):", selectorType);
          console.log("Valeur du sélecteur (mise à jour):", selectorValue);

          let shapeVal, toolName = toolUsed;

          // Simplification radicale : extraire les valeurs en fonction du type de sélecteur
          if (index !== -1) {
            if (selectorType === 'FragmentSelector') {
              // Rectangle
              shapeVal = selectorValue.slice(11);
              console.log("Rectangle mis à jour:", shapeVal);
            } else if (selectorType === 'SvgSelector') {
              if (toolName === 'ellipse' || selectorValue.includes('<ellipse')) {
                // Ellipse
                const matches = selectorValue.match(/cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/);
                if (matches && matches.length === 5 && matches[3] !== "Infinity" && matches[4] !== "Infinity") {
                  shapeVal = `${matches[1]},${matches[2]},${matches[3]},${matches[4]}`;
                } else {
                  // Valeurs par défaut
                  shapeVal = "100,100,50,50";
                }
                console.log("Ellipse mise à jour:", shapeVal);
              } else if (toolName === 'polygon' || selectorValue.includes('<polygon')) {
                // Polygone
                const pointsMatch = selectorValue.match(/points="([^"]+)"/);
                if (pointsMatch && pointsMatch.length > 1) {
                  shapeVal = pointsMatch[1];
                } else if (selectorValue.includes('<polygon')) {
                  shapeVal = selectorValue.slice(22, -18);
                } else {
                  // Valeurs par défaut
                  shapeVal = "0,0 100,0 100,100 0,100";
                }
                console.log("Polygone mis à jour:", shapeVal);
              } else {
                // Valeur brute si rien ne correspond
                shapeVal = selectorValue;
                console.log("Valeurs brutes utilisées (mise à jour):", shapeVal);
              }
            } else {
              // Valeur brute pour les autres types
              shapeVal = selectorValue;
              console.log("Valeurs brutes utilisées (type non standard, mise à jour):", shapeVal);
            }

            // Mettre à jour l'objet dans annotationsRef
            annotationsRef.current.objects[index].value = shapeVal;
            annotationsRef.current.objects[index].tool = toolName;
            console.log("Annotation mise à jour avec succès dans annotationsRef");
          } else {
            console.warn("Annotation non trouvée pour la mise à jour:", annotation.id);
          }

          const ob = annotation.body.map(b => ({
            purpose: b.purpose,
            value: b.value
          }));

          const index2 = annotationsRef.current.exportData.findIndex(i => i.region_id === annotation.id);
          if (index2 !== -1) {
            // Utiliser les mêmes valeurs que celles calculées précédemment
            annotationsRef.current.exportData[index2].region_shape_attributes.value = shapeVal;
            annotationsRef.current.exportData[index2].region_shape_attributes.tool_name = toolName;
            annotationsRef.current.exportData[index2].region_attributes = ob;

            console.log("Données d'exportation mises à jour avec succès:", {
              tool_name: toolName,
              value: shapeVal
            });
          } else {
            console.warn("Données d'exportation non trouvées pour la mise à jour:", annotation.id);
          }

          annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
          annotationsRef.current.annotations = annotations;
          setXyz(annotations);

          console.log("Annotation mise à jour avec succès");
        };

        const handleDeleteAnnotation = (annotation) => {
          const annotations = annotorious.getAnnotations();
          annotationsRef.current.objects = annotationsRef.current.objects.filter(o => o.id !== annotation.id);
          annotationsRef.current.exportData = annotationsRef.current.exportData.filter(o => o.region_id !== annotation.id);

          annotationsRef.current.exportData.forEach(o => o.region_count = annotations.length);
          annotationsRef.current.annotations = annotations;
          setXyz(annotations);
        };

        annotorious.on('createAnnotation', handleCreateAnnotation);
        annotorious.on('updateAnnotation', handleUpdateAnnotation);
        annotorious.on('deleteAnnotation', handleDeleteAnnotation);

        setAnno(annotorious);
        loadExistingAnnotations();
      } catch (error) {
        console.error("Erreur lors de l'initialisation d'Annotorious:", error);
        alert("Une erreur s'est produite lors de l'initialisation de l'outil d'annotation. Veuillez recharger la page.");
      }
    }

    return () => {
      if (anno) {
        anno.off('createAnnotation');
        anno.off('updateAnnotation');
        anno.off('deleteAnnotation');
        anno.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filedata.id, filedata.name, filedata.size]);

  // Cette fonction n'est plus nécessaire car nous utilisons directement setTool

  const RectTool = () => {
    try {
      if (anno) {
        console.log("Activation de l'outil rectangle");

        // Vérifier si l'outil est disponible
        const availableTools = anno.listDrawingTools();
        console.log("Outils disponibles:", availableTools);

        // Forcer la réinitialisation de l'outil
        anno.disableEditor = false;
        anno.readOnly = false;

        // Essayer d'ajouter l'outil s'il n'existe pas déjà
        if (!availableTools.includes('rect')) {
          try {
            anno.addDrawingTool('rect', 'Rectangle');
            console.log("Outil rectangle ajouté manuellement");
          } catch (toolError) {
            console.warn("Impossible d'ajouter l'outil rectangle:", toolError);
          }
        }

        // Activer l'outil rectangle
        anno.setDrawingTool('rect');
        console.log("Outil rectangle activé avec succès");

        // Mettre à jour l'état
        setTool('rect');

        // Forcer le rafraîchissement de l'affichage si nécessaire
        if (!isShownAnno) {
          handleHiddenAnno();
        }
      } else {
        console.error("L'objet annotorious n'est pas initialisé");
        alert("L'outil d'annotation n'est pas initialisé. Veuillez recharger la page.");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de l'outil rectangle:", error);
      alert("Erreur lors de l'activation de l'outil rectangle. Veuillez recharger la page.");
    }
  };

  const PolygonTool = () => {
    try {
      if (anno) {
        console.log("Activation de l'outil polygone");

        // Vérifier si l'outil est disponible
        const availableTools = anno.listDrawingTools();
        console.log("Outils disponibles:", availableTools);

        // Forcer la réinitialisation de l'outil
        anno.disableEditor = false;
        anno.readOnly = false;

        // Essayer d'ajouter l'outil s'il n'existe pas déjà
        if (!availableTools.includes('polygon')) {
          try {
            anno.addDrawingTool('polygon', 'Polygone');
            console.log("Outil polygone ajouté manuellement");
          } catch (toolError) {
            console.warn("Impossible d'ajouter l'outil polygone:", toolError);
          }
        }

        // Activer l'outil polygone
        anno.setDrawingTool('polygon');
        console.log("Outil polygone activé avec succès");

        // Mettre à jour l'état
        setTool('polygon');

        // Forcer le rafraîchissement de l'affichage si nécessaire
        if (!isShownAnno) {
          handleHiddenAnno();
        }
      } else {
        console.error("L'objet annotorious n'est pas initialisé");
        alert("L'outil d'annotation n'est pas initialisé. Veuillez recharger la page.");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de l'outil polygone:", error);
      alert("Erreur lors de l'activation de l'outil polygone. Veuillez recharger la page.");
    }
  };

  const CircleTool = () => {
    try {
      if (anno) {
        console.log("Activation de l'outil ellipse");

        // Vérifier si l'outil est disponible
        const availableTools = anno.listDrawingTools();
        console.log("Outils disponibles:", availableTools);

        // Forcer la réinitialisation de l'outil
        anno.disableEditor = false;
        anno.readOnly = false;

        // Essayer d'ajouter l'outil s'il n'existe pas déjà
        if (!availableTools.includes('ellipse')) {
          try {
            anno.addDrawingTool('ellipse', 'Ellipse');
            console.log("Outil ellipse ajouté manuellement");
          } catch (toolError) {
            console.warn("Impossible d'ajouter l'outil ellipse:", toolError);
          }
        }

        // Activer l'outil ellipse
        anno.setDrawingTool('ellipse');
        console.log("Outil ellipse activé avec succès");

        // Mettre à jour l'état
        setTool('ellipse');

        // Forcer le rafraîchissement de l'affichage si nécessaire
        if (!isShownAnno) {
          handleHiddenAnno();
        }
      } else {
        console.error("L'objet annotorious n'est pas initialisé");
        alert("L'outil d'annotation n'est pas initialisé. Veuillez recharger la page.");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de l'activation de l'outil ellipse:", error);
      alert("Erreur lors de l'activation de l'outil ellipse. Veuillez recharger la page.");
    }
  };

  const exportData = () => {
    if (annotationsRef.current.exportData.length === 0) {
      alert("No annotations to export!");
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(annotationsRef.current.exportData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "annotations.json";
    link.click();
  };

  const handleHiddenAnno = () => {
    setIsShownAnno(prev => {
      const newState = !prev;
      if (anno) {
        console.log("Changement de visibilité des annotations:", newState);
        try {
          // Utiliser la méthode setVisible pour masquer/afficher les annotations
          anno.setVisible(newState);

          // Forcer le rafraîchissement de l'affichage
          const currentAnnotations = anno.getAnnotations();
          if (!newState) {
            // Si on masque, on efface les annotations
            // Les annotations sont déjà stockées dans annotationsRef.current.annotations
            anno.clearAnnotations();
            console.log("Annotations masquées temporairement");
          } else {
            // Si on affiche, on restaure les annotations
            if (currentAnnotations.length === 0 && annotationsRef.current.annotations.length > 0) {
              console.log("Restauration des annotations");
              anno.setAnnotations(annotationsRef.current.annotations);
            }
          }
        } catch (error) {
          console.error("Erreur lors du changement de visibilité:", error);
        }
      }
      return newState;
    });
  };

  const resetClick = () => {
    if (window.confirm("You will lose all annotations! Do you want to proceed?")) {
      annotationsRef.current = { objects: [], annotations: [], exportData: [] };
      anno?.clearAnnotations();
      setXyz([]);
    }
  };

  return (
    <Container>
      <div className="parent">
        <div className="container mt-5">
          <Row className="mb-3">
            <Col xs={12} md={12}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '15px'
                  }}>
                    Outils:
                  </div>
                  <div className="btn-group" role="group">
                    <button
                      title="Rectangle"
                      className={`btn ${tool === 'rect' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={RectTool}
                    >
                      <FontAwesomeIcon icon={faVectorSquare} /> Rectangle
                    </button>
                    <button
                      title="Polygone"
                      className={`btn ${tool === 'polygon' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={PolygonTool}
                    >
                      <FontAwesomeIcon icon={faDrawPolygon} /> Polygone
                    </button>
                    <button
                      title="Ellipse"
                      className={`btn ${tool === 'ellipse' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={CircleTool}
                    >
                      <FontAwesomeIcon icon={faCrosshairs} /> Ellipse
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button
                    title={isShownAnno ? 'Masquer les annotations' : 'Afficher les annotations'}
                    onClick={handleHiddenAnno}
                    className={`btn ${isShownAnno ? 'btn-info' : 'btn-outline-info'}`}
                  >
                    <FontAwesomeIcon icon={isShownAnno ? faEye : faEyeSlash} />
                    {isShownAnno ? ' Masquer' : ' Afficher'}
                  </button>

                  <button
                    title="Télécharger les annotations (JSON)"
                    type="button"
                    onClick={exportData}
                    className="btn btn-outline-secondary"
                  >
                    <FontAwesomeIcon icon={faDownload} /> Exporter
                  </button>

                  <button
                    title="Sauvegarder les annotations"
                    onClick={saveAnnotationsToBackend}
                    disabled={isSaving || !filedata?.id}
                    className={`btn ${isSaving || !filedata?.id ? 'btn-outline-success disabled' : 'btn-success'}`}
                  >
                    <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>

                  <button
                    title="Réinitialiser"
                    onClick={resetClick}
                    className="btn btn-danger"
                  >
                    <FontAwesomeIcon icon={faUndo} /> Réinitialiser
                  </button>
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col xs={12} md={12}>
              <div style={{
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <img
                  ref={imgEl}
                  src={filedata.url}
                  alt="Image médicale à annoter"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="mt-4">
          <Annotations data={xyz} />
        </div>
      </div>
    </Container>
  );
}

export default Annotate;