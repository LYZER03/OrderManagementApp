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

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // Charger toutes les commandes
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getAllOrders();
        console.log('Données reçues du serveur:', data);
        
        setOrders(data);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes', err);
        setError('Impossible de charger les commandes. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
          onDeleteOrders={handleDeleteOrders}
        />
      </Paper>
    </Container>
  );
};

export default OrdersTablePage;
