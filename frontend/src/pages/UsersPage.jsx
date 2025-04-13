import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Divider, Alert, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import UsersDataTable from '../components/users/UsersDataTable';
import UserForm from '../components/users/UserForm';
import userService from '../services/userService';

const UsersPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Rediriger si l'utilisateur n'est pas un manager
  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/" replace />;
  }

  // Charger tous les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs', err);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Gérer l'ouverture du formulaire d'ajout d'utilisateur
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormError('');
    setUserFormOpen(true);
  };

  // Gérer l'ouverture du formulaire de modification d'utilisateur
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormError('');
    setUserFormOpen(true);
  };

  // Gérer la fermeture du formulaire
  const handleCloseUserForm = () => {
    setUserFormOpen(false);
    setSelectedUser(null);
    setFormError('');
  };

  // Gérer la soumission du formulaire (création ou modification)
  const handleSubmitUserForm = async (userData) => {
    setFormLoading(true);
    setFormError('');
    
    try {
      if (selectedUser) {
        // Mode édition
        const updatedUser = await userService.updateUser(selectedUser.id, userData);
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setSuccessMessage('Utilisateur modifié avec succès');
      } else {
        // Mode création
        const newUser = await userService.createUser(userData);
        setUsers([...users, newUser]);
        setSuccessMessage('Utilisateur créé avec succès');
      }
      
      handleCloseUserForm();
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur', err);
      setFormError(err.response?.data?.error || 'Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setFormLoading(false);
    }
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId) => {
    try {
      await userService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMessage('Utilisateur supprimé avec succès');
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur', err);
      throw err;
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: isMobile ? 2 : 4, 
        mb: isMobile ? 2 : 4, 
        px: isMobile ? 1 : 3,
        width: '100%'
      }}
    >
      <Paper 
        sx={{ 
          p: isMobile ? 2 : 3,
          width: '100%',
          maxWidth: '100%',
          mt: isMobile ? 2 : 0,
          bgcolor: '#ffffff',
          boxShadow: 'none'
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Gestion des utilisateurs
        </Typography>
        {!isMobile && (
          <Typography variant="body1" paragraph>
            Cette page permet de gérer les comptes utilisateurs du système.
          </Typography>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <UsersDataTable 
          users={users}
          loading={loading}
          error={error}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAddUser={handleAddUser}
        />
        
        <UserForm 
          open={userFormOpen}
          onClose={handleCloseUserForm}
          onSubmit={handleSubmitUserForm}
          user={selectedUser}
          loading={formLoading}
          error={formError}
        />
      </Paper>
    </Container>
  );
};

export default UsersPage;
