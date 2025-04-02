import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';

const AddOrderForm = ({ open, onClose, onOrderAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reference: '',
    cart_number: '',
    line_count: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        line_count: parseInt(formData.line_count),
        creator: user.id
      };

      // Appel API pour créer la commande
      await orderService.createOrder(orderData);
      
      setSuccess(true);
      // Réinitialiser le formulaire
      setFormData({
        reference: '',
        cart_number: '',
        line_count: ''
      });
      
      // Informer le parent qu'une commande a été ajoutée
      if (onOrderAdded) {
        onOrderAdded();
      }
      
      // Fermer le dialogue après un court délai
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de la création de la commande', err);
      setError(err.message || 'Une erreur est survenue lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter une nouvelle commande</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Remplissez les informations ci-dessous pour créer une nouvelle commande à préparer.
        </DialogContentText>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Commande créée avec succès !
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
            autoFocus
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
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Création en cours...' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrderForm;