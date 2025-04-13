import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Typography,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const UsersDataTable = ({ 
  users, 
  loading, 
  error, 
  onEdit,
  onDelete,
  onAddUser
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Effet pour mettre à jour les utilisateurs filtrés lorsque les utilisateurs ou la recherche changent
  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredUsers(filtered);
    // Réinitialiser la page à 0 lorsque les filtres changent
    setPage(0);
  }, [users, searchQuery]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteError('');
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await onDelete(userToDelete.id);
      handleCloseDeleteDialog();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Une erreur est survenue lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Éviter un layout jump quand la page change
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

  // Fonction pour obtenir le rôle formaté
  const getRoleChip = (role) => {
    let color = 'default';
    
    switch (role) {
      case 'AGENT':
        color = 'primary';
        break;
      case 'MANAGER':
        color = 'secondary';
        break;
      default:
        break;
    }
    
    return (
      <Chip 
        label={role === 'AGENT' ? 'Agent' : 'Manager'} 
        color={color} 
        size="small" 
        sx={{ fontWeight: 600 }} 
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erreur lors du chargement des utilisateurs: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Rechercher un utilisateur..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: { xs: '100%', sm: '300px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={onAddUser}
        >
          Ajouter
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        {filteredUsers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
              Aucun utilisateur trouvé.
            </Alert>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                sx={{ minWidth: 750 }}
                aria-labelledby="tableTitle"
                size="medium"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Nom d'utilisateur</TableCell>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prénom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow
                        hover
                        tabIndex={-1}
                        key={user.id}
                      >
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight={600}>
                            {user.username}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.last_name}</TableCell>
                        <TableCell>{user.first_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleChip(user.role)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Modifier">
                              <IconButton
                                onClick={() => onEdit(user)}
                                size="small"
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                onClick={() => handleOpenDeleteDialog(user)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'utilisateur {userToDelete?.username} ? Cette action est irréversible.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersDataTable;
