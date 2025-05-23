import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Composant pour les routes qui nécessitent une authentification
const ProtectedRoute = ({ requireManager = false, requireSuperAgent = false }) => {
  const { isAuthenticated, isManager, isSuperAgent, loading, user } = useAuth();
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Vérifier si l'utilisateur est authentifié
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si la route nécessite un rôle spécifique
  if (requireManager && !isManager()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Vérifier pour les routes accessibles aux Super Agents et Managers
  if (requireSuperAgent && !(isSuperAgent() || isManager())) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Si toutes les vérifications sont passées, afficher le contenu de la route
  return <Outlet />;
};

export default ProtectedRoute;
