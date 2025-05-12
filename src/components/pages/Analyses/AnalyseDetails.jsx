import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const AnalyseDetails = () => {
  const { analyseId } = useParams();
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDialog, setShowDialog] = useState(false);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [caption, setCaption] = useState('');
  const [generating, setGenerating] = useState(false);

  const apiBaseUrl = 'https://localhost:7162/api';

  useEffect(() => {
    const fetchAnalyse = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/analyse/${analyseId}`);
        setAnalyse(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des détails de l’analyse.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyse();
  }, [analyseId]);

  const handleGenerateReport = async () => {
    if (!image1) return alert('Veuillez sélectionner au moins une image.');

    const formData = new FormData();
    formData.append('image1', image1);
    if (image2) formData.append('image2', image2);

    try {
      setGenerating(true);
      const response = await axios.post('http://127.0.0.1:5002/', formData);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      const result = doc.querySelector('#caption')?.textContent || 'Aucun rapport généré.';

      setCaption(result);

      // 🔄 Mettre à jour le champ Rapport dans l’analyse
      await axios.put(`${apiBaseUrl}/analyse/${analyseId}/rapport`, result, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Actualiser les données de l’analyse
      const updatedAnalyse = { ...analyse, rapport: result };
      setAnalyse(updatedAnalyse);
    } catch (err) {
      console.error(err);
      setCaption("Erreur lors de la génération du rapport.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Détails de l’analyse</h2>
      <p><strong>ID :</strong> {analyse.id}</p>
      <p><strong>Date d’analyse :</strong> {new Date(analyse.dateAnalyse).toLocaleDateString()}</p>
      <p><strong>Rapport :</strong> {analyse.rapport || 'Aucun rapport enregistré.'}</p>
      <p><strong>ID Dossier Médical :</strong> {analyse.dossierMedicalId}</p>

      <button onClick={() => setShowDialog(true)}>📝 Générer Rapport</button>

      {showDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 400 }}>
            <h3>Générer un rapport à partir d'images</h3>

            <div>
              <label>Image 1 (obligatoire) :</label>
              <input type="file" accept="image/*" onChange={e => setImage1(e.target.files[0])} />
            </div>
            <div>
              <label>Image 2 (optionnelle) :</label>
              <input type="file" accept="image/*" onChange={e => setImage2(e.target.files[0])} />
            </div>

            <button onClick={handleGenerateReport} disabled={generating}>
              {generating ? "Génération..." : "Générer"}
            </button>
            <button onClick={() => setShowDialog(false)} style={{ marginLeft: 10 }}>Fermer</button>

            {caption && (
              <div style={{ marginTop: 20 }}>
                <strong>📝 Rapport :</strong>
                <p>{caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyseDetails;
