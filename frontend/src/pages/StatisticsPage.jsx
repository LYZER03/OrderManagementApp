import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const StatisticsPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
      <Paper sx={{ p: 3, width: '100%', maxWidth: '100%', bgcolor: '#ffffff', boxShadow: 'none' }}>
        <Typography variant="h4" gutterBottom>
          Statistiques
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page présente les statistiques de performance du système de gestion des commandes.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Fonctionnalités à venir :
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li" variant="body2">
            Nombre de commandes par statut
          </Typography>
          <Typography component="li" variant="body2">
            Temps moyen de traitement par étape
          </Typography>
          <Typography component="li" variant="body2">
            Performance des agents
          </Typography>
          <Typography component="li" variant="body2">
            Graphiques et tableaux de bord
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default StatisticsPage;
