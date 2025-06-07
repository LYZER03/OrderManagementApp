import React, { useEffect } from 'react';
import { Box, Typography, useTheme, Paper, CssBaseline, GlobalStyles } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/medium_fit_GFC_LOGO.jpg';

const LoginPage = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Rediriger vers le tableau de bord si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <CssBaseline />
      <GlobalStyles 
        styles={{
          'html, body, #root': {
            width: '100%',
            margin: 0,
            padding: 0,
            overflow: 'auto', // Permettre le défilement
          },
          '#root': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
          }
        }}
      />
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', sm: 'center' }, // Alignement en haut sur mobile
          backgroundColor: theme.palette.grey[100],
          position: 'relative',
          overflow: 'auto', // Permettre le défilement
          boxSizing: 'border-box',
          padding: { xs: 1, sm: 3, md: 4 }, // Réduire le padding sur mobile
          paddingTop: { xs: 2, sm: 3, md: 4 }, // Padding top spécifique
          paddingBottom: { xs: 8, sm: 3, md: 4 }, // Plus d'espace en bas sur mobile
          margin: 0
        }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: { xs: '100%', sm: '500px' }, // Pleine largeur sur mobile
          width: '100%',
          p: { xs: 1.5, sm: 3, md: 4 }, // Réduire le padding sur mobile
          borderRadius: { xs: 2, sm: 3 }, // Réduire le border radius sur mobile
          backgroundColor: 'white',
          mb: { xs: 2, sm: 4 }, // Réduire la marge bottom sur mobile
          mx: { xs: 0.5, sm: 0 } // Petite marge horizontale sur mobile
        }}
      >
        <Box
          component="img"
          src={logoImage}
          alt="GFC ProVap Logistic"
          sx={{
            maxWidth: '100%',
            height: 'auto',
            mb: 3,
            display: 'block',
            margin: '0 auto'
          }}
        />
        
        <Box sx={{ width: '100%' }}>
          <LoginForm />
        </Box>
      </Paper>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center" 
        sx={{ 
          mt: { xs: 4, sm: 2 },
          position: { xs: 'relative', sm: 'absolute' }, // Position relative sur mobile
          bottom: { xs: 'auto', sm: '1rem' },
          width: '100%',
          textAlign: 'center',
          px: 2 // Padding horizontal pour éviter les débordements
        }}
      >
        2025 Application de Gestion de Commandes | Tous droits réservés
      </Typography>
      </Box>
    </>
  );
};

export default LoginPage;
