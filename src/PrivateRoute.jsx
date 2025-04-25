import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("user"); // Vérifie si un utilisateur est connecté
  console.log(localStorage.getItem("user"))
  if (!isAuthenticated) {
    // Rediriger vers la page de login si l'utilisateur n'est pas authentifié
    return <Navigate to="/login" />;
  }

  return children; // Si authentifié, afficher les enfants (la route protégée)
};

export default PrivateRoute;
