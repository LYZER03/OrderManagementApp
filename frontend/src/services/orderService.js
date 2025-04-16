import axios from 'axios';
import authService from './authService';

//const API_URL = 'http://localhost:8000/api';
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : 'http://192.168.1.16:8000/api';

// Configuration de l'intercepteur pour ajouter le token JWT à chaque requête
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const orderService = {
  // Récupérer toutes les commandes à préparer (statut CREATED)
  getOrdersToPrepare: async (creatorOnly = false, date = 'today') => {
    try {
      let url = creatorOnly
        ? `${API_BASE}/orders/preparation/?creator_only=true&date=${date}`
        : `${API_BASE}/orders/preparation/?date=${date}`;
      
      console.log(`Récupération des commandes à préparer avec date=${date}`);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes à préparer', error);
      throw error;
    }
  },

  // Récupérer toutes les commandes à contrôler (statut PREPARED)
  getOrdersToControl: async (date = 'today') => {
    try {
      console.log(`Récupération des commandes à contrôler avec date=${date}`);
      const response = await axios.get(`${API_BASE}/orders/control/?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes à contrôler', error);
      throw error;
    }
  },

  // Récupérer toutes les commandes à emballer (statut CONTROLLED)
  getOrdersToPack: async (date = 'today') => {
    try {
      console.log(`Récupération des commandes à emballer avec date=${date}`);
      const response = await axios.get(`${API_BASE}/orders/packing/?date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes à emballer', error);
      throw error;
    }
  },

  // Récupérer une commande par sa référence
  getOrderByReference: async (reference) => {
    try {
      // Vérifier seulement que la référence n'est pas vide
      if (!reference || reference.trim() === '') {
        throw new Error("Veuillez entrer une référence de commande");
      }
      
      // Envoyer la référence exactement comme elle a été tapée (après trim)
      //const response = await axios.get(`${API_URL}/orders/reference/${reference}/`);
      const response = await axios.get(`${API_BASE}/orders/reference/${reference}/`);
      return response.data;
    } catch (error) {
      if (error.message && !error.response) {
        throw { message: error.message, isCustomError: true };
      }
      console.error(`Erreur lors de la récupération de la commande ${reference}`, error);
      throw error;
    }
  },

    // Créer une nouvelle commande
    createOrder: async (orderData) => {
      try {
        //const response = await axios.post(`${API_URL}/orders/`, orderData);
        const response = await axios.post(`${API_BASE}/orders/`, orderData);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de la commande', error);
        throw error;
      }
    },

  // Mettre à jour une commande (préparation)
  prepareOrder: async (orderId, data) => {
    try {
      //const response = await axios.post(`${API_URL}/orders/${orderId}/prepare/`, data);
      const response = await axios.post(`${API_BASE}/orders/${orderId}/prepare/`, data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la préparation de la commande ${orderId}`, error);
      throw error;
    }
  },

  // Mettre à jour une commande (contrôle)
  controlOrder: async (orderId) => {
    try {
      //const response = await axios.post(`${API_URL}/orders/${orderId}/control/`, {});
      const response = await axios.post(`${API_BASE}/orders/${orderId}/control/`, {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du contrôle de la commande ${orderId}`, error);
      throw error;
    }
  },

  // Mettre à jour une commande (emballage)
  packOrder: async (orderId) => {
    try {
      //const response = await axios.post(`${API_URL}/orders/${orderId}/pack/`, {});
      const response = await axios.post(`${API_BASE}/orders/${orderId}/pack/`, {});
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'emballage de la commande ${orderId}`, error);
      throw error;
    }
  },

  updateOrder: async (orderId, orderData) => {
    try {
      const response = await axios.put(`${API_BASE}/orders/${orderId}/`, orderData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la commande ${orderId}`, error);
      throw error;
    }
  },

  // Récupérer toutes les commandes (pour les managers)
  getAllOrders: async (dateParam = 'today', creatorId = null) => {
    try {
      // Construire l'URL en fonction des paramètres
      let url = `${API_BASE}/orders/`;
      let params = [];
      
      // Vérifier si le paramètre est une chaîne simple (today, all) ou une plage de dates
      if (dateParam.includes('start_date') || dateParam.includes('end_date')) {
        // C'est une plage de dates, ajouter les paramètres tels quels
        params.push(dateParam);
      } else if (dateParam === 'all') {
        // Spécifier explicitement 'all' pour s'assurer que le backend ne filtre pas par date
        params.push(`date=all`);
        console.log('Paramètre "all" ajouté explicitement à l\'URL');
      } else {
        // C'est une date simple (today ou une date spécifique)
        params.push(`date=${dateParam}`);
      }
      
      // Ajouter le filtre par créateur si spécifié
      if (creatorId) {
        params.push(`creator_id=${creatorId}`);
      }
      
      // Construire l'URL finale avec les paramètres
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      console.log(`Récupération des commandes avec URL: ${url}`);
      const response = await axios.get(url);
      console.log(`Nombre de commandes reçues: ${response.data.length}`);
      
      // Vérifier les dates des commandes reçues (pour débogage)
      const dates = {};
      response.data.forEach(order => {
        if (order.created_at) {
          const date = new Date(order.created_at).toLocaleDateString();
          dates[date] = (dates[date] || 0) + 1;
        }
      });
      console.log('Répartition des commandes par date:', dates);
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes', error);
      throw error;
    }
  },

  // Supprimer une ou plusieurs commandes
  deleteOrders: async (orderIds) => {
    try {
      const response = await axios.post(`${API_BASE}/orders/delete/`, { order_ids: orderIds });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression des commandes', error);
      throw error;
    }
  }
};

export default orderService;
