import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const UsersPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, ml: 6 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des utilisateurs
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page permet de gérer les comptes utilisateurs du système.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Fonctionnalités à venir :
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li" variant="body2">
            Liste des utilisateurs
          </Typography>
          <Typography component="li" variant="body2">
            Création et modification des comptes
          </Typography>
          <Typography component="li" variant="body2">
            Attribution des rôles
          </Typography>
          <Typography component="li" variant="body2">
            Gestion des permissions
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UsersPage;
