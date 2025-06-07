import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  useTheme,
  IconButton,
  Fade,
  Grow,
  Chip,
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { keyframes } from '@mui/system';
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
  const [refreshing, setRefreshing] = useState(false);
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
  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
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
      
      // Attendre un peu pour une transition plus fluide lors du rafraîchissement
      if (isRefresh) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setUsers(filteredUsers);
      setStats(calculateUserStats(filteredUsers, ordersData));
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Effet pour charger les données au chargement de la page
  useEffect(() => {
    loadData();
  }, []);

  // Rafraîchissement automatique toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true); // Indiquer que c'est un rafraîchissement
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

  // Animation keyframes
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  `;

  const shimmerAnimation = keyframes`
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  `;

  const floatAnimation = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  `;

  const refreshPulseAnimation = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  `;

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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowX: 'hidden'
    }}>
      <Fade in={true} timeout={1000}>
        <Box sx={{ 
          width: '100%', 
          maxWidth: 1400, 
          mb: 3, 
          mt: 12, 
          px: 2,
          animation: refreshing ? `${refreshPulseAnimation} 2s ease-in-out infinite` : 'none',
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
            <IconButton 
              onClick={() => navigate(-1)} 
              sx={{ 
                position: 'absolute', 
                left: 16,
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBackIcon fontSize="large" />
            </IconButton>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 3,
              p: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <img src={gfcLogo} alt="Logo" style={{ height: '60px', marginRight: '16px' }} />
              <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 40, mr: 1 }} />
            </Box>
          </Box>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 1,
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Tableau des Scores
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 1,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500
            }}
          >
            Commandes traitées aujourd'hui par agent
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
            <Chip
              icon={refreshing ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <TrendingUpIcon />}
              label={refreshing ? 'Mise à jour en cours...' : `Dernière mise à jour : ${new Date().toLocaleTimeString('fr-FR')}`}
              sx={{
                backgroundColor: refreshing ? 'rgba(255,235,59,0.3)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
            />
          </Box>
        </Box>
      </Fade>

      {userScores.length === 0 ? (
        <Fade in={true} timeout={1500}>
          <Paper sx={{ 
            p: 4, 
            mb: 2, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" color="text.secondary">
              Aucun utilisateur trouvé. Veuillez vérifier les données.
            </Typography>
          </Paper>
        </Fade>
      ) : null}

      <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center" alignItems="stretch" sx={{ width: '100%', maxWidth: 1400, mb: 4, px: 2 }}>
        {userScores.map((user, idx) => {
          const isTopThree = idx < 3;
          const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
          const rankIcons = ['🥇', '🥈', '🥉'];
          
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={user.id} style={{ display: 'flex' }}>
              <Grow in={!refreshing} timeout={refreshing ? 300 : 1000 + idx * 200}>
                <Paper
                  elevation={isTopThree ? 8 : 4}
                  sx={{
                    width: '100%',
                    minHeight: 200,
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    position: 'relative',
                    background: isTopThree 
                      ? `linear-gradient(135deg, ${rankColors[idx]} 0%, rgba(255,255,255,0.9) 100%)`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.95) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: isTopThree ? `3px solid ${rankColors[idx]}` : '1px solid rgba(255,255,255,0.3)',
                    boxShadow: isTopThree 
                      ? `0 12px 40px rgba(0,0,0,0.15), 0 0 20px ${rankColors[idx]}40`
                      : '0 8px 32px rgba(0,0,0,0.1)',
                    flex: 1,
                    transform: isTopThree ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    animation: isTopThree ? `${floatAnimation} 3s ease-in-out infinite` : 'none',
                    '&:hover': {
                      transform: isTopThree ? 'scale(1.08)' : 'scale(1.03)',
                      boxShadow: isTopThree 
                        ? `0 16px 50px rgba(0,0,0,0.2), 0 0 30px ${rankColors[idx]}60`
                        : '0 12px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {/* Badge de rang pour le top 3 */}
                  {isTopThree && (
                    <Box sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: rankColors[idx],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      animation: `${pulseAnimation} 2s ease-in-out infinite`
                    }}>
                      {rankIcons[idx]}
                    </Box>
                  )}
                  
                  {/* Avatar avec initiales */}
                  <Avatar sx={{
                    width: 50,
                    height: 50,
                    mb: 1,
                    backgroundColor: isTopThree ? rankColors[idx] : '#667eea',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  
                  {/* Nom d'utilisateur */}
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center', 
                    mb: 1,
                    color: isTopThree ? '#333' : '#555',
                    textShadow: isTopThree ? '1px 1px 2px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    {user.username}
                  </Typography>
                  
                  {/* Score total avec effet shimmer */}
                  <Box sx={{
                    position: 'relative',
                    mb: 1.5
                  }}>
                    <Typography variant="h2" sx={{ 
                      color: isTopThree ? '#333' : '#667eea', 
                      fontWeight: 900, 
                      textAlign: 'center',
                      textShadow: isTopThree ? '2px 2px 4px rgba(0,0,0,0.2)' : '1px 1px 2px rgba(0,0,0,0.1)',
                      background: isTopThree 
                        ? `linear-gradient(90deg, ${rankColors[idx]}, #333, ${rankColors[idx]})`
                        : 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                      backgroundSize: '200px 100%',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${shimmerAnimation} 3s ease-in-out infinite`
                    }}>
                      {user.total}
                    </Typography>
                  </Box>
                  
                  {/* Statistiques détaillées avec design amélioré */}
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label={user.prepared}
                      sx={{
                        backgroundColor: '#27AE60',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 35,
                        '&:before': {
                          content: '"📦"',
                          marginRight: '4px'
                        }
                      }}
                    />
                    <Chip
                      size="small"
                      label={user.controlled}
                      sx={{
                        backgroundColor: '#F39C12',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 35,
                        '&:before': {
                          content: '"✅"',
                          marginRight: '4px'
                        }
                      }}
                    />
                    <Chip
                      size="small"
                      label={user.packed}
                      sx={{
                        backgroundColor: '#8E44AD',
                        color: 'white',
                        fontWeight: 700,
                        minWidth: 35,
                        '&:before': {
                          content: '"📮"',
                          marginRight: '4px'
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grow>
            </Grid>
          );
        })}
      </Grid>

      {/* Légende améliorée */}
      <Fade in={!refreshing} timeout={refreshing ? 300 : 2000}>
        <Paper sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, color: '#333', fontWeight: 600 }}>
            Légende des Actions
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<span>📦</span>}
                label="Préparé"
                sx={{
                  backgroundColor: '#27AE60',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#229954' }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<span>✅</span>}
                label="Contrôlé"
                sx={{
                  backgroundColor: '#F39C12',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#E67E22' }
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<span>📮</span>}
                label="Emballé"
                sx={{
                  backgroundColor: '#8E44AD',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#7D3C98' }
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default TableDesScoresPage;
