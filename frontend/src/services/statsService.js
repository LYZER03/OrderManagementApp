import axios from 'axios';
import authService from './authService';
import config from '../config/api';

// Utiliser l'URL API depuis la configuration centralisée
const API_BASE = config.API_URL;

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
        // Utiliser les données de croissance réelles calculées par le backend
        growthRate: data.growth.monthly.total_orders, // Taux de croissance mensuel pour les commandes totales
        growthPercentage: {
          totalOrders: data.growth.weekly.total_orders,      // Croissance hebdomadaire
          ordersInProgress: data.growth.weekly.in_progress_orders,  // Croissance hebdomadaire
          completedOrders: data.growth.weekly.completed_orders      // Croissance hebdomadaire
        },
        // Ajouter les données de croissance par période
        growthDaily: data.growth.daily,
        growthWeekly: data.growth.weekly,
        growthMonthly: data.growth.monthly
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
      // Utiliser l'endpoint dashboard qui est déjà optimisé
      const response = await axios.get(`${API_BASE}/orders/dashboard/`, getAuthHeaders());
      const data = response.data;
      
      // Si le backend fournit déjà des données mensuelles, les utiliser
      if (data.monthly_orders) {
        return data.monthly_orders;
      }
      
      // Sinon, créer des données mensuelles à partir des données du dashboard
      // Cette approche est beaucoup plus rapide que de charger toutes les commandes
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      // Distribution approximative basée sur le nombre total de commandes
      const totalOrders = data.order_counts.total;
      const monthlySales = monthNames.map((name, index) => {
        // Distribution avec une tendance croissante et un pic au mois actuel
        let factor = 0.5 + (index / 12) + (index === currentMonth ? 0.2 : 0);
        // Ajuster pour que la somme soit approximativement égale au total
        const sales = Math.round(totalOrders / 18 * factor);
        return { name, sales };
      });
      
      console.log('Statistiques mensuelles estimées:', monthlySales);
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
      // Utiliser l'endpoint dashboard qui est déjà optimisé
      const response = await axios.get(`${API_BASE}/orders/dashboard/`, getAuthHeaders());
      const data = response.data;
      
      // Si le backend fournit déjà des données mensuelles pour les commandes emballées, les utiliser
      if (data.monthly_packed) {
        return data.monthly_packed;
      }
      
      // Sinon, créer des données mensuelles à partir des données du dashboard
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      const currentMonth = new Date().getMonth();
      
      // Distribution approximative basée sur le nombre de commandes complétées
      const completedOrders = data.order_counts.completed;
      const monthlyPacked = monthNames.map((name, index) => {
        // Distribution avec une tendance croissante et un pic au mois actuel
        let factor = 0.4 + (index / 12) + (index === currentMonth ? 0.3 : 0);
        // Ajuster pour que la somme soit approximativement égale au total des commandes complétées
        const tasks = Math.round(completedOrders / 15 * factor);
        return { name, tasks };
      });
      
      console.log('Statistiques mensuelles des commandes emballées estimées:', monthlyPacked);
      return monthlyPacked;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes emballées', error);
      throw error;
    }
  },

  // Récupérer les statistiques de commandes récentes
  getRecentOrders: async () => {
    try {
      // Utiliser un paramètre de requête pour limiter le nombre de résultats
      // et demander un tri par date de création décroissante
      const response = await axios.get(
        `${API_BASE}/orders/?limit=7&ordering=-created_at`, 
        getAuthHeaders()
      );
      
      // Vérifier si nous avons des résultats
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.log('Aucune commande récente trouvée');
        return [];
      }
      
      // Formater les commandes récentes
      const recentOrders = response.data.map(order => {
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
