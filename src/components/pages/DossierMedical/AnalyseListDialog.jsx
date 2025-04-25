// src/components/analyse/AnalyseListDialog.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const AnalyseListDialog = ({ open, onClose, dossierId }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && dossierId) {
      fetchAnalyses();
    }
  }, [open, dossierId]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://localhost:7162/api/Analyse/dossier/${dossierId}` // Remplacez par l'URL correcte de votre API
      );
      setAnalyses(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des analyses:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Liste des Analyses</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date d'Analyse</TableCell>
                <TableCell>Résultat</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>Aucune analyse trouvée.</TableCell>
                </TableRow>
              ) : (
                analyses.map((analyse) => (
                  <TableRow key={analyse.id}>
                    <TableCell>{analyse.id}</TableCell>
                    <TableCell>
                      {new Date(analyse.dateAnalyse).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{analyse.resultat}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyseListDialog;
