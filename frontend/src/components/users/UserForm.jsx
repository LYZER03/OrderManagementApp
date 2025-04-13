import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  FormHelperText,
  Box,
  Divider,
  Typography
} from '@mui/material';

const UserForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  user = null, 
  loading = false, 
  error = null 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'AGENT',
    password: '',
    password_confirm: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const isEditMode = Boolean(user);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role || 'AGENT',
        password: '',
        password_confirm: ''
      });
    } else {
      // Reset form for new user
      setFormData({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'AGENT',
        password: '',
        password_confirm: ''
      });
    }
    setFormErrors({});
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Format d'email invalide";
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      
      if (formData.password !== formData.password_confirm) {
        errors.password_confirm = "Les mots de passe ne correspondent pas";
      }
    } else if (formData.password && formData.password.length > 0) {
      // En mode édition, vérifier le mot de passe seulement s'il est fourni
      if (formData.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }
      
      if (formData.password !== formData.password_confirm) {
        errors.password_confirm = "Les mots de passe ne correspondent pas";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Créer un objet avec les données à envoyer
    const dataToSubmit = {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      role: formData.role
    };
    
    // Ajouter le mot de passe seulement s'il est fourni
    if (formData.password) {
      dataToSubmit.password = formData.password;
    }
    
    // Ajouter l'ID si on est en mode édition
    if (isEditMode && user?.id) {
      dataToSubmit.id = user.id;
    }
    
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditMode ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nom d'utilisateur"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                error={Boolean(formErrors.username)}
                helperText={formErrors.username}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="first_name"
                label="Prénom"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={Boolean(formErrors.first_name)}
                helperText={formErrors.first_name}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                id="last_name"
                label="Nom"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={Boolean(formErrors.last_name)}
                helperText={formErrors.last_name}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Rôle</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Rôle"
                  disabled={loading}
                >
                  <MenuItem value="AGENT">Agent</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {isEditMode 
              ? 'Laissez les champs vides pour conserver le mot de passe actuel' 
              : 'Définir le mot de passe'
            }
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Mot de passe"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password}
                disabled={loading}
                required={!isEditMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="normal"
                fullWidth
                name="password_confirm"
                label="Confirmer le mot de passe"
                type="password"
                id="password_confirm"
                autoComplete="new-password"
                value={formData.password_confirm}
                onChange={handleChange}
                error={Boolean(formErrors.password_confirm)}
                helperText={formErrors.password_confirm}
                disabled={loading}
                required={!isEditMode}
              />
            </Grid>
          </Grid>
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
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
