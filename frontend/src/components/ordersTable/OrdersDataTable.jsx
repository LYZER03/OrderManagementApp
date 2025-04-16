import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';

import OrderDetailsDialog from './OrderDetailsDialog';
import userService from '../../services/userService';

const OrdersDataTable = ({ 
  orders, 
  loading, 
  error, 
  onDeleteOrders 
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [agents, setAgents] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  
  // Liste des statuts possibles pour le filtrage
  const statusOptions = [
    { value: 'CREATED', label: 'Créée', color: 'primary' },
    { value: 'PREPARED', label: 'Préparée', color: 'success' },
    { value: 'CONTROLLED', label: 'Contrôlée', color: 'warning' },
    { value: 'PACKED', label: 'Emballée', color: 'secondary' }
  ];

  // Charger la liste des agents
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await userService.getAllAgents();
        setAgents(agentsData);
      } catch (err) {
        console.error('Erreur lors du chargement des agents', err);
      }
    };
    
    loadAgents();
  }, []);

  // Effet pour mettre à jour les commandes filtrées lorsque les commandes ou les filtres changent
  useEffect(() => {
    // Utiliser un délai pour éviter les calculs inutiles lors de changements rapides
    const timeoutId = setTimeout(() => {
      try {
        // Vérifier si orders est valide
        if (!Array.isArray(orders)) {
          console.error('Les commandes ne sont pas un tableau:', orders);
          setFilteredOrders([]);
          return;
        }
        
        let result = [...orders];
        
        // Appliquer le filtre de statut si défini
        if (selectedStatus) {
          result = result.filter(order => order.status === selectedStatus);
        }
        
        // Appliquer le filtre par créateur si défini
        if (selectedCreator) {
          result = result.filter(order => order.creator === parseInt(selectedCreator));
        }
        
        setFilteredOrders(result);
        
        // Réinitialiser la page à 0 lorsque les filtres changent
        setPage(0);
      } catch (err) {
        console.error('Erreur lors du filtrage des commandes:', err);
        setFilteredOrders([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [orders, selectedStatus, selectedCreator]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredOrders.map((n) => n.id);
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

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleClearFilters = () => {
    setSelectedStatus(null);
    setSelectedCreator('');
  };
  
  const handleStatusFilter = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Éviter un layout jump quand la page change
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredOrders.length) : 0;

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

  // Nous ne retournons plus un simple message d'alerte quand aucune commande n'est trouvée
  // Au lieu de cela, nous afficherons le message dans l'interface principale avec les filtres

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" id="tableTitle" component="div">
            Table des commandes
          </Typography>
          <Stack direction="row" spacing={1}>
  {/* Filtres de statut toujours visibles */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
    {statusOptions.map((status) => (
      <Chip
        key={status.value}
        label={status.label}
        color={selectedStatus === status.value ? status.color : 'default'}
        onClick={() => handleStatusFilter(status.value)}
        clickable
        variant={selectedStatus === status.value ? 'filled' : 'outlined'}
        sx={{ fontWeight: 600 }}
      />
    ))}
    <Button size="small" variant="outlined" color="inherit" onClick={handleClearFilters} sx={{ ml: 2 }}>
      Réinitialiser les filtres
    </Button>
  </Box>
            
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleOpenDeleteDialog}
              disabled={selected.length === 0}
              size="small"
            >
              Supprimer ({selected.length})
            </Button>
          </Stack>
        </Box>

        {filterOpen && (
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1">Filtrer par date</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label="Date de début"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    slotProps={{ textField: { size: 'small' } }}
                    format="dd/MM/yyyy"
                  />
                  <DatePicker
                    label="Date de fin"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    slotProps={{ textField: { size: 'small' } }}
                    format="dd/MM/yyyy"
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1">Filtrer par statut</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {statusOptions.map((status) => (
                  <Chip
                    key={status.value}
                    label={status.label}
                    color={selectedStatus === status.value ? status.color : 'default'}
                    onClick={() => handleStatusFilter(status.value)}
                    clickable
                    variant={selectedStatus === status.value ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Typography variant="subtitle1">Filtrer par créateur</Typography>
              <FormControl fullWidth size="small">
                <InputLabel id="creator-filter-label">Créateur</InputLabel>
                <Select
                  labelId="creator-filter-label"
                  id="creator-filter"
                  value={selectedCreator}
                  label="Créateur"
                  onChange={(e) => setSelectedCreator(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Tous les créateurs</em>
                  </MenuItem>
                  {agents.map(agent => (
                    <MenuItem key={agent.id} value={agent.id.toString()}>
                      {agent.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" size="small" onClick={handleClearFilters}>
                Effacer tous les filtres
              </Button>
            </Box>
          </Box>
        )}

        {/* Afficher un message si aucune commande n'est trouvée, mais garder l'interface de filtrage */}
        {(!filteredOrders || filteredOrders.length === 0) ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
              Aucune commande trouvée avec les critères de filtrage actuels.
              {!filterOpen && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleClearFilters}
                  >
                    Effacer les filtres
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
                        indeterminate={selected.length > 0 && selected.length < filteredOrders.length}
                        checked={filteredOrders.length > 0 && selected.length === filteredOrders.length}
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
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => {
                      const isItemSelected = isSelected(order.id);

                      return (
                        <TableRow
                          hover
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
                              onClick={(event) => handleClick(event, order.id)}
                              inputProps={{
                                'aria-labelledby': `enhanced-table-checkbox-${order.id}`,
                              }}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight={600}>
                              {order.reference}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.cart_number || '-'}</TableCell>
                          <TableCell>{order.line_count || '-'}</TableCell>
                          <TableCell>{getStatusChip(order.status)}</TableCell>
                          <TableCell>
                            {order.created_at ? 
                              (() => {
                                try {
                                  return format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr });
                                } catch (err) {
                                  console.error('Erreur de formatage de date:', err);
                                  return 'Date invalide';
                                }
                              })() : 
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
                    })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={8} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredOrders.length}
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

      {/* Dialogue de détails de la commande */}
      <OrderDetailsDialog
        open={openDetailsDialog}
        onClose={handleCloseDetailsDialog}
        order={selectedOrder}
      />
    </Box>
  );
};

export default OrdersDataTable;
