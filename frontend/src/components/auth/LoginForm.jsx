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
    <Paper 
      elevation={2} 
      sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        borderRadius: 3,
        maxWidth: 450,
        width: '100%',
        mx: 'auto'
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
            mb: 2, 
            bgcolor: theme.palette.primary.main,
            width: 56,
            height: 56
          }}
        >
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Connexion
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
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
          size="large"
          disabled={loading}
          sx={{ 
            mt: 3, 
            mb: 2, 
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: theme.shadows[3]
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Se connecter'}
        </Button>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Informations de connexion
          </Typography>
        </Divider>
        
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.grey[50], 
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Comptes de test
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Manager:</strong> username: manager, password: password123
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Agent:</strong> username: agent1, password: password123
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default LoginForm;
