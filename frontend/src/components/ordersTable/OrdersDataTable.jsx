import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
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
  Checkbox,
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
  useTheme,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from 'date-fns/locale';
import { format, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import OrderDetailsDialog from './OrderDetailsDialog';

const OrdersDataTable = ({ 
  orders, 
  loading, 
  error, 
  pagination,
  filters,
  onDeleteOrders,
  onPageChange,
  onPageSizeChange,
  onFilterChange
}) => {
  const theme = useTheme();
  // Utiliser les valeurs de pagination fournies par le parent
  const { page, pageSize, totalCount, totalPages } = pagination || { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 };
  const [selected, setSelected] = useState([]);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [openBulkDeleteDialog, setOpenBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState(false);
  const [bulkDeleteCount, setBulkDeleteCount] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  // Calculer le nombre de lignes vides à afficher pour maintenir une hauteur constante
  const emptyRows = page > 0 ? Math.max(0, (pageSize - (orders ? orders.length : 0))) : 0;
  
  // Liste des statuts possibles pour le filtrage
  const statusOptions = [
    { value: 'CREATED', label: 'Créée', color: 'primary' },
    { value: 'PREPARED', label: 'Préparée', color: 'success' },
    { value: 'CONTROLLED', label: 'Contrôlée', color: 'warning' },
    { value: 'PACKED', label: 'Emballée', color: 'secondary' }
  ];

  // Appliquer les filtres côté serveur au lieu de côté client
  const handleApplyFilters = () => {
    // Envoyer les filtres au composant parent
    onFilterChange({
      status: selectedStatus,
      startDate: startDate,
      endDate: endDate,
      ordering: filters.ordering
    });
  };
  
  // Fonction pour filtrer les commandes par référence
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Si la recherche est vide, ne pas filtrer localement
    if (!query.trim()) {
      setFilteredOrders(orders);
      return;
    }
    
    // Filtrer localement les commandes affichées actuellement
    const filtered = orders.filter(order => 
      order.reference.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredOrders(filtered);
  };
  
  // Réinitialiser la recherche
  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredOrders(orders);
  };

  const handleChangePage = (event, newPage) => {
    // Appeler la fonction du parent pour changer de page (1-indexed)
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    // Appeler la fonction du parent pour changer la taille de page
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      // Utiliser les commandes actuellement affichées sur la page
      const newSelected = orders.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedOrder(null);
  };

  const handleOpenDeleteDialog = () => {
    if (selected.length === 0) return;
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteError('');
    setDeleteSuccess(false);
  };
  
  const handleOpenBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(true);
    // Estimer le nombre de commandes qui seront supprimées
    setBulkDeleteCount(totalCount);
  };
  
  const handleCloseBulkDeleteDialog = () => {
    setOpenBulkDeleteDialog(false);
    setBulkDeleteError('');
    setBulkDeleteSuccess(false);
  };

  const handleDeleteSelected = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    setDeleteSuccess(false);
    
    try {
      const success = await onDeleteOrders(selected);
      
      if (success) {
        setDeleteSuccess(true);
        setSelected([]);
        
        // Fermer automatiquement après 1.5 secondes
        setTimeout(() => {
          handleCloseDeleteDialog();
        }, 1500);
      }
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Une erreur est survenue lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    setBulkDeleteError('');
    setBulkDeleteSuccess(false);
    
    try {
      // Utiliser les filtres actuels pour la suppression en masse
      const currentFilters = {};
      
      // Ajouter le statut s'il est sélectionné
      if (selectedStatus) {
        currentFilters.status = selectedStatus;
      } else if (filters.status) {
        currentFilters.status = filters.status;
      }
      
      // Ajouter les dates s'il y en a
      if (startDate) {
        // Formater la date correctement pour l'API
        currentFilters.start_date = startDate.toISOString();
      } else if (filters.startDate) {
        currentFilters.start_date = filters.startDate;
      }
      
      if (endDate) {
        // Formater la date correctement pour l'API
        currentFilters.end_date = endDate.toISOString();
      } else if (filters.endDate) {
        currentFilters.end_date = filters.endDate;
      }
      
      console.log('Filtres pour la suppression en masse:', currentFilters);
      
      // Appeler le service pour supprimer en masse
      const response = await orderService.bulkDeleteOrders(currentFilters);
      
      if (response) {
        // Mettre à jour le compteur de suppression
        setBulkDeleteCount(response.count || 0);
        setBulkDeleteSuccess(true);
        setSelected([]);
        
        // Fermer automatiquement après 1.5 secondes et rafraîchir les données
        setTimeout(() => {
          handleCloseBulkDeleteDialog();
          // Rafraîchir les données en appelant onPageChange avec la page actuelle
          onPageChange(page);
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression en masse:', err);
      setBulkDeleteError(err.response?.data?.error || 'Une erreur est survenue lors de la suppression en masse');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus(null);
    
    // Appliquer immédiatement la réinitialisation des filtres
    onFilterChange({
      status: '',
      startDate: null,
      endDate: null,
      ordering: '-created_at'
    });
  };
  
  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    // Ne pas appliquer immédiatement, attendre que l'utilisateur clique sur "Appliquer"
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Cette variable est déjà déclarée plus haut dans le code

  // Fonction pour obtenir le statut formaté
  const getStatusChip = (status) => {
    let color = 'default';
    let label = 'Inconnu';
    
    switch (status) {
      case 'CREATED':
        color = 'primary';
        label = 'Créée';
        break;
      case 'PREPARED':
        color = 'success';
        label = 'Préparée';
        break;
      case 'CONTROLLED':
        color = 'warning';
        label = 'Contrôlée';
        break;
      case 'PACKED':
        color = 'secondary';
        label = 'Emballée';
        break;
      case 'COMPLETED':
        color = 'secondary';
        label = 'Terminée';
        break;
      default:
        break;
    }
    
    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        sx={{ fontWeight: 600 }} 
      />
    );
  };

  // Initialiser filteredOrders avec orders quand orders change
  useEffect(() => {
    setFilteredOrders(orders || []);
  }, [orders]);

  // Préparer le contenu conditionnel en fonction de l'état de chargement et des erreurs
  const renderContent = () => {
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
          Erreur lors du chargement des commandes: {error}
        </Alert>
      );
    }

    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            id="search-reference"
            placeholder="Rechercher par référence..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', sm: '300px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleToggleFilter}
              size="small"
            >
              Filtres
            </Button>
            {selected.length > 0 ? (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleOpenDeleteDialog}
                size="small"
              >
                Supprimer ({selected.length})
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteSweepIcon />}
                onClick={handleOpenBulkDeleteDialog}
                size="small"
              >
                Suppression en masse
              </Button>
            )}
          </Stack>
        </Box>

        {filterOpen && (
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom>
              Filtrer par date
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de début"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
                <DatePicker
                  label="Date de fin"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                />
              </LocalizationProvider>
            </Stack>
            
            <Typography variant="subtitle1" gutterBottom>
              Filtrer par statut
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {statusOptions.map((status) => (
                <Chip
                  key={status.value}
                  label={status.label}
                  color={selectedStatus === status.value ? status.color : 'default'}
                  variant={selectedStatus === status.value ? 'filled' : 'outlined'}
                  onClick={() => handleStatusFilter(status.value)}
                  sx={{ 
                    fontWeight: selectedStatus === status.value ? 600 : 400,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.9 }
                  }}
                />
              ))}
            </Stack>
            
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" onClick={handleClearFilters}>
                Effacer tous les filtres
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                sx={{ ml: 1 }}
                onClick={handleApplyFilters}
              >
                Appliquer
              </Button>
            </Box>
          </Box>
        )}

        {/* Afficher un message si aucune commande n'est trouvée, mais garder l'interface de filtrage */}
        {(!orders || orders.length === 0) ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
              Aucune commande trouvée avec les critères de filtrage actuels.
              {!filterOpen && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="small"
                    onClick={handleApplyFilters}
                  >
                    Appliquer
                  </Button>
                </Box>
              )}
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
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected.length > 0 && selected.length < orders.length}
                        checked={orders.length > 0 && selected.length === orders.length}
                        onChange={handleSelectAllClick}
                        inputProps={{
                          'aria-label': 'select all orders',
                        }}
                      />
                    </TableCell>
                    <TableCell>Référence</TableCell>
                    <TableCell>N° Chariot</TableCell>
                    <TableCell>Lignes</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Créée le</TableCell>
                    <TableCell>Créée par</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!orders || (searchQuery ? filteredOrders : orders).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body1" sx={{ py: 5 }}>
                          {searchQuery ? `Aucune commande trouvée pour "${searchQuery}"` : "Aucune commande trouvée."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    (searchQuery ? filteredOrders : orders).map((order, index) => {
                      const isItemSelected = isSelected(order.id);
                      
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, order.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={order.id}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                'aria-labelledby': `enhanced-table-checkbox-${index}`,
                              }}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight={600}>
                              {order.reference}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.cart_number}</TableCell>
                          <TableCell>{order.line_count || '-'}</TableCell>
                          <TableCell>{getStatusChip(order.status)}</TableCell>
                          <TableCell>
                            {order.created_at ? 
                              format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                              'Date inconnue'}
                          </TableCell>
                          <TableCell>
                            {order.creator_details ? order.creator_details.username : 'Non spécifié'}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Voir les détails">
                              <IconButton
                                onClick={() => handleViewDetails(order)}
                                size="small"
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={8} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={pageSize}
              page={page - 1} // TablePagination est 0-indexed, notre API est 1-indexed
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
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer {selected.length} commande(s) ? Cette action est irréversible.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
          {deleteSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Commandes supprimées avec succès !
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteSelected} 
            color="error" 
            autoFocus
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression en masse */}
      <Dialog
        open={openBulkDeleteDialog}
        onClose={handleCloseBulkDeleteDialog}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title" color="error">
          Suppression en masse
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight="bold" color="error" gutterBottom>
              ATTENTION : Action critique
            </Typography>
            <Typography variant="body2" paragraph>
              Vous êtes sur le point de supprimer <strong>toutes les commandes</strong> correspondant aux filtres actuels ({bulkDeleteCount} commandes).
            </Typography>
            <Typography variant="body2" paragraph>
              Cette action est <strong>irréversible</strong> et supprimera définitivement les données.
            </Typography>
            <Typography variant="body2">
              Êtes-vous absolument sûr de vouloir continuer ?
            </Typography>
          </Box>
          {bulkDeleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {bulkDeleteError}
            </Alert>
          )}
          {bulkDeleteSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {bulkDeleteCount} commandes supprimées avec succès !
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDeleteDialog} disabled={bulkDeleteLoading} variant="outlined">
            Annuler
          </Button>
          <Button 
            onClick={handleBulkDelete} 
            color="error" 
            variant="contained"
            disabled={bulkDeleteLoading}
            startIcon={bulkDeleteLoading ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
          >
            {bulkDeleteLoading ? 'Suppression en cours...' : 'Confirmer la suppression en masse'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de détails de la commande */}
      <OrderDetailsDialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        order={selectedOrder}
      />
      </Box>
    );
  };
  
  return renderContent();
};

export default OrdersDataTable;
