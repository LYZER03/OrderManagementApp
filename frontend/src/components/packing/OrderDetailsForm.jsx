// OrderDetailsForm.jsx
import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Chip,
  Divider,
  Grid,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OrderDetailsForm = ({ open, onClose, order }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!order) return null;

  // Calcul du temps de contrôle en minutes
  const controlTime = order.controlled_at && order.prepared_at
    ? Math.round((new Date(order.controlled_at) - new Date(order.prepared_at)) / (1000 * 60))
    : null;
    
  // Calcul du temps de préparation en minutes
  const preparationTime = order.prepared_at && order.created_at
    ? Math.abs(Math.round((new Date(order.prepared_at) - new Date(order.created_at)) / (1000 * 60)))
    : null;

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
              <Chip 
                label="Contrôlée" 
                size="small" 
                sx={{ 
                  bgcolor: 'warning.light',
                  color: 'warning.dark',
                  fontWeight: 600
                }} 
              />
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
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsForm;
