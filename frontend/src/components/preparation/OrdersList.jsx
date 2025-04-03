import React from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  TablePagination,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import OrderCardMobile from './OrderCardMobile';

const OrdersList = ({ 
  orders, 
  loading, 
  error, 
  page,
  rowsPerPage,
  totalCount,
  onChangePage,
  onChangeRowsPerPage,
  onValidate,
  onEdit
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  if (!orders || orders.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Aucune commande à préparer pour le moment.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Commandes à préparer
      </Typography>
      
      {isMobile ? (
        // Vue mobile avec des cartes
        <Box sx={{ mt: 2, width: '100%' }}>
          {orders.map((order) => (
            <OrderCardMobile 
              key={order.id} 
              order={order} 
              onValidate={onValidate} 
              onEdit={onEdit} 
            />
          ))}
        </Box>
      ) : (
        // Vue desktop avec tableau
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', width: '100%' }}>
          <Table sx={{ minWidth: 650 }} aria-label="tableau des commandes">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Numéro de chariot</TableCell>
                <TableCell>Lignes</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight={600}>
                      {order.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>{order.cart_number}</TableCell>
                  <TableCell>
                    {order.line_count ? order.line_count : '-'}
                  </TableCell>
                  <TableCell>
                    {order.created_at ? 
                      format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                      'Date inconnue'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label="À préparer" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Valider la préparation">
                        <IconButton 
                          color="success" 
                          onClick={() => onValidate && onValidate(order)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier la commande">
                        <IconButton 
                          color="primary" 
                          onClick={() => onEdit && onEdit(order)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => onChangePage(newPage)}
            onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
            labelRowsPerPage={isMobile ? "Lignes:" : "Lignes par page:"}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            sx={{
              '.MuiTablePagination-selectLabel': {
                fontSize: isMobile ? '0.75rem' : 'inherit',
              },
              '.MuiTablePagination-displayedRows': {
                fontSize: isMobile ? '0.75rem' : 'inherit',
              },
              '.MuiTablePagination-select': {
                fontSize: isMobile ? '0.75rem' : 'inherit',
              }
            }}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default OrdersList;
