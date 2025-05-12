import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Annotate from "./Annotate";
import axios from "axios";
import { useParams } from "react-router-dom"; // Pour récupérer l'ID depuis l'URL

const UploadAndDisplayImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const { analyseId } = useParams(); // Récupère l'ID depuis l'URL (/analyses/:analyseId/add-image)
  const [imageId, setImageId] = useState(null); // Nouvel état pour stocker l'ID
  const Trash = <FontAwesomeIcon icon={faTrashAlt} />;
  const FileImage = <FontAwesomeIcon icon={faFileImage} />;

  const refreshPage = () => {
    if (window.confirm("You will lose all annotations along with the image! Do you want to proceed?")) {
      setSelectedImage(null);
      setImageUrl(null);
      window.location.reload(true);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file);

    try {
      // Étape 1: Upload de l'image
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post('https://localhost:7162/api/ImageMedicale/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedImageUrl = uploadResponse.data.url;
      setImageUrl(uploadedImageUrl);

      // Étape 2: Création de l'objet ImageMedicale avec l'analyseId
      const imageMedicale = {
        url: uploadedImageUrl,
        analyseId: parseInt(analyseId), // Conversion en number si nécessaire
        annotationGraphics: JSON.stringify([])
      };

      const creationResponse = await axios.post('https://localhost:7162/api/ImageMedicale', imageMedicale);
      
      // Sauvegarder l'ID de l'image créée
      setImageId(creationResponse.data.idIm); // Supposons que le backend retourne l'ID
      
    } catch (error) {
      console.error("Error:", error);
      setSelectedImage(null);
      setImageUrl(null);
      setImageId(null);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Upload and Display Image for Analysis {analyseId}</h1>

      {imageUrl ? (
        <div className="image-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
          {/* Passez à la fois l'URL et l'ID */}
          <Annotate filedata={{ url: imageUrl, id: imageId }} />
          <button id="toggle-btn" onClick={refreshPage}>
            <i style={{ padding: '5px' }}>{Trash}</i> Remove
          </button>
        </div>
      ) : (
        <div>
          <label id="button-icon"><i style={{ padding: '5px' }}>{FileImage}</i></label>
          <input
            style={{
              border: 'none',
              padding: '16px 32px',
              textDecoration: 'none',
              margin: '4px 2px',
              cursor: 'pointer'
            }}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
      )}
    </div>
  );
};

export default UploadAndDisplayImage;