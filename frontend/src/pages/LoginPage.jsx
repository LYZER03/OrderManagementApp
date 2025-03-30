import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
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
        backgroundColor: '#f5f5f5'
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          color="primary"
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          Gestion de Commandes Interne
        </Typography>
        
        <LoginForm />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {new Date().getFullYear()} Application de Gestion de Commandes
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;
