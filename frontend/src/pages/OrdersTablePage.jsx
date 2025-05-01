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

  // Rediriger si l'utilisateur n'est ni un manager ni un super agent
  if (!user || (user.role !== 'MANAGER' && user.role !== 'SUPER_AGENT')) {
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

  // Recherche dynamique par référence et par N° Chariot côté frontend sur toutes les commandes
  const [searchRef, setSearchRef] = useState('');
  const [searchCartNumber, setSearchCartNumber] = useState('');
  const [allOrders, setAllOrders] = useState(null); // toutes les commandes pour la recherche globale
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Charger toutes les commandes dès la première saisie (si pas déjà fait)
  useEffect(() => {
    if ((searchRef.trim() || searchCartNumber.trim()) && allOrders === null) {
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
    if (!searchRef.trim() && !searchCartNumber.trim()) {
      setSearchError('');
      setSearchLoading(false);
    }
  }, [searchRef, searchCartNumber, allOrders]);

  // Filtrage dynamique sur allOrders
  const filteredSearchOrders =
    (searchRef.trim() || searchCartNumber.trim()) && allOrders
      ? allOrders.filter(order => {
          const matchRef = searchRef.trim()
            ? order.reference && order.reference.toLowerCase().includes(searchRef.trim().toLowerCase())
            : true;
          const matchCart = searchCartNumber.trim()
            ? order.cart_number && order.cart_number.toLowerCase().includes(searchCartNumber.trim().toLowerCase())
            : true;
          return matchRef && matchCart;
        })
      : null;

  const clearSearch = () => {
    setSearchRef('');
  };

  const clearCartNumberSearch = () => {
    setSearchCartNumber('');
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
        {/* Titre et infos */}
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
        {/* Section des filtres de recherche - Restructurée pour responsive */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)',
          }}
        >
          {/* Grille responsive pour les barres de recherche */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              mb: 3
            }}
          >
            {/* Barre de recherche par N° Chariot */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="Rechercher par N° Chariot"
                size="small"
                value={searchCartNumber}
                onChange={e => setSearchCartNumber(e.target.value)}
                sx={{ flex: 1 }}
                disabled={searchLoading}
                placeholder="Entrez un numéro"
                fullWidth
              />
              {searchCartNumber && (
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={clearCartNumberSearch}
                  disabled={searchLoading}
                >
                  Effacer
                </Button>
              )}
            </Box>
            
            {/* Barre de recherche par référence */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label="Rechercher par référence"
                size="small"
                value={searchRef}
                onChange={e => setSearchRef(e.target.value)}
                fullWidth
                helperText={searchError}
                error={!!searchError}
                disabled={searchLoading}
                placeholder="Entrez une référence"
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
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Filtres de date
            </Typography>
          </Box>
          
          {/* Section des filtres de date */}
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '2fr 3fr 1fr' },
              gap: { xs: 2, md: 2 },
              alignItems: 'center'
            }}
          >
            {/* Filtres rapides */}
            <ButtonGroup 
              variant="outlined" 
              size={isMobile ? "small" : "medium"}
              sx={{ width: '100%', justifyContent: { xs: 'center', md: 'flex-start' } }}
            >
              <Tooltip title="Afficher les commandes d'aujourd'hui">
                <Button 
                  color={dateFilter === 'today' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('today')}
                  startIcon={!isMobile && <TodayIcon />}
                  sx={{ flex: { xs: 1, md: 'initial' } }}
                >
                  {isMobile ? 'Auj.' : "Aujourd'hui"}
                </Button>
              </Tooltip>
              <Tooltip title="Afficher les commandes d'hier">
                <Button 
                  color={dateFilter === 'yesterday' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('yesterday')}
                  sx={{ flex: { xs: 1, md: 'initial' } }}
                >
                  {isMobile ? 'Hier' : 'Hier'}
                </Button>
              </Tooltip>
              <Tooltip title="Afficher toutes les commandes">
                <Button 
                  color={dateFilter === 'all' ? "primary" : "inherit"}
                  onClick={() => handleDateFilterChange('all')}
                  startIcon={!isMobile && <CalendarMonthIcon />}
                  sx={{ flex: { xs: 1, md: 'initial' } }}
                >
                  {isMobile ? 'Tout' : 'Toutes'}
                </Button>
              </Tooltip>
            </ButtonGroup>
            
            {/* Sélecteurs de date */}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' },
                  gap: 1
                }}
              >
                <DatePicker
                  label="Du"
                  value={startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      handleDateFilterChange('range', newValue, endDate || newValue);
                    }
                  }}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
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
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  format="dd/MM/yyyy"
                />
              </Box>
            </LocalizationProvider>
            
            {/* Bouton de rafraîchissement */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: { xs: 'center', md: 'flex-end' },
              alignItems: { xs: 'center', md: 'flex-end' }
            }}>
              <Tooltip title="Rafraîchir les données">
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                  sx={{ mb: 1 }}
                >
                  {isMobile ? 'Actualiser' : 'Rafraîchir'}
                </Button>
              </Tooltip>
              
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                Dernière mise à jour: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss')}
              </Typography>
            </Box>
          </Box>
        </Paper>
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
