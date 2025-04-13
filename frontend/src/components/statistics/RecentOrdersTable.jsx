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
  lastUpdated
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
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1 : 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        width: '100%',
        mx: 'auto',
        overflowX: 'auto'
      }}
    >
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

      <TableContainer sx={{ flex: 1, width: '100%', overflowX: 'auto' }}>
        <Table size={isMobile ? "small" : "medium"} sx={{ width: '100%', minWidth: isMobile ? 350 : 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ p: isMobile ? 1 : 2 }}>Référence</TableCell>
              <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>Statut</TableCell>
              <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>Date</TableCell>
              <TableCell align="right" sx={{ p: isMobile ? 1 : 2 }}>Agent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell component="th" scope="row" sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                      {row.reference}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>
                    <Chip
                      label={isMobile ? getStatusShort(row.status) : getStatusLabel(row.status)}
                      color={getStatusColor(row.status)}
                      size={isMobile ? "small" : "medium"}
                      sx={{ fontWeight: 500, px: isMobile ? 0.5 : 1 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {formatDate(row.timestamp, isMobile)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {isMobile ? row.agent.split(' ')[0] : row.agent}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

      {lastUpdated && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'right' }}>
          {lastUpdated}
        </Typography>
      )}
    </Paper>
  );
};

export default RecentOrdersTable;
