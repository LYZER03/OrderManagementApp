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
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
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
import authService from '../services/authService';
import userService from '../services/userService';

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
  
  // États pour les filtres
  const [periodFilter, setPeriodFilter] = useState('today'); // 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [filteredAgentPerformance, setFilteredAgentPerformance] = useState([]);
  
  console.log('Current selected agent:', selectedAgent);

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // Fonction pour charger les données statistiques avec une période spécifique
  const fetchStats = async (period = null, isRefresh = false) => {
    // Utiliser la période fournie ou la période actuelle
    const currentPeriod = period || periodFilter;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      console.log(`Chargement des statistiques pour la période ${currentPeriod}...`);
      if (currentPeriod === 'custom') {
        console.log(`Dates personnalisées: ${startDate.toISOString().split('T')[0]} au ${endDate.toISOString().split('T')[0]}`);
      }
      
      // Préparer les paramètres pour les appels API
      const params = currentPeriod === 'custom' 
        ? [currentPeriod, startDate, endDate] 
        : [currentPeriod];
      
      // Charger d'abord les statistiques générales pour vérifier la connexion
      const generalStatsData = await statsService.getGeneralStats(...params);
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
        statsService.getOrdersByStatus(...params),
        statsService.getProcessingTimeByStep(),
        statsService.getAgentPerformance(...params),
        statsService.getDailySales(...params),
        statsService.getCompletedTasks(...params),
        statsService.getRecentOrders(...params)
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
    fetchStats(periodFilter, true); // Utiliser la période actuelle
  };
  
  // Fonction pour changer la période
  const handlePeriodChange = (period) => {
    if (!period || period === periodFilter) return; // Éviter les appels inutiles si période inchangée
    
    console.log(`Changement de période vers: ${period} (depuis: ${periodFilter})`);
    
    // Forcer le rafraîchissement des données avec la nouvelle période
    setLoading(true); // Montrer le spinner pendant le chargement
    setPeriodFilter(period);
    setRefreshCounter(prev => prev + 1); // Incrémenter le compteur pour forcer les composants à se rafraîchir
    
    // Appel explicite avec la nouvelle période
    fetchStats(period, true)
      .then(() => {
        console.log(`Données mises à jour avec succès pour la période: ${period}`);
      })
      .catch(err => {
        console.error(`Erreur lors de la mise à jour pour la période ${period}:`, err);
      });
  };
  
  // Fonction pour filtrer la table des performances par agent
  useEffect(() => {
    console.log('Filtering agent performance', { selectedAgent, performanceLength: agentPerformance.length });
    
    if (agentPerformance.length > 0) {
      // Déboguer les données d'agents disponibles
      console.log('Available agents in performance data:', agentPerformance.map(agent => ({ 
        id: agent.id, 
        name: agent.name
      })));
      
      if (selectedAgent && selectedAgent !== '') {
        console.log('Filtering by agent ID:', selectedAgent);
        const filtered = agentPerformance.filter(agent => agent.id === parseInt(selectedAgent));
        console.log('Filtered results:', filtered);
        setFilteredAgentPerformance(filtered);
      } else {
        console.log('No agent filter, showing all agents');
        setFilteredAgentPerformance([...agentPerformance]);
      }
    } else {
      // Si agentPerformance est vide, filteredAgentPerformance doit aussi être vide
      setFilteredAgentPerformance([]);
    }
  }, [agentPerformance, selectedAgent]);
  
  // Charger la liste des agents
  useEffect(() => {
    const getAgents = async () => {
      try {
        const agentsData = await userService.getAllAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Erreur lors du chargement des agents', error);
      }
    };
    getAgents();
  }, []);

  // Charger les données au premier rendu
  useEffect(() => {
    console.log(`Chargement initial des statistiques pour la période: ${periodFilter}`);
    fetchStats(periodFilter, false); // Passer explicitement la période actuelle
    
    // Mettre en place un intervalle de rafraîchissement automatique toutes les 60 secondes
    const autoRefreshInterval = setInterval(() => {
      console.log('Rafraîchissement automatique des statistiques...');
      fetchStats(periodFilter, true); // Passer la période actuelle pour le rafraîchissement
    }, 60000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(autoRefreshInterval);
  }, [periodFilter, startDate, endDate]); // Re-exécuter l'effet lorsque les filtres changent

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
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
    <Container maxWidth="xl" sx={{ mt: isMobile ? 2 : 4, mb: isMobile ? 2 : 4, px: isMobile ? 1 : 3, width: '100%' }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 }, borderRadius: 2, background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom fontWeight="medium" sx={{ mb: 0 }}>
            Tableau de bord statistiques
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DatePicker
                  label="Date de début"
                  value={startDate}
                  onChange={(newDate) => {
                    setStartDate(newDate);
                    if (periodFilter !== 'custom') {
                      setPeriodFilter('custom');
                    }
                  }}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { width: 150 }
                    }
                  }}
                />
                <DatePicker
                  label="Date de fin"
                  value={endDate}
                  onChange={(newDate) => {
                    setEndDate(newDate);
                    if (periodFilter !== 'custom') {
                      setPeriodFilter('custom');
                    }
                  }}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: { width: 150 }
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => {
                    // Réinitialiser les dates à aujourd'hui
                    setStartDate(new Date());
                    setEndDate(new Date());
                    setPeriodFilter('today');
                    fetchStats('today', true);
                  }}
                  color="secondary"
                  sx={{ minWidth: 110 }}
                >
                  Aujourd'hui
                </Button>
              </Box>
            </LocalizationProvider>

            <Tooltip title="Rafraîchir les données">
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: refreshing ? 'background.default' : 'background.paper',
                  boxShadow: refreshing ? 'none' : 1,
                  '&:hover': {
                    bgcolor: 'background.default'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
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
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ width: 200, mb: 2 }}>
              <InputLabel id="agent-filter-label">Filtrer par agent</InputLabel>
              <Select
                labelId="agent-filter-label"
                id="agent-filter"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                label="Filtrer par agent"
                size="small"
              >
                <MenuItem value="">Tous les agents</MenuItem>
                {agents.map((agent) => {
                  const fullName = `${agent.first_name} ${agent.last_name}`;
                  console.log('Agent menu item:', { id: agent.id, fullName });
                  return (
                    <MenuItem key={agent.id} value={agent.id}>
                      {fullName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>
          {/* Ajouter un log de débogage pour vérifier les données */}
          {console.log('Rendering table', { 
            filteredLength: filteredAgentPerformance.length, 
            originalLength: agentPerformance.length,
            selectedAgent
          })}
          
          {selectedAgent && filteredAgentPerformance.length === 0 ? (
            <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
              Aucune activité pour cet agent dans la période sélectionnée.
            </Typography>
          ) : (
            <AgentPerformanceTable 
              data={selectedAgent ? filteredAgentPerformance : agentPerformance}
              noTitle={true}
              lastUpdated={`Dernière mise à jour: ${lastRefreshed.toLocaleTimeString()}`}
              key={`agent-performance-${refreshCounter}-${selectedAgent}`} // Forcer le remontage du composant à chaque filtrage
            />
          )}
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
