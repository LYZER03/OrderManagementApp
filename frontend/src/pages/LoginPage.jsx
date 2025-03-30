import React, { useEffect } from 'react';
import { Box, Typography, Container, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.grey[100],
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Éléments décoratifs de fond */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -100, 
          right: -100, 
          width: 300, 
          height: 300, 
          borderRadius: '50%', 
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          opacity: 0.1,
          zIndex: 0
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: -100, 
          left: -100, 
          width: 400, 
          height: 400, 
          borderRadius: '50%', 
          background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
          opacity: 0.1,
          zIndex: 0
        }} 
      />
      
      <Container 
        maxWidth="md" 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          py: 5,
          zIndex: 1
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4
          }}
        >
          {/* Section de gauche - Présentation */}
          <Box 
            sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 45%' },
              textAlign: { xs: 'center', md: 'left' },
              mb: { xs: 4, md: 0 }
            }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              color="primary" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              GFC ProVap Logistic
            </Typography>
            
            <Typography 
              variant="h5" 
              color="textPrimary" 
              sx={{ 
                mb: 3,
                fontWeight: 500,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Application interne de suivi et gestion
            </Typography>
          </Box>
          
          {/* Section de droite - Formulaire de connexion */}
          <Box 
            sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 55%' },
              position: 'relative',
              zIndex: 2
            }}
          >
            <LoginForm />
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 6 }}
        >
          {new Date().getFullYear()} Application de Gestion de Commandes | Tous droits réservés
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
