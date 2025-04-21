import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Grid,
  Paper,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OrderDetailsDialog = ({ open, onClose, order }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!order) return null;

  // Fonction pour calculer la différence de temps en minutes entre deux dates
  const calculateTimeDiff = (endDateStr, startDateStr) => {
    if (!endDateStr || !startDateStr) return null;
    
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      
      // Vérifier que les dates sont valides
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Dates invalides:', { startDateStr, endDateStr });
        return null;
      }
      
      // Calculer la différence en minutes
      const diffMs = Math.abs(endDate - startDate);
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      return diffMinutes;
    } catch (error) {
      console.error('Erreur lors du calcul de temps entre dates:', error, { endDateStr, startDateStr });
      return null;
    }
  };

  // Log des dates pour débogage
  console.log('Dates de la commande:', {
    created_at: order.created_at,
    prepared_at: order.prepared_at,
    controlled_at: order.controlled_at,
    packed_at: order.packed_at,
    completed_at: order.completed_at
  });

  // Calcul des temps en minutes avec la nouvelle fonction
  const preparationTime = calculateTimeDiff(order.prepared_at, order.created_at);
  const controlTime = calculateTimeDiff(order.controlled_at, order.prepared_at);
  const packingTime = calculateTimeDiff(order.packed_at, order.controlled_at);
  const totalTime = calculateTimeDiff(order.completed_at || order.packed_at, order.created_at);

  // Fonction pour obtenir le statut formaté
  const getStatusChip = (status) => {
    let color = 'default';
    let label = 'Inconnu';
    
    switch (status) {
      case 'CREATED':
        color = 'primary';
        label = 'Créée';
        break;
      case 'PREPARED':
        color = 'success';
        label = 'Préparée';
        break;
      case 'CONTROLLED':
        color = 'warning';
        label = 'Contrôlée';
        break;
      case 'PACKED':
        color = 'info';
        label = 'Emballée';
        break;
      case 'COMPLETED':
        color = 'secondary';
        label = 'Terminée';
        break;
      default:
        break;
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        sx={{ fontWeight: 600 }} 
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : undefined,
          margin: isMobile ? '16px' : undefined,
          borderRadius: isMobile ? '12px' : undefined,
        }
      }}
    >
      <DialogTitle sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', py: isMobile ? 1.5 : 2 }}>
        Détails de la commande
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Référence
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {order.reference}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Statut
              </Typography>
              {getStatusChip(order.status)}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Numéro de chariot
              </Typography>
              <Typography variant="body1">
                {order.cart_number}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Nombre de lignes
              </Typography>
              <Typography variant="body1">
                {order.line_count ? order.line_count : 'Non défini'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Informations de création
        </Typography>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Créée par
              </Typography>
              <Typography variant="body1">
                {order.creator_details ? order.creator_details.username : 'Non spécifié'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Créée le
              </Typography>
              <Typography variant="body1">
                {order.created_at ? 
                  format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                  'Date inconnue'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {order.prepared_at && (
          <>
            <Typography variant="h6" gutterBottom>
              Informations de préparation
            </Typography>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Préparée par
                  </Typography>
                  <Typography variant="body1">
                    {order.preparer_details ? order.preparer_details.username : 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Préparée le
                  </Typography>
                  <Typography variant="body1">
                    {order.prepared_at ? 
                      format(new Date(order.prepared_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                      'Date inconnue'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Temps de préparation
                  </Typography>
                  <Typography variant="body1">
                    {preparationTime ? `${preparationTime} minutes` : 'Non disponible'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {order.controlled_at && (
          <>
            <Typography variant="h6" gutterBottom>
              Informations de contrôle
            </Typography>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contrôlée par
                  </Typography>
                  <Typography variant="body1">
                    {order.controller_details ? order.controller_details.username : 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Contrôlée le
                  </Typography>
                  <Typography variant="body1">
                    {order.controlled_at ? 
                      format(new Date(order.controlled_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                      'Date inconnue'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Temps de contrôle
                  </Typography>
                  <Typography variant="body1">
                    {controlTime ? `${controlTime} minutes` : 'Non disponible'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {order.packed_at && (
          <>
            <Typography variant="h6" gutterBottom>
              Informations d'emballage
            </Typography>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Emballée par
                  </Typography>
                  <Typography variant="body1">
                    {order.packer_details ? order.packer_details.username : 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Emballée le
                  </Typography>
                  <Typography variant="body1">
                    {order.packed_at ? 
                      format(new Date(order.packed_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                      'Date inconnue'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Temps d'emballage
                  </Typography>
                  <Typography variant="body1">
                    {packingTime ? `${packingTime} minutes` : 'Non disponible'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        <Typography variant="h6" gutterBottom>
          Temps total de traitement
        </Typography>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Temps total
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {totalTime ? `${totalTime} minutes` : 'Non disponible'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button onClick={onClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
