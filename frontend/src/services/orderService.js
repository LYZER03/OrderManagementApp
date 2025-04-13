import axios from 'axios';
import authService from './authService';
import config from '../config/api';

// Utiliser l'URL API depuis la configuration centralisée
const API_BASE = config.API_URL;

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
  getOrdersToPrepare: async (creatorOnly = false) => {
    try {
      const url = creatorOnly
        ? `${API_BASE}/orders/preparation/?creator_only=true`
        : `${API_BASE}/orders/preparation/`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes à préparer', error);
      throw error;
    }
  },

  // Récupérer toutes les commandes à contrôler (statut PREPARED)
  getOrdersToControl: async () => {
    try {
      //const response = await axios.get(`${API_URL}/orders/control/`);
      const response = await axios.get(`${API_BASE}/orders/control/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes à contrôler', error);
      throw error;
    }
  },

  // Récupérer toutes les commandes à emballer (statut CONTROLLED)
  getOrdersToPack: async () => {
    try {
      //const response = await axios.get(`${API_URL}/orders/packing/`);
      const response = await axios.get(`${API_BASE}/orders/packing/`);
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

  // Récupérer les commandes avec pagination et filtrage
  getAllOrders: async (params = {}) => {
    try {
      // Paramètres par défaut
      const defaultParams = {
        page: 1,
        page_size: 20,
        ordering: '-created_at'
      };
      
      // Fusionner les paramètres par défaut avec ceux fournis
      const queryParams = { ...defaultParams, ...params };
      
      // Construire l'URL avec les paramètres de requête
      const queryString = Object.keys(queryParams)
        .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      
      const response = await axios.get(`${API_BASE}/orders/?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques', error);
      throw error;
    }
  },
  
  // Supprimer en masse les commandes selon les filtres actuels
  bulkDeleteOrders: async (filters = {}) => {
    try {
      // Construire l'URL avec les paramètres de filtrage
      const queryString = Object.keys(filters)
        .filter(key => filters[key] !== null && filters[key] !== undefined)
        .map(key => `${key}=${encodeURIComponent(filters[key])}`)
        .join('&');
      
      const url = queryString ? `${API_BASE}/orders/?${queryString}` : `${API_BASE}/orders/`;
      const response = await axios.delete(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression en masse des commandes', error);
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
