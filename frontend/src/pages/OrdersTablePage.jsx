import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  useTheme, 
  useMediaQuery, 
  Divider, 
  Button,
  ButtonGroup,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import IconButton from '@mui/material/IconButton';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import OrdersDataTable from '../components/ordersTable/OrdersDataTable';
import orderService from '../services/orderService';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';

const OrdersTablePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // État pour stocker les filtres de date
  const [dateFilter, setDateFilter] = useState('today'); // 'today' par défaut
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fonction pour charger les commandes avec filtrage par date
  const fetchOrders = async (dateParam = dateFilter, start = startDate, end = endDate) => {
    setLoading(true);
    setError('');
    try {
      console.log(`Chargement des commandes avec paramètre de date: ${dateParam}`);
      
      let queryParam = dateParam;
      
      // Si une plage de dates est spécifiée, construire le paramètre de requête approprié
      if (dateParam === 'range' && start && end) {
        const formattedStartDate = format(start, 'yyyy-MM-dd');
        const formattedEndDate = format(end, 'yyyy-MM-dd');
        queryParam = `start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
        console.log(`Filtrage par plage de dates: ${formattedStartDate} à ${formattedEndDate}`);
      }
      
      // Récupérer les commandes avec le filtre de date approprié
      const data = await orderService.getAllOrders(queryParam);
      console.log(`${data.length} commandes reçues du serveur`);
      
      // Journaliser la répartition des commandes par date (pour débogage)
      const dateDistribution = {};
      data.forEach(order => {
        if (order.created_at) {
          const date = new Date(order.created_at).toLocaleDateString();
          dateDistribution[date] = (dateDistribution[date] || 0) + 1;
        }
      });
      console.log('Répartition des commandes par date:', dateDistribution);
      
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des commandes', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour filtrer par date
  const handleDateFilterChange = (filterType, startDateValue = null, endDateValue = null) => {
    setDateFilter(filterType);
    
    if (startDateValue) setStartDate(startDateValue);
    if (endDateValue) setEndDate(endDateValue);
    
    // Charger les commandes avec le nouveau filtre
    fetchOrders(filterType, startDateValue, endDateValue);
  };
  


  // Charger les commandes au chargement initial de la page
  useEffect(() => {
    // Par défaut, charger les commandes d'aujourd'hui
    fetchOrders('today');
  }, []);
  

  
  // Gérer le rafraîchissement des données
  const handleRefresh = () => {
    // Rafraîchir avec le même filtre de date
    fetchOrders(dateFilter, startDate, endDate);
  };

  // Fonction pour supprimer des commandes
  const handleDeleteOrders = async (orderIds) => {
    try {
      await orderService.deleteOrders(orderIds);
      
      // Mettre à jour la liste des commandes après la suppression
      const updatedOrders = orders.filter(order => !orderIds.includes(order.id));
      setOrders(updatedOrders);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression des commandes', err);
      throw err;
    }
  };

  // Recherche dynamique par référence côté frontend sur toutes les commandes
  const [searchRef, setSearchRef] = useState('');
  const [allOrders, setAllOrders] = useState(null); // toutes les commandes pour la recherche globale
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Charger toutes les commandes dès la première saisie (si pas déjà fait)
  useEffect(() => {
    if (searchRef.trim() && allOrders === null) {
      setSearchLoading(true);
      setSearchError('');
      orderService.getAllOrders('all')
        .then(data => {
          setAllOrders(data);
          setSearchLoading(false);
        })
        .catch(() => {
          setSearchError('Impossible de charger toutes les commandes pour la recherche.');
          setAllOrders([]);
          setSearchLoading(false);
        });
    }
    if (!searchRef.trim()) {
      setSearchError('');
      setSearchLoading(false);
    }
  }, [searchRef, allOrders]);

  // Filtrage dynamique sur allOrders
  const filteredSearchOrders =
    searchRef.trim() && allOrders
      ? allOrders.filter(order =>
          order.reference &&
          order.reference.toLowerCase().includes(searchRef.trim().toLowerCase())
        )
      : null;

  const clearSearch = () => {
    setSearchRef('');
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
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
              Table des commandes
            </Typography>
            {!isMobile && (
              <Typography variant="body1">
                Cette page permet de visualiser, filtrer et gérer les commandes du système.
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Barre de recherche par référence */}
            <TextField
              label="Rechercher par référence"
              size="small"
              value={searchRef}
              onChange={e => setSearchRef(e.target.value)}
              sx={{ minWidth: 200 }}
              helperText={searchError}
              error={!!searchError}
              disabled={searchLoading}
              autoFocus
            />
            {searchRef && (
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={clearSearch}
                disabled={searchLoading}
              >
                Effacer
              </Button>
            )}
            {searchLoading && <Typography variant="caption" color="primary">Recherche...</Typography>}
            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss')}
            </Typography>
            
            <ButtonGroup variant="outlined" size={isMobile ? "small" : "medium"}>
              <Tooltip title="Afficher les commandes d'aujourd'hui">
                <Button 
                  color={dateFilter === 'today' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('today')}
                  startIcon={<TodayIcon />}
                >
                  {isMobile ? '' : "Aujourd'hui"}
                </Button>
              </Tooltip>
              
              <Tooltip title="Afficher les commandes d'hier">
                <Button 
                  color={dateFilter === 'yesterday' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('yesterday')}
                >
                  {isMobile ? '' : 'Hier'}
                </Button>
              </Tooltip>
              
              <Tooltip title="Afficher toutes les commandes">
                <Button 
                  color={dateFilter === 'all' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('all')}
                  startIcon={<CalendarMonthIcon />}
                >
                  {isMobile ? '' : 'Toutes'}
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Stack direction="row" spacing={1} alignItems="center">
                <DatePicker
                  label="Du"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleDateFilterChange('range', newValue, endDate || newValue);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                  format="dd/MM/yyyy"
                />
                <DatePicker
                  label="Au"
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleDateFilterChange('range', startDate || newValue, newValue);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                  format="dd/MM/yyyy"
                />
              </Stack>
            </LocalizationProvider>
            
            <Tooltip title="Rafraîchir les données">
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                size={isMobile ? "small" : "medium"}
              >
                {isMobile ? '' : 'Rafraîchir'}
              </Button>
            </Tooltip>
          </Stack>
        </Box>
        

        
        <Divider sx={{ my: 2 }} />
        
        <OrdersDataTable 
          orders={filteredSearchOrders !== null ? filteredSearchOrders : orders}
          loading={searchRef.trim() ? searchLoading : loading}
          error={searchRef.trim() ? searchError : error}
          onDeleteOrders={handleDeleteOrders}
        />
      </Paper>
    </Container>
  );
};

export default OrdersTablePage;
