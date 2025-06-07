import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Avatar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Stack
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuth } from '../../context/AuthContext';

// Schéma de validation pour le formulaire de connexion
const validationSchema = Yup.object({
  username: Yup.string().required('Le nom d\'utilisateur est requis'),
  password: Yup.string().required('Le mot de passe est requis')
});

const LoginForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialisation du formulaire avec Formik
  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        await login(values.username, values.password);
        navigate('/dashboard'); // Redirection vers le tableau de bord après connexion
      } catch (err) {
        console.error('Login error:', err);
        setError(
          err.response?.data?.error || 
          'Échec de la connexion. Veuillez vérifier vos identifiants.'
        );
      } finally {
        setLoading(false);
      }
    }
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%'
      }}
    >
      <Box 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Avatar 
          sx={{ 
            mb: { xs: 1.5, sm: 2 }, 
            bgcolor: '#FF8C00', // Couleur orange
            width: { xs: 48, sm: 56 }, // Plus petit sur mobile
            height: { xs: 48, sm: 56 } // Plus petit sur mobile
          }}
        >
          <LockOutlinedIcon fontSize="large" sx={{ color: '#FFFFFF' }} />
        </Avatar>
        <Typography 
          component="h1" 
          variant="h4" // Taille standard
          sx={{ 
            fontWeight: 600, 
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1.5rem', sm: '2.125rem' } // Responsive via sx
          }}
        >
          Connexion
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
          sx={{ px: { xs: 1, sm: 0 } }} // Padding horizontal sur mobile
        >
          Entrez vos identifiants pour accéder à l'application
        </Typography>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          id="username"
          name="username"
          label="Nom d'utilisateur"
          variant="outlined"
          margin="normal"
          size="medium" // Taille standard
          autoComplete="username"
          autoFocus
          value={formik.values.username}
          onChange={formik.handleChange}
          error={formik.touched.username && Boolean(formik.errors.username)}
          helperText={formik.touched.username && formik.errors.username}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          margin="normal"
          size="medium" // Taille standard
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large" // Taille standard
          disabled={loading}
          sx={{ 
            mt: { xs: 2, sm: 3 }, // Réduire la marge top sur mobile
            mb: { xs: 1.5, sm: 2 }, // Réduire la marge bottom sur mobile
            py: { xs: 1.2, sm: 1.5 }, // Réduire le padding vertical sur mobile
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: theme.shadows[3],
            bgcolor: '#FF8C00', // Couleur orange
            '&:hover': {
              bgcolor: '#E67E00' // Orange légèrement plus foncé pour l'effet hover
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Se connecter'}
        </Button>
        
        <Divider sx={{ my: { xs: 2, sm: 3 } }}> {/* Réduire les marges sur mobile */}
          <Typography variant="body2" color="text.secondary">
            Informations de connexion
          </Typography>
        </Divider>
        
        <Stack spacing={1} sx={{ mb: { xs: 1, sm: 2 } }}> {/* Réduire la marge bottom sur mobile */}
          <Box sx={{ 
            p: { xs: 1.5, sm: 2 }, // Réduire le padding sur mobile
            bgcolor: theme.palette.grey[50], 
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Comptes de test
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Manager:</strong> username: admin, password: 1234
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Agent:</strong> username: agent1, password: 1234
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginForm;
