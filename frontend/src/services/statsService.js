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
  getGeneralStats: async () => {
    try {
      console.log('URL dashboard:', `${API_BASE}/orders/dashboard/`);
      console.log('Headers:', getAuthHeaders());
      
      const response = await axios.get(`${API_BASE}/orders/dashboard/`, getAuthHeaders());
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
  getOrdersByStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders/dashboard/`, getAuthHeaders());
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
  getAgentPerformance: async () => {
    try {
      const response = await axios.get(`${API_BASE}/orders/dashboard/`, getAuthHeaders());
      const agentStats = response.data.agent_stats;
      const avgTimes = response.data.average_times;
      
      // Transformer les données pour correspondre au format attendu par le frontend
      return agentStats.map(agent => {
        // Calculer le temps moyen en fonction des commandes traitées
        const totalProcessed = agent.prepared_count + agent.controlled_count + agent.packed_count;
        
        // S'assurer que les valeurs de temps sont positives
        const prepTime = Math.abs(avgTimes.preparation || 0);
        const controlTime = Math.abs(avgTimes.control || 0);
        const packTime = Math.abs(avgTimes.packing || 0);
        
        // Calculer le temps moyen
        const avgTime = totalProcessed > 0 ? 
          Math.round((prepTime * agent.prepared_count + 
                     controlTime * agent.controlled_count + 
                     packTime * agent.packed_count) / totalProcessed) : 0;
        
        // Calculer une note basée sur le nombre de commandes traitées et le temps moyen
        const baseRating = 4.0;
        const performanceFactor = totalProcessed > 0 ? 
          Math.min(1, totalProcessed / 50) * 0.9 : 0;
        const timeFactor = avgTime > 0 ? 
          Math.max(0, 1 - (avgTime / 30)) * 0.1 : 0;
        const rating = baseRating + performanceFactor + timeFactor;
        
        return {
          name: agent.first_name && agent.last_name ? 
            `${agent.first_name} ${agent.last_name}` : agent.username,
          ordersProcessed: totalProcessed,
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
  getDailySales: async () => {
    try {
      // Récupérer toutes les commandes
      const response = await axios.get(`${API_BASE}/orders/`, getAuthHeaders());
      const orders = response.data;
      
      console.log('Récupération des commandes pour statistiques mensuelles:', orders.length);
      
      // Créer un objet pour stocker le nombre de commandes par mois
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlySales = monthNames.map(name => ({ name, sales: 0 }));
      
      // Compter les commandes par mois
      orders.forEach(order => {
        const date = new Date(order.created_at);
        const month = date.getMonth(); // 0 pour janvier, 11 pour décembre
        monthlySales[month].sales += 1;
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
  getCompletedTasks: async () => {
    try {
      // Récupérer toutes les commandes
      const response = await axios.get(`${API_BASE}/orders/`, getAuthHeaders());
      const allOrders = response.data;
      
      // Filtrer pour ne garder que les commandes emballées (PACKED)
      const packedOrders = allOrders.filter(order => order.status === 'PACKED');
      
      console.log('Récupération des commandes emballées pour statistiques:', packedOrders.length);
      
      // Créer un objet pour stocker le nombre de commandes emballées par mois
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const monthlyPacked = monthNames.map(name => ({ name, tasks: 0 }));
      
      // Compter les commandes emballées par mois
      packedOrders.forEach(order => {
        // Utiliser packed_at si disponible, sinon created_at
        const dateStr = order.packed_at || order.created_at;
        const date = new Date(dateStr);
        const month = date.getMonth(); // 0 pour janvier, 11 pour décembre
        monthlyPacked[month].tasks += 1;
      });
      
      console.log('Statistiques mensuelles des commandes emballées:', monthlyPacked);
      
      return monthlyPacked;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes emballées', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes récentes
  getRecentOrders: async () => {
    try {
      // Récupérer les commandes récentes
      const response = await axios.get(`${API_BASE}/orders/`, getAuthHeaders());
      
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
