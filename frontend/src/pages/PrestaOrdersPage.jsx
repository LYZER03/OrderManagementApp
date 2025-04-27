import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Constante pour l'URL de l'API
//const API_URL = 'http://localhost:8000/api';http://192.168.3.207:8000
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : 'http://192.168.1.16:8000/api';

// Mapping des états de commande PrestaShop vers des couleurs
const orderStatusColors = {
  // Statuts PrestaShop d'origine
  '1': '#3498db', // En attente
  
  // Statuts personnalisés pour notre application
  '2': '#2ecc71', // Commande créée et validée
  '3': '#f39c12', // En cours de préparation
  '4': '#9b59b6', // Préparée, en attente de contrôle
  '5': '#e74c3c', // Contrôlée, en attente d'emballage
  '6': '#27ae60', // Emballée, terminée
  
  // Autres statuts PrestaShop
  '7': '#95a5a6', // Annulé
  '8': '#34495e', // Remboursé
  '9': '#7f8c8d'  // Erreur de paiement
};

// Mapping des états de commande PrestaShop vers des libellés
const orderStatusLabels = {
  // Statuts PrestaShop d'origine
  '1': 'En attente',
  
  // Statuts personnalisés pour notre application
  '2': 'Commandée',
  '3': 'En préparation',
  '4': 'Préparée',
  '5': 'Contrôlée',
  '6': 'Emballée',
  
  // Autres statuts PrestaShop
  '7': 'Annulée',
  '8': 'Remboursée',
  '9': 'Erreur de paiement'
};

const PrestaOrdersPage = () => {
  const { isAuthenticated, isManager, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fonction pour récupérer les commandes PrestaShop
  const fetchPrestaOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE}/orders/presta-orders/`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes PrestaShop:', err);
      setError(
        err.response?.data?.error || 
        'Impossible de récupérer les commandes PrestaShop. Veuillez vérifier votre connexion.'
      );
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrestaOrders().finally(() => {
      setRefreshing(false);
    });
  };

  // Charger les commandes au chargement de la page
  useEffect(() => {
    fetchPrestaOrders();
    
    // Rafraîchissement automatique toutes les 60 secondes
    const interval = setInterval(() => {
      fetchPrestaOrders();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Si l'utilisateur n'est pas authentifié ou n'est pas un manager
  if (!isAuthenticated() || !isManager()) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les droits pour accéder à cette page. Seuls les managers peuvent consulter les commandes PrestaShop.
        </Alert>
      </Container>
    );
  }

  // Affichage pendant le chargement
  if (loading && !refreshing) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Commandes PrestaShop du Jour
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        {error ? (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        ) : orders.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Aucune commande PrestaShop n'a été trouvée pour aujourd'hui.
          </Alert>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 'bold', backgroundColor: '#f5f5f5' } }}>
                  <TableCell>Référence</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Paiement</TableCell>
                  <TableCell>Produits</TableCell>
                  <TableCell>Utilisateurs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                    <TableCell>{order.reference}</TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={orderStatusLabels[order.status] || 'Inconnu'} 
                        sx={{ 
                          backgroundColor: orderStatusColors[order.status] || '#cccccc',
                          color: 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                    </TableCell>
                    <TableCell>{parseFloat(order.total_paid).toFixed(2)} €</TableCell>
                    <TableCell>{order.payment_method}</TableCell>
                    <TableCell>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{order.products.length} produit(s)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Produit</TableCell>
                                  <TableCell align="right">Quantité</TableCell>
                                  <TableCell align="right">Prix unitaire</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {order.products.map((product, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{product.product_name}</TableCell>
                                    <TableCell align="right">{product.quantity}</TableCell>
                                    <TableCell align="right">{parseFloat(product.price).toFixed(2)} €</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Voir les détails des utilisateurs">
                        <IconButton 
                          color="primary" 
                          onClick={() => {
                            setSelectedOrder(order);
                            setDetailsOpen(true);
                          }}
                          disabled={!order.internal_order_id}
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Dialogue de détails des utilisateurs */}
                <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle>
                    Détails des utilisateurs - Commande {selectedOrder?.reference}
                  </DialogTitle>
                  <DialogContent dividers>
                    {selectedOrder ? (
                      selectedOrder.internal_order_id ? (
                        <List>
                          {["creator", "preparer", "controller", "packer"].map((role) => {
                            const handlerData = selectedOrder.handlers?.[role];
                            const handler = handlerData?.user;
                            const timestamp = handlerData?.timestamp;
                            
                            const statusMap = {
                              creator: "Créée",
                              preparer: "Préparée",
                              controller: "Contrôlée",
                              packer: "Emballée"
                            };
                            const roleColor = {
                              creator: "#2196f3",
                              preparer: "#4caf50",
                              controller: "#ff9800",
                              packer: "#9c27b0"
                            };
                            
                            // Formater la date et l'heure
                            const formattedDate = timestamp ? new Date(timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }) : null;
                            
                            return (
                              <ListItem key={role}>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: handler ? roleColor[role] : '#bdbdbd' }}>
                                    <PersonIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={`${statusMap[role]} par`}
                                  secondary={
                                    <>
                                      {handler 
                                        ? `${handler.full_name || handler.username} (${handler.role})` 
                                        : "Non traitée"}
                                      {formattedDate && (
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          {`Le ${formattedDate}`}
                                        </Typography>
                                      )}
                                    </>
                                  }
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Alert severity="info">
                          Cette commande PrestaShop n'a pas encore été traitée dans le système interne.
                        </Alert>
                      )
                    ) : null}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Fermer</Button>
                  </DialogActions>
                </Dialog>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default PrestaOrdersPage;
