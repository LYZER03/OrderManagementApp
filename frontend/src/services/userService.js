import axios from 'axios';

//const API_URL = 'http://localhost:8000/api';http://192.168.3.207:8000

const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api' 
  : 'http://192.168.1.16:8000/api';

const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/users/`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${userId}`, error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/users/`, userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur existant
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`${API_BASE}/auth/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${userId}`, error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`${API_BASE}/auth/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${userId}`, error);
      throw error;
    }
  },

  // Changer le rôle d'un utilisateur
  changeUserRole: async (userId, role) => {
    try {
      const response = await axios.patch(`${API_BASE}/auth/users/${userId}/role/`, { role });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de rôle de l'utilisateur ${userId}`, error);
      throw error;
    }
  },

  // Réinitialiser le mot de passe d'un utilisateur
  resetPassword: async (userId, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/users/${userId}/reset-password/`, { password: newPassword });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réinitialisation du mot de passe de l'utilisateur ${userId}`, error);
      throw error;
    }
  },
  
  // Récupérer tous les agents
  getAllAgents: async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/users/?role=AGENT`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des agents', error);
      throw error;
    }
  }
};

export default userService;
