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
            overflow: 'hidden',
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
          justifyContent: 'center',
          backgroundColor: theme.palette.grey[100],
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: { xs: 2, sm: 3, md: 4 },
          margin: 0
        }}
    >
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '500px',
          width: '100%',
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          backgroundColor: 'white',
          mb: 4
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
          mt: 2,
          position: 'absolute',
          bottom: '1rem',
          width: '100%',
          textAlign: 'center'
        }}
      >
        2025 Application de Gestion de Commandes | Tous droits réservés
      </Typography>
      </Box>
    </>
  );
};

export default LoginPage;
