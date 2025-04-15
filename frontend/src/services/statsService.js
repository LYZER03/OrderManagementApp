import axios from 'axios';
import authService from './authService';

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : 'http://192.168.1.16:8000/api';

// Configuration des headers pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

const statsService = {
  // Récupérer les statistiques générales
  getGeneralStats: async (date = 'today') => {
    try {
      console.log('URL dashboard:', `${API_BASE}/orders/dashboard/?date=${date}`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      console.log('Réponse dashboard:', response.data);
      
      const data = response.data;
      
      // Transformer les données pour correspondre au format attendu par le frontend
      return {
        totalOrders: data.order_counts.total,
        ordersInProgress: data.order_counts.in_progress,
        completedOrders: data.order_counts.completed,
        growthRate: 12, // À calculer ultérieurement avec des données historiques
        growthPercentage: {
          totalOrders: 8,  // À calculer ultérieurement avec des données historiques
          ordersInProgress: 3,  // À calculer ultérieurement avec des données historiques
          completedOrders: 15  // À calculer ultérieurement avec des données historiques
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques générales', error);
      throw error;
    }
  },

  // Récupérer les statistiques par statut de commande
  getOrdersByStatus: async (date = 'today') => {
    try {
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      const data = response.data;
      
      // Calculer le nombre de commandes par statut
      const total = data.order_counts.total;
      const completed = data.order_counts.completed;
      const inProgress = data.order_counts.in_progress;
      
      // Estimation des commandes par statut (à améliorer avec des endpoints spécifiques)
      const created = Math.round(inProgress * 0.4);
      const prepared = Math.round(inProgress * 0.35);
      const controlled = Math.round(inProgress * 0.25);
      
      return [
        { name: 'Créées', value: created },
        { name: 'Préparées', value: prepared },
        { name: 'Contrôlées', value: controlled },
        { name: 'Emballées', value: completed }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par statut', error);
      throw error;
    }
  },

  // Récupérer les statistiques de temps de traitement par étape
  getProcessingTimeByStep: async () => {
    try {
      // Cette fonction sera implémentée côté backend ultérieurement
      // Pour l'instant, nous retournons des données fictives cohérentes avec notre application
      return [
        { name: 'Jan', preparation: 18, control: 12, packing: 8 },
        { name: 'Fév', preparation: 20, control: 14, packing: 9 },
        { name: 'Mar', preparation: 17, control: 11, packing: 7 },
        { name: 'Avr', preparation: 19, control: 13, packing: 8 },
        { name: 'Mai', preparation: 22, control: 15, packing: 10 },
        { name: 'Juin', preparation: 21, control: 14, packing: 9 },
        { name: 'Juil', preparation: 24, control: 16, packing: 11 },
        { name: 'Août', preparation: 23, control: 15, packing: 10 },
        { name: 'Sep', preparation: 25, control: 17, packing: 12 },
        { name: 'Oct', preparation: 22, control: 15, packing: 10 },
        { name: 'Nov', preparation: 26, control: 18, packing: 13 },
        { name: 'Déc', preparation: 24, control: 16, packing: 11 }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des temps de traitement', error);
      throw error;
    }
  },

  // Récupérer les statistiques de performance des agents
  getAgentPerformance: async (date = 'today') => {
    try {
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      const data = response.data;
      
      // Transformer les données des agents pour correspondre au format attendu par le frontend
      return data.agent_stats.map(agent => {
        // Calculer le nombre total de commandes traitées
        const totalProcessed = agent.created_count + agent.prepared_count + 
                              agent.controlled_count + agent.packed_count;
        
        // Calculer le temps moyen (fictif pour l'instant)
        const avgTime = Math.round(15 + (Math.random() * 10));
        
        // Calculer une évaluation basée sur les performances
        // Base: 3.5 étoiles
        const baseRating = 3.5;
        
        // Facteur de performance: +/- 1 étoile basé sur le nombre de commandes traitées
        // Plus l'agent traite de commandes, meilleure est son évaluation
        const performanceFactor = totalProcessed > 0 ? 
          Math.min(1, totalProcessed / 50) : 0;
        
        // Facteur de temps: +/- 0.5 étoile basé sur le temps moyen
        // Plus le temps est court, meilleure est l'évaluation
        const timeFactor = avgTime > 0 ? 
          Math.max(0, 1 - (avgTime / 30)) * 0.1 : 0;
        
        const rating = baseRating + performanceFactor + timeFactor;
        
        return {
          name: agent.first_name && agent.last_name ? 
            `${agent.first_name} ${agent.last_name}` : agent.username,
          ordersProcessed: totalProcessed,
          averageTime: avgTime,
          averageTime: Math.max(0, avgTime), // S'assurer que le temps est toujours positif
          rating: Math.min(5, Math.round(rating * 10) / 10)
        };
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des agents', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes mensuelles
  getDailySales: async (date = 'today') => {
    try {
      // Récupérer les commandes du jour ou d'une date spécifique
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      const data = response.data;
      
      // Utiliser les données du dashboard pour créer des statistiques mensuelles
      // Comme nous filtrons par jour, nous allons simuler des données mensuelles
      // basées sur les données du jour
      
      // Créer un objet pour stocker le nombre de commandes par mois
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      // Générer des données pour les 12 derniers mois basées sur les données du jour
      const monthlySales = monthNames.map((name, index) => {
        // Utiliser les données du jour pour le mois actuel
        if (index === currentMonth) {
          return { name, sales: data.order_counts.total || 0 };
        }
        
        // Pour les autres mois, générer des données basées sur le mois actuel
        // avec une variation aléatoire pour simuler des tendances
        const baseSales = data.order_counts.total || 10;
        const monthFactor = 0.7 + (Math.random() * 0.6); // Entre 0.7 et 1.3
        return { name, sales: Math.round(baseSales * monthFactor) };
      });
      
      console.log('Statistiques mensuelles calculées:', monthlySales);
      
      return monthlySales;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes mensuelles', error);
      throw error;
    }
  },

  // Récupérer les statistiques de visites du site
  getWebsiteViews: async () => {
    try {
      // Cette fonction sera implémentée côté backend ultérieurement
      // Pour l'instant, nous retournons des données fictives
      return [
        { name: 'Lun', views: 25 },
        { name: 'Mar', views: 35 },
        { name: 'Mer', views: 15 },
        { name: 'Jeu', views: 40 },
        { name: 'Ven', views: 30 },
        { name: 'Sam', views: 10 },
        { name: 'Dim', views: 5 }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des visites du site', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes complétées (emballées)
  getCompletedTasks: async (date = 'today') => {
    try {
      // Récupérer les commandes du jour ou d'une date spécifique
      const response = await axios.get(`${API_BASE}/orders/dashboard/?date=${date}`, getAuthHeaders());
      const data = response.data;
      
      // Utiliser les données du dashboard pour créer des statistiques mensuelles
      // Comme nous filtrons par jour, nous allons simuler des données mensuelles
      // basées sur les données du jour
      
      // Créer un objet pour stocker le nombre de commandes emballées par mois
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      // Générer des données pour les 12 derniers mois basées sur les données du jour
      const monthlyPacked = monthNames.map((name, index) => {
        // Utiliser les données du jour pour le mois actuel
        if (index === currentMonth) {
          return { name, tasks: data.order_counts.completed || 0 };
        }
        
        // Pour les autres mois, générer des données basées sur le mois actuel
        // avec une variation aléatoire pour simuler des tendances
        const baseTasks = data.order_counts.completed || 5;
        const monthFactor = 0.6 + (Math.random() * 0.8); // Entre 0.6 et 1.4
        return { name, tasks: Math.round(baseTasks * monthFactor) };
      });
      
      console.log('Statistiques mensuelles des commandes emballées:', monthlyPacked);
      
      return monthlyPacked;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes emballées', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes récentes
  getRecentOrders: async (date = 'today') => {
    try {
      // Récupérer les commandes récentes du jour ou d'une date spécifique
      const response = await axios.get(`${API_BASE}/orders/?date=${date}`, getAuthHeaders());
      
      // Ajouter des logs pour déboguer
      console.log('Réponse des commandes récentes:', response.data);
      
      // Trier par date de création (les plus récentes d'abord) et prendre les 7 premières
      const recentOrders = response.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 7)
        .map(order => {
          // Récupérer les détails du créateur de la commande
          const creatorDetails = order.creator_details || {};
          
          // Construire le nom complet de l'agent
          let agentName = 'Agent';
          if (creatorDetails.first_name && creatorDetails.last_name) {
            agentName = `${creatorDetails.first_name} ${creatorDetails.last_name}`;
          } else if (creatorDetails.username) {
            agentName = creatorDetails.username;
          }
          
          return {
            id: order.id,
            reference: order.reference,
            status: order.status,
            timestamp: order.created_at,
            agent: agentName
          };
        });
      
      console.log('Commandes récentes formatées:', recentOrders);
      
      return recentOrders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes récentes', error);
      throw error;
    }
  }
};

export default statsService;
