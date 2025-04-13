import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Alert, useTheme, useMediaQuery, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import OrdersDataTable from '../components/ordersTable/OrdersDataTable';
import orderService from '../services/orderService';

const OrdersTablePage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    startDate: null,
    endDate: null,
    ordering: '-created_at'
  });

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // Fonction pour charger les commandes avec pagination et filtrage
  const fetchOrders = async (page = 1, pageSize = 20, filters = {}) => {
    setLoading(true);
    setError('');
    try {
      // Préparer les paramètres de requête
      const params = {
        page: page,
        page_size: pageSize,
        ordering: filters.ordering || '-created_at'
      };
      
      // Ajouter les filtres s'ils sont définis
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.start_date = filters.startDate.toISOString();
      if (filters.endDate) params.end_date = filters.endDate.toISOString();
      
      // Effectuer la requête
      const data = await orderService.getAllOrders(params);
      console.log('Données reçues du serveur:', data);
      
      // Mettre à jour les états
      setOrders(data.results);
      setPagination({
        page: data.page,
        pageSize: data.page_size,
        totalCount: data.count,
        totalPages: data.total_pages
      });
    } catch (err) {
      console.error('Erreur lors du chargement des commandes', err);
      setError('Impossible de charger les commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les commandes au chargement initial et lors des changements de filtres/pagination
  useEffect(() => {
    fetchOrders(pagination.page, pagination.pageSize, filters);
  }, [pagination.page, pagination.pageSize, filters]);

  // Fonction pour supprimer des commandes
  const handleDeleteOrders = async (orderIds) => {
    try {
      await orderService.deleteOrders(orderIds);
      
      // Recharger les données après la suppression pour maintenir la cohérence
      fetchOrders(pagination.page, pagination.pageSize, filters);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression des commandes', err);
      throw err;
    }
  };
  
  // Fonction pour changer de page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  // Fonction pour changer la taille de page
  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({
      ...prev,
      page: 1, // Retour à la première page lors du changement de taille
      pageSize: newPageSize
    }));
  };
  
  // Fonction pour appliquer les filtres
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Retour à la première page lors de l'application des filtres
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
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
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Table des commandes
        </Typography>
        {!isMobile && (
          <Typography variant="body1" paragraph>
            Cette page permet de visualiser, filtrer et gérer toutes les commandes du système.
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <OrdersDataTable 
          orders={orders}
          loading={loading}
          error={error}
          pagination={pagination}
          filters={filters}
          onDeleteOrders={handleDeleteOrders}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onFilterChange={handleFilterChange}
        />
      </Paper>
    </Container>
  );
};

export default OrdersTablePage;
