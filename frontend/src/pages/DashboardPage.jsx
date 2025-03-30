import React from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Tableau de bord
          </Typography>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Bienvenue, {user?.first_name} {user?.last_name}!
        </Typography>
        
        <Typography variant="body1" paragraph>
          Rôle: {user?.role === 'MANAGER' ? 'Manager' : 'Agent'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          Cette page sera remplacée par le tableau de bord complet avec les modules appropriés selon votre rôle.
        </Typography>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
