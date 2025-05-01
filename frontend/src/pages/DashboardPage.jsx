import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  useTheme
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import TableViewIcon from '@mui/icons-material/TableView';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Définition des modules disponibles
  const modules = [
    {
      title: 'Préparation',
      description: 'Gérer les commandes en attente de préparation',
      icon: <InventoryIcon fontSize="large" />,
      path: '/preparation',
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER'],
      color: theme.palette.primary.main
    },
    {
      title: 'Contrôle',
      description: 'Contrôler les commandes préparées',
      icon: <CheckCircleIcon fontSize="large" />,
      path: '/control',
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER'],
      color: theme.palette.success.main
    },
    {
      title: 'Emballage',
      description: 'Emballer les commandes contrôlées',
      icon: <LocalShippingIcon fontSize="large" />,
      path: '/packing',
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER'],
      color: theme.palette.info.main
    },
    {
      title: 'Statistiques',
      description: 'Consulter les statistiques de performance',
      icon: <BarChartIcon fontSize="large" />,
      path: '/statistics',
      roles: ['MANAGER'],
      color: theme.palette.warning.main
    },
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes utilisateurs',
      icon: <PeopleIcon fontSize="large" />,
      path: '/users',
      roles: ['MANAGER'],
      color: theme.palette.secondary.main
    },
    {
      title: 'Table des commandes',
      description: 'Visualiser et gérer toutes les commandes',
      icon: <TableViewIcon fontSize="large" />,
      path: '/orders-table',
      roles: ['SUPER_AGENT', 'MANAGER'],
      color: theme.palette.error.main
    }
  ];

  // Filtrer les modules en fonction du rôle de l'utilisateur
  const filteredModules = modules.filter(module => 
    module.roles.includes(user?.role)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
      <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%', bgcolor: '#ffffff', boxShadow: 'none' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Bienvenue, {user?.first_name} {user?.last_name}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Sélectionnez un module pour commencer à travailler
          </Typography>
        </Box>

        <Grid 
          container 
          spacing={3} 
          alignItems="stretch"
          justifyContent="center"
          sx={{ minHeight: '60vh' }}
        >
          {filteredModules.map((module, index) => (
            <Grid 
              size={{ xs: 12, sm: 6, md: 4 }}
              key={index}
              sx={{ display: 'flex' }}
            >
              <Card 
                sx={{ 
                  width: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center',
                  py: 4
                }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: `${module.color}15`,
                      color: module.color,
                      mb: 3
                    }}
                  >
                    {module.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {module.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {module.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate(module.path)}
                    sx={{ 
                      px: 4,
                      py: 1,
                      bgcolor: module.color,
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'light' 
                          ? `${module.color}` 
                          : `${module.color}`
                      }
                    }}
                  >
                    Accéder
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
