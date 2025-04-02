import React, { useState } from 'react';
import { Container, Paper, Typography, Box, Divider } from '@mui/material';
import OrderSearchBar from '../components/common/OrderSearchBar';

const ControlPage = () => {
  const [searchReference, setSearchReference] = useState('');

  const handleSearch = (reference) => {
    setSearchReference(reference);
    // Logique de recherche à implémenter
    console.log('Recherche de la commande avec référence:', reference);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, ml: 6 }}>
        <Typography variant="h4" gutterBottom>
          Contrôle des commandes
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page permet de contrôler les commandes qui ont été préparées.
        </Typography>
        
        <OrderSearchBar onSearch={handleSearch} />
        
        <Divider sx={{ my: 2 }} />
        
        {searchReference && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Résultats pour: {searchReference}
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="textSecondary">
          Fonctionnalités à venir :
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li" variant="body2">
            Liste des commandes à contrôler
          </Typography>
          <Typography component="li" variant="body2">
            Vérification du nombre de lignes par commande
          </Typography>
          <Typography component="li" variant="body2">
            Validation du contrôle
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ControlPage;
