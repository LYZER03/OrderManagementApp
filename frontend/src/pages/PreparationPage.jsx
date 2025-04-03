import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Divider, Grid, Alert, Chip, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import OrderSearchBar from '../components/common/OrderSearchBar';
import OrdersList from '../components/preparation/OrdersList';
import orderService from '../services/orderService';
import AddOrderForm from '../components/preparation/AddOrderForm';
import EditOrderForm from '../components/preparation/EditOrderForm';
import ValidateOrderForm from '../components/preparation/ValidateOrderForm';

const PreparationPage = () => {
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
  const [addOrderDialogOpen, setAddOrderDialogOpen] = useState(false);
  const [editOrderDialogOpen, setEditOrderDialogOpen] = useState(false);
  const [validateOrderDialogOpen, setValidateOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Charger les commandes à préparer
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        // Pour les managers, on peut choisir de voir toutes les commandes ou seulement les siennes
        // Pour les agents, on ne montre que leurs propres commandes
        const creatorOnly = user && (user.role === 'AGENT' || user.role === 'MANAGER');
        
        // Utiliser le paramètre creatorOnly pour filtrer côté serveur
        const data = await orderService.getOrdersToPrepare(creatorOnly);
        console.log('Données reçues du serveur:', data);
        
        // Plus besoin de filtrer côté client, le backend s'en charge
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

  // Ajouter les fonctions de gestion du formulaire
  const handleOpenAddOrderDialog = () => {
    setAddOrderDialogOpen(true);
  };

  const handleCloseAddOrderDialog = () => {
    setAddOrderDialogOpen(false);
  };

  const handleOrderAdded = async () => {
    setLoading(true);
    setError('');
    try {
      // Pour les managers, on peut choisir de voir toutes les commandes ou seulement les siennes
      // Pour les agents, on ne montre que leurs propres commandes
      const creatorOnly = user && (user.role === 'AGENT' || user.role === 'MANAGER');
      
      // Utiliser le paramètre creatorOnly pour filtrer côté serveur
      const data = await orderService.getOrdersToPrepare(creatorOnly);
      
      // Plus besoin de filtrer côté client, le backend s'en charge
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

  const handleOpenEditOrderDialog = (order) => {
    setSelectedOrder(order);
    setEditOrderDialogOpen(true);
  };

  const handleCloseEditOrderDialog = () => {
    setEditOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenValidateOrderDialog = (order) => {
    setSelectedOrder(order);
    setValidateOrderDialogOpen(true);
  };

  const handleCloseValidateOrderDialog = () => {
    setValidateOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = async () => {
    // Recharger la liste des commandes
    await handleOrderAdded();
  };
  
  const handleOrderValidated = async () => {
    // Recharger la liste des commandes
    await handleOrderAdded();
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4, 
        px: isMobile ? 1 : 3,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3,
          width: '100%',
          maxWidth: '900px',
          ml: isMobile ? 3 : 4, // Marge à gauche plus grande en mode mobile
          mt: isMobile ? 2 : 0  // Marge supérieure en mode mobile
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Préparation des commandes
        </Typography>
        {!isMobile && (
          <Typography variant="body1" paragraph>
            Cette page permet de gérer les commandes en attente de préparation.
          </Typography>
        )}
        
        {user && user.role === 'AGENT' && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row' }}>
            <Chip 
              label="Mode Agent" 
              color="primary" 
              size="small" 
              sx={{ mr: 1, mb: isMobile ? 1 : 0 }} 
            />
            <Typography variant="body2" color="textSecondary">
              En tant qu'agent, vous ne voyez que les commandes que vous avez créées.
            </Typography>
          </Box>
        )}
        
        <OrderSearchBar onSearch={handleSearch} onAddClick={handleOpenAddOrderDialog} />
        
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
          onEdit={handleOpenEditOrderDialog}
        />

        <AddOrderForm 
          open={addOrderDialogOpen}
          onClose={handleCloseAddOrderDialog}
          onOrderAdded={handleOrderAdded}
        />
        <EditOrderForm 
          open={editOrderDialogOpen}
          onClose={handleCloseEditOrderDialog}
          order={selectedOrder}
          onOrderUpdated={handleOrderUpdated}
        />
        <ValidateOrderForm 
          open={validateOrderDialogOpen}
          onClose={handleCloseValidateOrderDialog}
          order={selectedOrder}
          onOrderValidated={handleOrderValidated}
        />
      </Paper>
    </Container>
  );
};

export default PreparationPage;
