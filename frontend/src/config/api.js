/**
 * Configuration centralisée des API pour l'application
 * Ce fichier permet de définir les URLs de base pour toutes les requêtes API
 */

// Détection automatique de l'environnement
const hostname = window.location.hostname;

// Configuration des URLs de base
const config = {
  // URL de base pour l'API backend
  API_URL: hostname === 'localhost' 
    ? 'http://localhost:8000/api' 
    : `http://${hostname}:8000/api`,
  
  // URL de base pour l'authentification
  AUTH_URL: hostname === 'localhost'
    ? 'http://localhost:8000/api/auth'
    : `http://${hostname}:8000/api/auth`,
  
  // Version de l'API
  API_VERSION: 'v1',
  
  // Timeout des requêtes en millisecondes
  TIMEOUT: 30000,
};

export default config;
