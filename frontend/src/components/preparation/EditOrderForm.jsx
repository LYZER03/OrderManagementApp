import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import orderService from '../../services/orderService';

const EditOrderForm = ({ open, onClose, order, onOrderUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    reference: '',
    cart_number: '',
    line_count: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Effet pour masquer automatiquement le message de succès après 2s
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Initialiser le formulaire avec les données de la commande
  useEffect(() => {
    if (order) {
      setFormData({
        reference: order.reference || '',
        cart_number: order.cart_number || '',
        line_count: order.line_count ? String(order.line_count) : ''
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validation des champs
      if (!formData.reference.trim()) {
        throw new Error('La référence est obligatoire');
      }
      if (!formData.cart_number.trim()) {
        throw new Error('Le numéro de chariot est obligatoire');
      }
      if (!formData.line_count.trim() || isNaN(formData.line_count) || parseInt(formData.line_count) < 1) {
        throw new Error('Le nombre de lignes doit être un nombre positif');
      }

      // Formatage des données
      const orderData = {
        reference: formData.reference.trim(),
        cart_number: formData.cart_number.trim(),
        line_count: parseInt(formData.line_count)
      };

      // Appel API pour mettre à jour la commande
      await orderService.updateOrder(order.id, orderData);
      
      setSuccess(true);
      
      // Informer le parent qu'une commande a été mise à jour
      if (onOrderUpdated) {
        onOrderUpdated();
      }
      
      // Fermer le dialogue immédiatement
      onClose();
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande', err);
      setError(err.message || 'Une erreur est survenue lors de la mise à jour de la commande');
    } finally {
      setLoading(false);
    }
  };

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
        Modifier la commande
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Modifiez les informations ci-dessous pour mettre à jour la commande.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Commande mise à jour avec succès !
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="reference"
            label="Référence de la commande"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="cart_number"
            label="Numéro de chariot"
            name="cart_number"
            value={formData.cart_number}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="line_count"
            label="Nombre de lignes"
            name="line_count"
            type="number"
            inputProps={{ min: 1 }}
            value={formData.line_count}
            onChange={handleChange}
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            fontSize: isMobile ? '1.1rem' : '1.15rem',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            bgcolor: 'grey.100',
            color: 'grey.800',
            fontWeight: 600,
            boxShadow: 1,
            textTransform: 'none',
            mr: 2,
            '&:hover': { bgcolor: 'grey.200' }
          }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={isMobile ? 20 : 24} /> : null}
          sx={{
            fontSize: isMobile ? '1.1rem' : '1.15rem',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 1
          }}
        >
          {loading ? 'Mise à jour...' : isMobile ? 'Mettre à jour' : 'Mettre à jour'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditOrderForm;