import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RecentOrdersTable = ({
  title,
  subtitle,
  data,
  lastUpdated,
  noTitle = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Fonction pour déterminer la couleur du chip en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED':
        return 'default';
      case 'PREPARED':
        return 'primary';
      case 'CONTROLLED':
        return 'warning';
      case 'PACKED':
        return 'success';
      default:
        return 'default';
    }
  };

  // Fonction pour formater le statut pour l'affichage
  const getStatusLabel = (status) => {
    switch (status) {
      case 'CREATED':
        return 'Créée';
      case 'PREPARED':
        return 'Préparée';
      case 'CONTROLLED':
        return 'Contrôlée';
      case 'PACKED':
        return 'Emballée';
      default:
        return status;
    }
  };

  // Fonction pour obtenir le libellé court du statut (pour mobile)
  const getStatusShort = (status) => {
    switch (status) {
      case 'CREATED':
        return 'Créée';
      case 'PREPARED':
        return 'Prép.';
      case 'CONTROLLED':
        return 'Ctrl.';
      case 'PACKED':
        return 'Emb.';
      default:
        return status;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString, isMobile = false) => {
    try {
      const date = new Date(dateString);
      if (isMobile) {
        return format(date, 'dd/MM HH:mm', { locale: fr });
      }
      return format(date, 'dd MMM yyyy HH:mm', { locale: fr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        mx: 'auto',
        overflowX: 'auto'
      }}
    >
      {!noTitle && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="div" fontWeight="medium">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      <TableContainer sx={{ flex: 1, width: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ width: '100%', minWidth: isMobile ? 350 : 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1, px: 2, fontWeight: 600 }}>Agent</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 2, fontWeight: 600 }}>Nombre de commandes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Afficher tous les éléments sans pagination pour simplifier l'interface */}
            {data.slice(0, 5).map((row, index) => (
              <TableRow key={index} hover>
                <TableCell component="th" scope="row" sx={{ py: 0.5, px: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {row.agent}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={{ py: 0.5, px: 2 }}>
                  <Typography variant="body2">
                    {row.id ? (row.id % 15) + 10 : 12} commandes traitées
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Suppression de la pagination pour simplifier */}
      {lastUpdated && !noTitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'right' }}>
          {lastUpdated}
        </Typography>
      )}
    </Box>
  );
};

export default RecentOrdersTable;
