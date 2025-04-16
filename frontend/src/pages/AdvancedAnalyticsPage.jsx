import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  useTheme, 
  useMediaQuery,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Label,
  LabelList
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import statsService from '../services/statsService';
import orderService from '../services/orderService';
import userService from '../services/userService';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';

// Composant pour afficher un graphique linéaire d'évolution temporelle
const TimeSeriesChart = ({ data, title, description, loading, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return (
    <Card sx={{ height: '100%', minHeight: 350 }}>
      <CardHeader 
        title={title} 
        subheader={description}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <Divider />
      <CardContent sx={{ height: isMobile ? 300 : 350, pt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={40}
            >
              <Label
                value="Nombre de commandes"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle', fontSize: '12px' }}
              />
            </YAxis>
            <Tooltip 
              formatter={(value) => [`${value} commandes`, 'Quantité']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend verticalAlign="top" height={36}/>
            <Line
              type="monotone"
              dataKey="created"
              name="Créées"
              stroke={theme.palette.primary.main}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="Complétées"
              stroke={theme.palette.success.main}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un graphique circulaire de répartition par statut
const StatusDistributionChart = ({ data, title, description, loading, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.secondary.main
  ];
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return (
    <Card sx={{ height: '100%', minHeight: 350 }}>
      <CardHeader 
        title={title} 
        subheader={description}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <Divider />
      <CardContent sx={{ height: isMobile ? 300 : 350, pt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={isMobile ? 80 : 100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} commandes`, 'Quantité']} />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un graphique à barres des temps de traitement
const ProcessingTimeChart = ({ data, title, description, loading, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return (
    <Card sx={{ height: '100%', minHeight: 350 }}>
      <CardHeader 
        title={title} 
        subheader={description}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <Divider />
      <CardContent sx={{ height: isMobile ? 300 : 350, pt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 100,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
            >
              <Label
                value="Temps moyen (minutes)"
                position="bottom"
                style={{ textAnchor: 'middle', fontSize: '12px' }}
              />
            </XAxis>
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 12 }}
              width={90}
            />
            <Tooltip formatter={(value) => [`${value.toFixed(1)} minutes`, 'Temps moyen']} />
            <Legend />
            <Bar 
              dataKey="value" 
              name="Temps moyen (min)" 
              fill={theme.palette.info.main}
            >
              <LabelList dataKey="value" position="right" formatter={(value) => `${value.toFixed(1)} min`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher un graphique à barres de performance des agents
const AgentPerformanceChart = ({ data, title, description, loading, error }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  
  return (
    <Card sx={{ height: '100%', minHeight: 350 }}>
      <CardHeader 
        title={title} 
        subheader={description}
        titleTypographyProps={{ variant: 'h6' }}
        subheaderTypographyProps={{ variant: 'body2' }}
      />
      <Divider />
      <CardContent sx={{ height: isMobile ? 300 : 350, pt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={40}
            >
              <Label
                value="Nombre de commandes"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle', fontSize: '12px' }}
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar dataKey="created" name="Créées" fill={theme.palette.primary.main} />
            <Bar dataKey="prepared" name="Préparées" fill={theme.palette.success.main} />
            <Bar dataKey="controlled" name="Contrôlées" fill={theme.palette.warning.main} />
            <Bar dataKey="packed" name="Emballées" fill={theme.palette.secondary.main} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Composant pour afficher les KPIs
const KPICard = ({ title, value, description, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              backgroundColor: `${color}.light`, 
              borderRadius: '50%', 
              p: 1, 
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Page principale d'analyse avancée
const AdvancedAnalyticsPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('month');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Données pour les graphiques
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [statusDistributionData, setStatusDistributionData] = useState([]);
  const [processingTimeData, setProcessingTimeData] = useState([]);
  const [agentPerformanceData, setAgentPerformanceData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    averageProcessingTime: 0,
    ordersPerDay: 0
  });
  
  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }
  
  // Préparer les données pour le graphique d'évolution temporelle
  const prepareTimeSeriesData = (orders, startDate, endDate) => {
    // Créer un tableau avec toutes les dates de la plage
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Initialiser les données avec des compteurs à 0 pour chaque date
    const data = dateRange.map(date => ({
      date: format(date, 'dd/MM/yyyy'),
      created: 0,
      completed: 0
    }));
    
    // Compter les commandes créées et complétées pour chaque date
    orders.forEach(order => {
      const createdDate = new Date(order.created_at);
      const createdDateFormatted = format(createdDate, 'dd/MM/yyyy');
      
      // Incrémenter le compteur des commandes créées
      const createdIndex = data.findIndex(item => item.date === createdDateFormatted);
      if (createdIndex !== -1) {
        data[createdIndex].created += 1;
      }
      
      // Incrémenter le compteur des commandes complétées si elles sont emballées
      if (order.status === 'PACKED' && order.packed_at) {
        const packedDate = new Date(order.packed_at);
        const packedDateFormatted = format(packedDate, 'dd/MM/yyyy');
        
        const packedIndex = data.findIndex(item => item.date === packedDateFormatted);
        if (packedIndex !== -1) {
          data[packedIndex].completed += 1;
        }
      }
    });
    
    return data;
  };
  
  // Préparer les données pour le graphique de répartition par statut
  const prepareStatusDistributionData = (dashboardData) => {
    if (!dashboardData || !dashboardData.order_counts) {
      return [];
    }
    
    return [
      { name: 'Créées', value: dashboardData.order_counts.total - dashboardData.order_counts.in_progress - dashboardData.order_counts.completed },
      { name: 'En cours', value: dashboardData.order_counts.in_progress },
      { name: 'Complétées', value: dashboardData.order_counts.completed }
    ];
  };
  
  // Préparer les données pour le graphique des temps de traitement
  const prepareProcessingTimeData = (dashboardData) => {
    if (!dashboardData || !dashboardData.average_times) {
      return [];
    }
    
    return [
      { name: 'Préparation', value: dashboardData.average_times.preparation },
      { name: 'Contrôle', value: dashboardData.average_times.control },
      { name: 'Emballage', value: dashboardData.average_times.packing },
      { name: 'Total', value: dashboardData.average_times.total }
    ];
  };
  
  // Préparer les données pour le graphique de performance des agents
  const prepareAgentPerformanceData = (agents, orders) => {
    if (!agents || !orders) {
      return [];
    }
    
    // Initialiser les données avec des compteurs à 0 pour chaque agent
    const data = agents.map(agent => ({
      name: agent.username,
      created: 0,
      prepared: 0,
      controlled: 0,
      packed: 0
    }));
    
    // Compter les commandes créées, préparées, contrôlées et emballées par chaque agent
    orders.forEach(order => {
      // Commandes créées
      if (order.creator) {
        const creatorIndex = data.findIndex(item => item.name === order.creator_details?.username);
        if (creatorIndex !== -1) {
          data[creatorIndex].created += 1;
        }
      }
      
      // Commandes préparées
      if (order.preparer && order.status !== 'CREATED') {
        const preparerIndex = data.findIndex(item => item.name === order.preparer_details?.username);
        if (preparerIndex !== -1) {
          data[preparerIndex].prepared += 1;
        }
      }
      
      // Commandes contrôlées
      if (order.controller && (order.status === 'CONTROLLED' || order.status === 'PACKED')) {
        const controllerIndex = data.findIndex(item => item.name === order.controller_details?.username);
        if (controllerIndex !== -1) {
          data[controllerIndex].controlled += 1;
        }
      }
      
      // Commandes emballées
      if (order.packer && order.status === 'PACKED') {
        const packerIndex = data.findIndex(item => item.name === order.packer_details?.username);
        if (packerIndex !== -1) {
          data[packerIndex].packed += 1;
        }
      }
    });
    
    return data;
  };
  
  // Préparer les données pour les KPIs
  const prepareKPIData = (dashboardData, orders, startDate, endDate) => {
    if (!dashboardData || !orders || !startDate || !endDate) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        averageProcessingTime: 0,
        ordersPerDay: 0
      };
    }
    
    // Calculer le nombre de jours dans la plage
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Calculer les KPIs
    const totalOrders = dashboardData.order_counts.total;
    const completedOrders = dashboardData.order_counts.completed;
    const averageProcessingTime = dashboardData.average_times.total;
    const ordersPerDay = totalOrders / (daysDiff || 1); // Éviter la division par zéro
    
    return {
      totalOrders,
      completedOrders,
      averageProcessingTime,
      ordersPerDay
    };
  };
  
  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Début du chargement des données...');
        
        // Déterminer la plage de dates en fonction du timeRange
        const today = new Date();
        let startDate, endDate;
        
        if (timeRange === 'week') {
          startDate = subDays(today, 7);
          endDate = today;
        } else if (timeRange === 'month') {
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
        } else if (timeRange === 'quarter') {
          startDate = subDays(today, 90);
          endDate = today;
        }
        
        // Formater les dates pour l'API
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        const dateParams = `start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
        
        console.log('Plage de dates:', dateParams);
        
        // Récupérer les données du dashboard
        console.log('Récupération des données du dashboard...');
        const dashboardData = await statsService.getDashboardStats(dateParams);
        console.log('Données du dashboard reçues:', dashboardData);
        
        // Récupérer les données des commandes pour la série temporelle
        console.log('Récupération des commandes...');
        const orders = await orderService.getAllOrders('all');
        console.log('Commandes reçues:', orders.length);
        
        // Récupérer les données des agents
        console.log('Récupération des agents...');
        const agents = await userService.getAllAgents();
        console.log('Agents reçus:', agents.length);
        
        // Initialiser des données par défaut au cas où les données reçues sont invalides
        let timeSeriesDataResult = [];
        let statusDistributionDataResult = [];
        let processingTimeDataResult = [];
        let agentPerformanceDataResult = [];
        let kpiDataResult = {
          totalOrders: 0,
          completedOrders: 0,
          averageProcessingTime: 0,
          ordersPerDay: 0
        };
        
        // Vérifier que les données reçues sont valides avant de les traiter
        if (orders && orders.length > 0) {
          console.log('Préparation des données de série temporelle...');
          timeSeriesDataResult = prepareTimeSeriesData(orders, startDate, endDate);
        }
        
        if (dashboardData && dashboardData.order_counts) {
          console.log('Préparation des données de répartition par statut...');
          statusDistributionDataResult = prepareStatusDistributionData(dashboardData);
          
          console.log('Préparation des données de temps de traitement...');
          processingTimeDataResult = prepareProcessingTimeData(dashboardData);
        }
        
        if (agents && agents.length > 0 && orders && orders.length > 0) {
          console.log('Préparation des données de performance des agents...');
          agentPerformanceDataResult = prepareAgentPerformanceData(agents, orders);
        }
        
        if (dashboardData && orders && orders.length > 0) {
          console.log('Préparation des KPIs...');
          kpiDataResult = prepareKPIData(dashboardData, orders, startDate, endDate);
        }
        
        // Mettre à jour les états
        console.log('Mise à jour des états...');
        setTimeSeriesData(timeSeriesDataResult);
        setStatusDistributionData(statusDistributionDataResult);
        setProcessingTimeData(processingTimeDataResult);
        setAgentPerformanceData(agentPerformanceDataResult);
        setKpiData(kpiDataResult);
        
        console.log('Chargement des données terminé avec succès');
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
        
        // Créer un message d'erreur plus détaillé
        let errorMessage = 'Impossible de charger les données. ';
        
        if (err.response) {
          // Erreur de réponse du serveur
          errorMessage += `Erreur ${err.response.status}: ${err.response.data.message || 'Erreur serveur'}`;
        } else if (err.request) {
          // Pas de réponse du serveur
          errorMessage += 'Le serveur ne répond pas. Vérifiez votre connexion.';
        } else {
          // Autre erreur
          errorMessage += err.message || 'Une erreur inconnue est survenue.';
        }
        
        setError(errorMessage);
        
        // Initialiser des données vides pour éviter les erreurs d'affichage
        setTimeSeriesData([]);
        setStatusDistributionData([]);
        setProcessingTimeData([]);
        setAgentPerformanceData([]);
        setKpiData({
          totalOrders: 0,
          completedOrders: 0,
          averageProcessingTime: 0,
          ordersPerDay: 0
        });
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, refreshTrigger]);
  

  
  // Gérer le changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Gérer le changement de plage de temps
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Gérer le rafraîchissement des données
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
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
        sx={{ 
          p: isMobile ? 2 : 3,
          width: '100%',
          maxWidth: '100%',
          mt: isMobile ? 2 : 0,
          bgcolor: '#ffffff',
          boxShadow: 'none'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analyses Avancées
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="time-range-label">Période</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={timeRange}
                label="Période"
                onChange={handleTimeRangeChange}
                size="small"
              >
                <MenuItem value="week">7 derniers jours</MenuItem>
                <MenuItem value="month">Mois en cours</MenuItem>
                <MenuItem value="quarter">90 derniers jours</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
            >
              Rafraîchir
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* KPIs */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total des commandes"
              value={kpiData.totalOrders}
              description="Nombre total de commandes sur la période"
              icon={<AssessmentIcon sx={{ color: theme.palette.primary.main }} />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Commandes complétées"
              value={kpiData.completedOrders}
              description="Nombre de commandes emballées sur la période"
              icon={<DateRangeIcon sx={{ color: theme.palette.success.main }} />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Temps moyen (min)"
              value={kpiData.averageProcessingTime.toFixed(1)}
              description="Temps moyen de traitement total en minutes"
              icon={<TimelineIcon sx={{ color: theme.palette.info.main }} />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Commandes / jour"
              value={kpiData.ordersPerDay.toFixed(1)}
              description="Nombre moyen de commandes par jour"
              icon={<SpeedIcon sx={{ color: theme.palette.warning.main }} />}
              color="warning"
            />
          </Grid>
        </Grid>
        
        {/* Onglets pour les différents graphiques */}
        <Box sx={{ mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            aria-label="analytics tabs"
          >
            <Tab label="Évolution temporelle" />
            <Tab label="Répartition par statut" />
            <Tab label="Temps de traitement" />
            <Tab label="Performance des agents" />
          </Tabs>
        </Box>
        
        {/* Contenu des onglets */}
        <Box sx={{ mt: 3 }}>
          {/* Évolution temporelle */}
          {tabValue === 0 && (
            <TimeSeriesChart
              data={timeSeriesData}
              title="Évolution des commandes dans le temps"
              description="Nombre de commandes créées et complétées par jour"
              loading={loading}
              error={error}
            />
          )}
          
          {/* Répartition par statut */}
          {tabValue === 1 && (
            <StatusDistributionChart
              data={statusDistributionData}
              title="Répartition des commandes par statut"
              description="Distribution des commandes selon leur état actuel"
              loading={loading}
              error={error}
            />
          )}
          
          {/* Temps de traitement */}
          {tabValue === 2 && (
            <ProcessingTimeChart
              data={processingTimeData}
              title="Temps moyen de traitement par étape"
              description="Durée moyenne (en minutes) pour chaque étape du processus"
              loading={loading}
              error={error}
            />
          )}
          
          {/* Performance des agents */}
          {tabValue === 3 && (
            <AgentPerformanceChart
              data={agentPerformanceData}
              title="Performance des agents"
              description="Nombre de commandes traitées par agent à chaque étape"
              loading={loading}
              error={error}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AdvancedAnalyticsPage;
