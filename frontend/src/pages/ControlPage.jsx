import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Divider, Grid, Alert, Chip, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import OrderSearchBar from '../components/common/OrderSearchBar';
import OrdersList from '../components/control/OrdersList';
import orderService from '../services/orderService';
import ValidateOrderForm from '../components/control/ValidateOrderForm';
import OrderDetailsForm from '../components/control/OrderDetailsForm';

const ControlPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchReference, setSearchReference] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [validateOrderDialogOpen, setValidateOrderDialogOpen] = useState(false);
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Charger les commandes à contrôler
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getOrdersToControl();
        console.log('Données reçues du serveur:', data);
        
        setOrders(data);
        setFilteredOrders(data);
        setTotalCount(data.length);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes', err);
        setError('Impossible de charger les commandes. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Filtrer les commandes lorsque la recherche change
  useEffect(() => {
    if (!searchReference) {
      setFilteredOrders(orders);
      setSearchedOrder(null);
      return;
    }

    const filtered = orders.filter(order => 
      order.reference.toLowerCase().includes(searchReference.toLowerCase())
    );
    setFilteredOrders(filtered);
    
    // Si aucune commande n'est trouvée, afficher un message d'erreur
    if (filtered.length === 0) {
      setSearchError(`Aucune commande ne contient "${searchReference}" dans sa référence.`);
    } else {
      setSearchError('');
    }
  }, [searchReference, orders]);

  // Gérer la recherche d'une commande par référence
  const handleSearch = (reference) => {
    setSearchLoading(true);
    setSearchError('');
    setSearchReference(reference);
    
    // Le filtrage est géré par l'effet ci-dessus
    setTimeout(() => {
      setSearchLoading(false);
    }, 300); // Petit délai pour montrer le chargement
  };

  // Gérer le changement de page
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Gérer le changement du nombre de lignes par page
  const handleChangeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Calculer les commandes à afficher sur la page actuelle
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Gérer l'ouverture du formulaire de validation
  const handleOpenValidateOrderDialog = (order) => {
    setSelectedOrder(order);
    setValidateOrderDialogOpen(true);
  };

  // Gérer la fermeture du formulaire de validation
  const handleCloseValidateOrderDialog = () => {
    setValidateOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  // Gérer l'ouverture du formulaire de détails
  const handleOpenOrderDetailsDialog = (order) => {
    setSelectedOrder(order);
    setOrderDetailsDialogOpen(true);
  };

  // Gérer la fermeture du formulaire de détails
  const handleCloseOrderDetailsDialog = () => {
    setOrderDetailsDialogOpen(false);
    setSelectedOrder(null);
  };

  // Gérer la validation d'une commande
  const handleOrderValidated = async () => {
    // Recharger la liste des commandes
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getOrdersToControl();
      setOrders(data);
      setFilteredOrders(data);
      setTotalCount(data.length);
    } catch (err) {
      console.error('Erreur lors du rechargement des commandes', err);
      setError('Impossible de recharger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth="lg" 
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
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Contrôle des commandes
        </Typography>
        {!isMobile && (
          <Typography variant="body1" paragraph>
            Cette page permet de contrôler les commandes qui ont été préparées.
          </Typography>
        )}
        
        <OrderSearchBar onSearch={handleSearch} />
        
        <Divider sx={{ my: 2 }} />
        
        {searchLoading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Recherche en cours...
          </Alert>
        )}
        
        {searchError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {searchError}
          </Alert>
        )}
        
        <OrdersList 
          orders={paginatedOrders}
          loading={loading}
          error={error}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          onValidate={handleOpenValidateOrderDialog}
          onViewDetails={handleOpenOrderDetailsDialog}
        />

        <ValidateOrderForm 
          open={validateOrderDialogOpen}
          onClose={handleCloseValidateOrderDialog}
          order={selectedOrder}
          onOrderValidated={handleOrderValidated}
        />
        <OrderDetailsForm 
          open={orderDetailsDialogOpen}
          onClose={handleCloseOrderDetailsDialog}
          order={selectedOrder}
        />
      </Paper>
    </Container>
  );
};

export default ControlPage;
