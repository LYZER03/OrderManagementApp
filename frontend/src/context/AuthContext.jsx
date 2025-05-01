import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effet pour charger l'utilisateur depuis le localStorage au chargement de l'application
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier si le token est valide
        if (authService.isAuthenticated()) {
          try {
            // Essayer de rafraîchir le token pour s'assurer qu'il est valide
            await authService.refreshToken();
            const currentUser = authService.getCurrentUser();
            
            // Vérifier que l'utilisateur a un rôle valide
            if (currentUser && (currentUser.role === 'AGENT' || currentUser.role === 'SUPER_AGENT' || currentUser.role === 'MANAGER')) {
              setUser(currentUser);
            } else {
              console.warn('Utilisateur sans rôle valide, déconnexion');
              authService.logout();
              setUser(null);
            }
          } catch (refreshError) {
            console.error('Erreur lors du rafraîchissement du token:', refreshError);
            authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: authService.isAuthenticated,
    isManager: authService.isManager,
    isAgent: authService.isAgent,
    isSuperAgent: authService.isSuperAgent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
