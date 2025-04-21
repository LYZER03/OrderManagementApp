import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Composants de statistiques
import StatCard from '../components/statistics/StatCard';
import BarChartCard from '../components/statistics/BarChartCard';
import ComboChartCard from '../components/statistics/ComboChartCard';
import LineChartCard from '../components/statistics/LineChartCard';
import PieChartCard from '../components/statistics/PieChartCard';
import AgentPerformanceTable from '../components/statistics/AgentPerformanceTable';
import RecentOrdersTable from '../components/statistics/RecentOrdersTable';

// Service de statistiques
import statsService from '../services/statsService';

// Icônes
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';

const StatisticsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  
  // États pour les données statistiques
  const [generalStats, setGeneralStats] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [processingTimeByStep, setProcessingTimeByStep] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshCounter, setRefreshCounter] = useState(0); // Compteur pour forcer le rafraîchissement des composants
  
  // État pour le filtre de période
  const [periodFilter, setPeriodFilter] = useState('today'); // 'today', 'week', 'month'

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // Fonction pour charger les données statistiques
  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
      
    try {
      console.log('Chargement des statistiques...');
      
      // Utiliser la période sélectionnée comme paramètre de date
      const dateParam = periodFilter;
      
      // Charger d'abord les statistiques générales pour vérifier la connexion
      const generalStatsData = await statsService.getGeneralStats(dateParam);
      console.log('Statistiques générales chargées:', generalStatsData);
      
      // Puis charger le reste des données
      const [
        ordersByStatusData,
        processingTimeByStepData,
        agentPerformanceData,
        dailySalesData,
        completedTasksData,
        recentOrdersData
      ] = await Promise.all([
        statsService.getOrdersByStatus(dateParam),
        statsService.getProcessingTimeByStep(),
        statsService.getAgentPerformance(dateParam),
        statsService.getDailySales(dateParam),
        statsService.getCompletedTasks(dateParam),
        statsService.getRecentOrders(dateParam)
      ]);
      
      // Mettre à jour les états avec les données récupérées
      setGeneralStats(generalStatsData);
      setOrdersByStatus(ordersByStatusData);
      setProcessingTimeByStep(processingTimeByStepData);
      setAgentPerformance(agentPerformanceData);
      setDailySales(dailySalesData);
      setCompletedTasks(completedTasksData);
      setRecentOrders(recentOrdersData);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques', err);
      if (err.response) {
        console.error('Réponse d\'erreur:', err.response.data);
        console.error('Status:', err.response.status);
        
        if (err.response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError(`Erreur ${err.response.status}: ${err.response.data.error || 'Impossible de charger les statistiques'}`);
        }
      } else if (err.request) {
        console.error('Pas de réponse reçue:', err.request);
        setError('Aucune réponse du serveur. Vérifiez votre connexion.');
      } else {
        console.error('Erreur:', err.message);
        setError('Impossible de charger les statistiques. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefreshed(new Date());
    }
  };
  
  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshCounter(prev => prev + 1); // Incrémenter le compteur pour forcer les composants à se rafraîchir
    fetchStats(true);
  };
  
  // Fonction pour changer la période
  const handlePeriodChange = (period) => {
    setPeriodFilter(period);
    setRefreshCounter(prev => prev + 1); // Incrémenter le compteur pour forcer les composants à se rafraîchir
    fetchStats(true);
  };
  
  // Charger les données au premier rendu et lorsque la période change
  useEffect(() => {
    console.log('Chargement initial des statistiques...');
    fetchStats();
    
    // Mettre en place un intervalle de rafraîchissement automatique toutes les 60 secondes
    const autoRefreshInterval = setInterval(() => {
      console.log('Rafraîchissement automatique des statistiques...');
      fetchStats(true);
    }, 60000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(autoRefreshInterval);
  }, []);
  
  // Charger les données au montage du composant
  useEffect(() => {
    fetchStats();
  }, []);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        width: '100%'
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ mb: { xs: 2, sm: 0 } }}>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                mb: 0.5,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              Performance des Employés
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '1rem' },
                maxWidth: { sm: '80%' }
              }}
            >
              Analyse des performances et productivité des agents
            </Typography>
          </Box>

          {/* Filtres et rafraîchissement alignés au centre sur mobile, à droite sur desktop */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            alignSelf: { xs: 'stretch', sm: 'auto' },
            gap: { xs: 2, sm: 1 }
          }}>
            {/* Filtres de période */}
            <Box sx={{ 
              display: 'flex', 
              borderRadius: 2, 
              bgcolor: 'background.paper', 
              boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden', 
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                size={isMobile ? "small" : "medium"}
                variant={periodFilter === 'today' ? 'contained' : 'text'}
                color={periodFilter === 'today' ? 'primary' : 'inherit'}
                onClick={() => handlePeriodChange('today')}
                sx={{ 
                  flexGrow: { xs: 1, sm: 0 },
                  px: { xs: 1, sm: 2 }, 
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 0
                }}
              >
                Aujourd'hui
              </Button>
              <Button
                size={isMobile ? "small" : "medium"}
                variant={periodFilter === 'week' ? 'contained' : 'text'}
                color={periodFilter === 'week' ? 'primary' : 'inherit'}
                onClick={() => handlePeriodChange('week')}
                sx={{ 
                  flexGrow: { xs: 1, sm: 0 },
                  px: { xs: 1, sm: 2 }, 
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 0,
                  borderLeft: '1px solid rgba(0,0,0,0.05)',
                  borderRight: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                7 jours
              </Button>
              <Button
                size={isMobile ? "small" : "medium"}
                variant={periodFilter === 'month' ? 'contained' : 'text'}
                color={periodFilter === 'month' ? 'primary' : 'inherit'}
                onClick={() => handlePeriodChange('month')}
                sx={{ 
                  flexGrow: { xs: 1, sm: 0 },
                  px: { xs: 1, sm: 2 }, 
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 0
                }}
              >
                1 mois
              </Button>
            </Box>
            
            {/* Bouton de rafraîchissement */}
            <Tooltip title="Rafraîchir les données">
              <IconButton 
                onClick={handleRefresh}
                disabled={loading || refreshing}
                color="primary"
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.08)', 
                  bgcolor: 'background.paper',
                  alignSelf: { xs: 'flex-end', sm: 'center' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 1 
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontStyle: 'italic',
              fontSize: '0.75rem'
            }}
          >
            Dernière mise à jour : {lastRefreshed.toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>
      
      {/* KPI statistiques */}
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        borderRadius: 3,
        py: { xs: 3, sm: 4 }, 
        px: { xs: 2, sm: 3 },
        mb: { xs: 4, sm: 6 }, 
        mt: { xs: 2, sm: 3 },
        overflow: 'hidden'
      }}>
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
            gap: { xs: '16px', sm: '24px' },
            flexWrap: { xs: 'nowrap', sm: 'wrap' }
          }}
        >
          {/* Nouvelles commandes */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 12px)', 
              md: 'calc(25% - 18px)' 
            },
            minWidth: 0 
          }}>
            <StatCard 
              icon={<ShoppingCartIcon />} 
              title="Nouvelles commandes" 
              value={ordersByStatus.find(item => item.name === 'Créées')?.value || 0}
              changePercentage={null}
              color="primary"
            />
          </Box>

          {/* En préparation */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 12px)', 
              md: 'calc(25% - 18px)' 
            },
            minWidth: 0 
          }}>
            <StatCard 
              icon={<InventoryIcon />} 
              title="Préparées" 
              value={ordersByStatus.find(item => item.name === 'Préparées')?.value || 0}
              changePercentage={null}
              color="warning"
            />
          </Box>
          
          {/* Contrôlées */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 12px)', 
              md: 'calc(25% - 18px)' 
            },
            minWidth: 0 
          }}>
            <StatCard 
              icon={<PeopleIcon />} 
              title="Contrôlées" 
              value={ordersByStatus.find(item => item.name === 'Contrôlées')?.value || 0}
              changePercentage={null}
              color="secondary"
            />
          </Box>

          {/* Emballées */}
          <Box sx={{ 
            width: { 
              xs: '100%', 
              sm: 'calc(50% - 12px)', 
              md: 'calc(25% - 18px)' 
            },
            minWidth: 0 
          }}>
            <StatCard 
              icon={<CheckCircleIcon />} 
              title="Emballées" 
              value={ordersByStatus.find(item => item.name === 'Emballées')?.value || 0}
              changePercentage={null}
              color="success"
            />
          </Box>


        </Box>
      </Box>
      
      {/* Performance des agents */}
      <Box sx={{ 
        mt: 4, 
        mb: 4,
        width: '100%',
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            height: '100%',
            borderRadius: 2,
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Typography 
            variant={ isMobile ? "h6" : "h5" } 
            component="div" 
            fontWeight="medium" 
            gutterBottom
          >
            Performance par Agent
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Suivi détaillé des commandes et lignes traitées par chaque agent
          </Typography>
          <AgentPerformanceTable 
            data={agentPerformance}
            noTitle={true}
            lastUpdated={`Dernière mise à jour: ${lastRefreshed.toLocaleTimeString()}`}
            key={`agent-performance-${refreshCounter}`} // Forcer le remontage du composant à chaque rafraîchissement
          />
        </Paper>
      </Box>
        
      {/* Graphiques secondaires réduits - sur une seule ligne */}
      <Box sx={{ 
        display: 'flex',
        width: '100%',
        gap: '24px',
        mb: 4,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <ComboChartCard 
            title="Évolution des commandes" 
            subtitle="Nombre de commandes par jour" 
            data={dailySales} 
            barDataKey="barres"
            lineDataKey="courbe"
            xAxisDataKey="name"
            barColor="#51158C"
            lineColor={theme.palette.error.main}
            height={isMobile ? 200 : 250}
          />
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
          <PieChartCard 
            title="Distribution des statuts" 
            subtitle="Pourcentage par état de commande" 
            data={ordersByStatus} 
            dataKey="value"
            nameKey="name"
            height={isMobile ? 200 : 250}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default StatisticsPage;
