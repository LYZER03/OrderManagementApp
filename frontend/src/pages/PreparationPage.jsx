import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Divider, Grid, Alert, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import OrderSearchBar from '../components/common/OrderSearchBar';
import OrdersList from '../components/preparation/OrdersList';
import orderService from '../services/orderService';
import AddOrderForm from '../components/preparation/AddOrderForm';

const PreparationPage = () => {
  const { user } = useAuth();
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

  // Charger les commandes à préparer
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getOrdersToPrepare();
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
  }, []);

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
  // Recharger la liste des commandes
  setLoading(true);
  try {
    const data = await orderService.getOrdersToPrepare();
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, ml: 6 }}>
        <Typography variant="h4" gutterBottom>
          Préparation des commandes
        </Typography>
        <Typography variant="body1" paragraph>
          Cette page permet de gérer les commandes en attente de préparation.
        </Typography>
        
        {user && user.role === 'AGENT' && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Chip 
              label="Mode Agent" 
              color="primary" 
              size="small" 
              sx={{ mr: 1 }} 
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
        />

        <AddOrderForm 
          open={addOrderDialogOpen}
          onClose={handleCloseAddOrderDialog}
          onOrderAdded={handleOrderAdded}
        />
      </Paper>
    </Container>
  );
};

export default PreparationPage;
