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
      
      // Utiliser 'today' comme paramètre de date par défaut
      const dateParam = 'today';
      
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
    fetchStats(true);
  };
  
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
            Tableau de bord statistique
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble des performances et des indicateurs clés du système de gestion des commandes.
          </Typography>
        </Box>
        <Tooltip title="Rafraîchir les données">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            color="primary"
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper', opacity: 0.9 }
            }}
          >
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Dernière mise à jour : {lastRefreshed.toLocaleTimeString()}
        </Typography>
      </Box>
      
      {/* Cartes de statistiques générales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<ShoppingCartIcon />} 
            title="Commandes totales" 
            value={generalStats?.totalOrders || 0} 
            changePercentage={generalStats?.growthPercentage?.totalOrders || 0} 
            changeText="depuis la semaine dernière" 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<PendingActionsIcon />} 
            title="En cours" 
            value={generalStats?.ordersInProgress || 0} 
            changePercentage={generalStats?.growthPercentage?.ordersInProgress || 0} 
            changeText="depuis le mois dernier" 
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<CheckCircleIcon />} 
            title="Complétées" 
            value={generalStats?.completedOrders || 0} 
            changePercentage={generalStats?.growthPercentage?.completedOrders || 0} 
            changeText="depuis hier" 
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<TrendingUpIcon />} 
            title="Croissance" 
            value={`+${generalStats?.growthRate || 0}`} 
            lastUpdated="Juste mis à jour" 
            color="warning"
          />
        </Grid>
      </Grid>
      
      {/* Graphiques et tableaux */}
      <Grid container spacing={4} sx={{ px: 0 }}>
        {/* Graphique des ventes quotidiennes */}
        <Grid item xs={12}>
          <LineChartCard 
            title="Commandes mensuelles" 
            subtitle={`${dailySales.reduce((sum, item) => sum + item.sales, 0)} commandes créées au total`} 
            data={dailySales} 
            lines={[{ dataKey: 'sales', color: theme.palette.success.main, name: 'Commandes' }]}
            xAxisDataKey="name"
            lastUpdated={`Mis à jour le ${new Date().toLocaleDateString('fr-FR')}`}
            height={350}
            width="95%"
          />
        </Grid>
        
        {/* Graphique des tâches complétées */}
        <Grid item xs={12}>
          <LineChartCard 
            title="Commandes emballées" 
            subtitle={`${completedTasks.reduce((sum, item) => sum + item.tasks, 0)} commandes emballées au total`} 
            data={completedTasks} 
            lines={[{ dataKey: 'tasks', color: theme.palette.grey[800], name: 'Emballées' }]}
            xAxisDataKey="name"
            lastUpdated={`Mis à jour le ${new Date().toLocaleDateString('fr-FR')}`}
            height={350}
            width="95%"
          />
        </Grid>
        
        {/* Graphique des commandes par statut */}
        <Grid item xs={12}>
          <PieChartCard 
            title="Commandes par statut" 
            subtitle="Répartition des commandes selon leur statut actuel" 
            data={ordersByStatus} 
            dataKey="value"
            nameKey="name"
            lastUpdated="Mis à jour aujourd'hui"
            height={400}
            width="95%"
          />
        </Grid>
        
        {/* Tableaux des performances des agents et des commandes récentes */}
        <Grid container direction="column" spacing={6} sx={{ width: '100%', px: 0 }}>
          <Grid item xs={12}>
            <AgentPerformanceTable 
              title="Performance des agents" 
              subtitle="Évaluation des performances des agents par commandes traitées et temps moyen" 
              data={agentPerformance}
              lastUpdated="Mis à jour aujourd'hui"
            />
          </Grid>
          
          <Grid item xs={12}>
            <RecentOrdersTable 
              title="Commandes récentes" 
              subtitle="Dernières commandes traitées" 
              data={recentOrders}
              lastUpdated="Mis à jour aujourd'hui"
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StatisticsPage;
