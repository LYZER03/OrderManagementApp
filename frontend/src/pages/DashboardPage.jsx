import React, { useState, useEffect } from 'react';
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
  useTheme,
  Stack,
  Chip,
  IconButton,
  alpha,
  Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import TableViewIcon from '@mui/icons-material/TableView';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedToday: 0,
    activeUsers: 0
  });

  // Simulate loading quick stats
  useEffect(() => {
    const loadQuickStats = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setQuickStats({
        totalOrders: 156,
        pendingOrders: 23,
        completedToday: 12,
        activeUsers: 8
      });
      setLoading(false);
    };
    
    loadQuickStats();
  }, []);

  const handleModuleClick = (module) => {
    toast.success(`Navigating to ${module.title}`);
    navigate(module.path);
  };

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

  const isManager = user?.role === 'MANAGER';
  const isAgent = user?.role === 'AGENT';

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: { xs: 1, sm: 2 }, 
        mb: 4, 
        px: { xs: 2, sm: 3 },
        width: '100%' 
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
          spacing={{ xs: 2, sm: 0 }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography 
              variant={{ xs: 'h5', sm: 'h4' }} 
              fontWeight={700} 
              gutterBottom
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
            >
              Welcome back, {user?.first_name}! 👋
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
            >
              <NotificationsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
            >
              <RefreshIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Quick Stats - Hidden for AGENT role */}
      {!isAgent && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {[
            { label: 'Total Orders', value: quickStats.totalOrders, icon: <InventoryIcon />, color: theme.palette.primary.main },
            { label: 'Pending Orders', value: quickStats.pendingOrders, icon: <CheckCircleIcon />, color: theme.palette.warning.main },
            { label: 'Completed Today', value: quickStats.completedToday, icon: <TrendingUpIcon />, color: theme.palette.success.main },
            { label: 'Active Users', value: quickStats.activeUsers, icon: <PeopleIcon />, color: theme.palette.info.main }
          ].map((stat, index) => (
            <Grid size={{ xs: 6, sm: 6, md: 3 }} key={stat.label}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  sx={{
                    p: { xs: 2, sm: 3 },
                    height: '100%',
                    minHeight: { xs: 120, sm: 140 },
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    alignItems={{ xs: 'center', sm: 'center' }} 
                    spacing={{ xs: 1.5, sm: 2 }}
                    sx={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: 2,
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        flexShrink: 0
                      }}
                    >
                      {React.cloneElement(stat.icon, {
                        sx: { fontSize: { xs: 20, sm: 24 } }
                      })}
                    </Box>
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
                      <Typography 
                        variant={{ xs: 'h5', sm: 'h4' }} 
                        fontWeight={700}
                        sx={{ 
                          fontSize: { xs: '1.25rem', sm: '1.75rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {loading ? <Skeleton width={40} /> : stat.value}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mt: 0.5,
                          wordBreak: 'break-word'
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions - Hidden for AGENT role */}
      {!isAgent && (
        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: { xs: 3, sm: 4 }, 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.divider}` 
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight={600} 
            gutterBottom
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Quick Actions
          </Typography>
          <Stack 
            direction="row" 
            spacing={{ xs: 1, sm: 2 }} 
            flexWrap="wrap" 
            useFlexGap
            sx={{ gap: { xs: 1, sm: 2 } }}
          >
            <Chip
              label="Create Order"
              icon={<InventoryIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={() => navigate('/preparation')}
              sx={{ 
                cursor: 'pointer',
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
            />
            <Chip
              label="View Statistics"
              icon={<BarChartIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={() => navigate('/statistics')}
              sx={{ 
                cursor: 'pointer',
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
              disabled={!isManager}
            />
            <Chip
              label="Manage Users"
              icon={<PeopleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />}
              onClick={() => navigate('/users')}
              sx={{ 
                cursor: 'pointer',
                height: { xs: 32, sm: 36 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                }
              }}
              disabled={!isManager}
            />
          </Stack>
        </Paper>
      )}

      {/* Modules Grid */}
      <Typography 
        variant="h6" 
        fontWeight={600} 
        gutterBottom 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}
      >
        Workflow Modules
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {filteredModules.map((module, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                sx={{
                  height: '100%',
                  minHeight: { xs: 200, sm: 240 },
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    borderColor: module.color,
                    '& .module-icon': {
                      transform: 'scale(1.1)'
                    }
                  }
                }}
                onClick={() => handleModuleClick(module)}
              >
                <CardContent 
                  sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    textAlign: 'center',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Box
                    className="module-icon"
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      borderRadius: 2,
                      bgcolor: alpha(module.color, 0.1),
                      margin: { xs: '0 auto 12px auto', sm: '0 auto 16px auto' },
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  >
                    {React.cloneElement(module.icon, {
                      sx: { 
                        color: module.color, 
                        fontSize: { xs: 28, sm: 32 }
                      }
                    })}
                  </Box>
                  <Typography
                    variant={{ xs: 'subtitle1', sm: 'h6' }}
                    fontWeight={600}
                    gutterBottom
                    sx={{ 
                      color: 'text.primary',
                      fontSize: { xs: '1rem', sm: '1.125rem' },
                      mb: { xs: 1, sm: 1.5 }
                    }}
                  >
                    {module.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      lineHeight: 1.5,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: { xs: 2, sm: 3 },
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {module.description}
                  </Typography>
                </CardContent>
                <CardActions 
                  sx={{ 
                    p: { xs: 2, sm: 3 }, 
                    pt: 0, 
                    justifyContent: 'center',
                    mt: 'auto'
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: module.color,
                      color: module.color,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      px: { xs: 2, sm: 3 },
                      py: { xs: 0.5, sm: 1 },
                      '&:hover': {
                        borderColor: module.color,
                        bgcolor: alpha(module.color, 0.1)
                      }
                    }}
                  >
                    Access Module
                  </Button>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DashboardPage;
