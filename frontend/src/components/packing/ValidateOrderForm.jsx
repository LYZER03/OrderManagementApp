// ValidateOrderForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import orderService from '../../services/orderService';

const ValidateOrderForm = ({ open, onClose, order, onOrderValidated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Appel API pour valider l'emballage
      await orderService.packOrder(order.id);
      
      setSuccess(true);
      
      // Informer le parent qu'une commande a été validée
      if (onOrderValidated) {
        onOrderValidated();
      }
      
      // Fermer le dialogue après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de la validation de l\'emballage', err);
      setError(err.message || 'Une erreur est survenue lors de la validation de l\'emballage');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : onClose} 
      maxWidth="sm" 
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
        Valider l'emballage
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Confirmez la validation de l'emballage de cette commande.
        </DialogContentText>
        
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Référence: <strong>{order.reference}</strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Numéro de chariot: <strong>{order.cart_number}</strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Nombre de lignes: <Chip label={order.line_count || 'Non défini'} color={order.line_count ? 'warning' : 'default'} size="small" />
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Contrôlée le: <strong>
              {order.controlled_at ? 
                format(new Date(order.controlled_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                'Date inconnue'}
            </strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Contrôlée par: <strong>{order.controller_details ? order.controller_details.username : 'Non spécifié'}</strong>
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Emballage validé avec succès !
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="warning" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={isMobile ? 16 : 20} /> : null}
          sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
        >
          {loading ? 'Validation...' : isMobile ? 'Valider' : 'Valider l\'emballage'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidateOrderForm;
