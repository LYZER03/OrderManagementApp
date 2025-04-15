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

  // Fonction pour charger les commandes
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // Charger toutes les commandes sans filtre de date par défaut
      console.log('Chargement de toutes les commandes');
      const data = await orderService.getAllOrders('all');
      console.log('Données reçues du serveur:', data);
      
      setOrders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erreur lors du chargement des commandes', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  


  // Charger les commandes lors d'un rafraîchissement
  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);
  

  
  // Gérer le rafraîchissement des données
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour: {format(lastUpdated, 'dd/MM/yyyy HH:mm:ss')}
            </Typography>
            
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
          orders={orders}
          loading={loading}
          error={error}
          onDeleteOrders={handleDeleteOrders}
        />
      </Paper>
    </Container>
  );
};

export default OrdersTablePage;
