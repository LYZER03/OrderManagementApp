import axios from 'axios';

//const API_URL = 'http://localhost:8000/api/auth/';
//const API_URL = 'http://192.168.3.207:8000/api/auth/';
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api/auth/' 
  : 'http://192.168.1.16:8000/api/auth/';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
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

// Service d'authentification
const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await api.post('register/', userData);
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Connexion d'un utilisateur
  login: async (username, password) => {
    try {
      const response = await api.post('login/', { username, password });
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion d'un utilisateur
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Récupération des informations de l'utilisateur connecté
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      // Vérifier que les données utilisateur sont valides
      const parsedUser = JSON.parse(user);
      if (!parsedUser || !parsedUser.id || !parsedUser.role) {
        console.warn('Données utilisateur invalides dans le localStorage');
        // Si les données sont invalides, on nettoie le localStorage
        authService.logout();
        return null;
      }
      
      return parsedUser;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      // En cas d'erreur, on nettoie le localStorage
      authService.logout();
      return null;
    }
  },

  // Vérification si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Vérification si l'utilisateur est un manager
  isManager: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'MANAGER';
  },
  
  // Vérification si l'utilisateur est un agent
  isAgent: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'AGENT';
  },
  
  // Vérification si l'utilisateur est un super agent
  isSuperAgent: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'SUPER_AGENT';
  },

  // Rafraîchissement du token d'accès
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }
      
      const response = await api.post('token/refresh/', {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
      }
      
      return response.data;
    } catch (error) {
      authService.logout();
      throw error;
    }
  }
};

export default authService;
