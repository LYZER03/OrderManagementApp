import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  useTheme,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import gfcLogo from '../assets/medium_fit_GFC_LOGO.jpg';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : 'http://192.168.1.16:8000/api';

const TableDesScoresPage = () => {
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fonction pour récupérer les données d'authentification
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Fonction pour récupérer tous les utilisateurs
  const fetchUsers = async () => {
    try {
      // Utiliser le service utilisateur existant qui a la bonne authentification et le bon endpoint
      const users = await userService.getAllUsers();
      console.log('Utilisateurs récupérés via service:', users);
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
      return [];
    }
  };

  // Fonction pour récupérer les commandes du jour
  const fetchTodaysOrders = async () => {
    try {
      // Ajouter les headers d'authentification
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE}/orders/?date=today`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('Commandes récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes', error);
      return [];
    }
  };

  // Calculer les statistiques par utilisateur
  const calculateUserStats = (users, orders) => {
    const stats = {};

    // Initialiser les stats pour chaque utilisateur
    users.forEach(user => {
      stats[user.id] = {
        prepared: 0,
        controlled: 0,
        packed: 0
      };
    });

    // Compter les commandes préparées, contrôlées et emballées par utilisateur
    orders.forEach(order => {
      if (order.preparer && order.prepared_at) {
        if (stats[order.preparer]) {
          stats[order.preparer].prepared++;
        }
      }
      
      if (order.controller && order.controlled_at) {
        if (stats[order.controller]) {
          stats[order.controller].controlled++;
        }
      }
      
      if (order.packer && order.packed_at) {
        if (stats[order.packer]) {
          stats[order.packer].packed++;
        }
      }
    });

    return stats;
  };

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, ordersData] = await Promise.all([
        fetchUsers(),
        fetchTodaysOrders()
      ]);
      
      // Afficher tous les utilisateurs pour le moment pour déboguer
      console.log('Utilisateurs récupérés:', usersData);
      
      // Filtrer pour n'afficher que les utilisateurs avec le role approprié
      const filteredUsers = usersData.filter(user => 
        user.role === 'AGENT' || user.role === 'PREPARER' || 
        user.role === 'CONTROLLER' || user.role === 'PACKER' ||
        // Temporairement inclure les managers pour tests
        user.role === 'MANAGER'
      );
      
      console.log('Utilisateurs après filtrage:', filteredUsers);
      
      setUsers(filteredUsers);
      setStats(calculateUserStats(filteredUsers, ordersData));
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger les données au chargement de la page
  useEffect(() => {
    loadData();
  }, []);

  // Rafraîchissement automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 10000);

    setRefreshInterval(interval);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      clearInterval(interval);
    };
  }, []);

  // Si l'utilisateur n'est pas authentifié, afficher un message d'erreur
  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h5" color="error" sx={{ mt: 4 }}>
          Vous devez être connecté pour accéder à cette page.
        </Typography>
      </Container>
    );
  }

  // Afficher un chargement pendant le chargement des données
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  // Calcul du score total pour chaque utilisateur et tri pour le classement
  const userScores = users
  .map(user => ({
    ...user,
    total: (stats[user.id]?.prepared || 0) + (stats[user.id]?.controlled || 0) + (stats[user.id]?.packed || 0),
    prepared: stats[user.id]?.prepared || 0,
    controlled: stats[user.id]?.controlled || 0,
    packed: stats[user.id]?.packed || 0
  }))
  .filter(user => user.prepared > 0 || user.controlled > 0 || user.packed > 0)
  .sort((a, b) => b.total - a.total);

  // Médailles pour le podium
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%', 
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowX: 'hidden'
    }}>
      <Box sx={{ width: '100%', maxWidth: 1400, mb: 1, mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, position: 'relative' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ position: 'absolute', left: 0 }}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <img src={gfcLogo} alt="Logo" style={{ height: '60px', marginRight: '16px' }} />

        </Box>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 1 }}>
          Commandes traitées aujourd'hui par agent
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
          Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
        </Typography>
      </Box>

      {userScores.length === 0 ? (
        <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun utilisateur trouvé. Veuillez vérifier les données.
          </Typography>
        </Paper>
      ) : null}

      <Grid container spacing={{ xs: 1, md: 2 }} justifyContent="center" alignItems="stretch" sx={{ width: '100%', maxWidth: 1400, mb: 3 }}>
        {userScores.map((user, idx) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={user.id} style={{ display: 'flex' }}>
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                minHeight: 160, // Réduit la hauteur minimale
                borderRadius: 2, // Réduit légèrement le rayon de bordure
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 1.5, // Réduit le padding
                position: 'relative',
                boxShadow: '0 1px 4px 0 #e0e0e0', // Ombre plus légère
                border: '1px solid #e0e0e0', // Bordure plus fine
                background: '#fff',
                mt: idx < 3 ? 0 : 0.5, // Espacement réduit
                flex: 1
              }}
            >
              {/* Nom et prénom */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
                {user.username}
              </Typography>
              {/* Score total */}
              <Typography variant="h3" sx={{ color: '#51158C', fontWeight: 800, mb: 0.5, mt: 0, textShadow: '0 1px 4px #e0e0e0' }}>
                {user.total}
              </Typography>
              {/* Détail par type avec badges */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27AE60', mr: 0.25 }} />
                  <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 700 }}>{user.prepared}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F39C12', mr: 0.25 }} />
                  <Typography variant="body2" sx={{ color: '#F39C12', fontWeight: 700 }}>{user.controlled}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#8E44AD', mr: 0.25 }} />
                  <Typography variant="body2" sx={{ color: '#8E44AD', fontWeight: 700 }}>{user.packed}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Légende compacte */}
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27AE60', mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600 }}>Préparé</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#F39C12', mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: '#F39C12', fontWeight: 600 }}>Contrôlé</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#8E44AD', mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: '#8E44AD', fontWeight: 600 }}>Emballé</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default TableDesScoresPage;
