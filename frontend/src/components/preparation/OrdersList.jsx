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
  TablePagination
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OrdersList = ({ 
  orders, 
  loading, 
  error, 
  page,
  rowsPerPage,
  totalCount,
  onChangePage,
  onChangeRowsPerPage
}) => {
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
      <Typography variant="h6" gutterBottom>
        Commandes à préparer
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table sx={{ minWidth: 650 }} aria-label="tableau des commandes">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Numéro de chariot</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Statut</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => onChangePage(newPage)}
          onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>
    </Box>
  );
};

export default OrdersList;
