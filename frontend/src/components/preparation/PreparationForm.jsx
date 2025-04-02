import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PreparationForm = ({ order, onPrepare, loading, error, success }) => {
  const [lineCount, setLineCount] = useState('');
  const [lineCountError, setLineCountError] = useState('');
  
  // Mettre à jour lineCount lorsque order change
  React.useEffect(() => {
    if (order && order.line_count) {
      setLineCount(order.line_count.toString());
    } else {
      setLineCount('');
    }
  }, [order]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!lineCount) {
      setLineCountError('Le nombre de lignes est requis');
      return;
    }
    
    if (isNaN(lineCount) || parseInt(lineCount) <= 0) {
      setLineCountError('Veuillez entrer un nombre valide supérieur à 0');
      return;
    }
    
    setLineCountError('');
    onPrepare(order.id, { line_count: parseInt(lineCount) });
  };

  if (!order) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="textSecondary" align="center">
          Sélectionnez une commande à préparer
        </Typography>
      </Paper>
    );
  }

  if (success) {
    return (
      <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.dark' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <CheckCircleOutlineIcon fontSize="large" />
            <Typography variant="h6">
              La commande {order.reference} a été préparée avec succès !
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Préparer la commande
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Référence
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {order.reference}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Numéro de chariot
          </Typography>
          <Typography variant="body1">
            {order.cart_number}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Date de création
          </Typography>
          <Typography variant="body1">
            {order.created_at ? 
              format(new Date(order.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 
              'Date inconnue'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Créée par
          </Typography>
          <Typography variant="body1">
            {order.creator?.first_name} {order.creator?.last_name}
          </Typography>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Informations de préparation
        </Typography>
        
        <TextField
          label="Nombre de lignes"
          variant="outlined"
          fullWidth
          type="number"
          value={lineCount}
          onChange={(e) => setLineCount(e.target.value)}
          error={!!lineCountError}
          helperText={lineCountError || "Entrez le nombre d'articles dans la commande"}
          sx={{ mb: 3 }}
          InputProps={{ inputProps: { min: 1 } }}
          required
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Validation en cours...' : 'Valider la préparation'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreparationForm;
