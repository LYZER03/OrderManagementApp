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
  Rating,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';

const AgentPerformanceTable = ({
  title = "Performance des Agents",
  subtitle = "Détails des commandes et lignes traitées par agent",
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

  // Fonction pour déterminer la couleur selon la valeur (verte si élevée, rouge si basse)
  const getPerformanceColor = (value, max) => {
    const ratio = value / max;
    if (ratio >= 0.8) return 'success';
    if (ratio >= 0.5) return 'primary';
    if (ratio >= 0.3) return 'warning';
    return 'error';
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

      <TableContainer sx={{ flex: 1, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: isMobile ? 350 : 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1, px: 1, fontWeight: 600 }}>Agent</TableCell>
              {/* Colonnes pour le nombre de commandes préparées - couleur verte */}
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#e8f5e9', color: '#2e7d32', borderBottom: '2px solid #2e7d32' }}>Préparées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#e8f5e9', color: '#2e7d32', borderBottom: '2px solid #2e7d32' }}>Lignes préparées</TableCell>
              {/* Colonnes pour le nombre de commandes contrôlées - couleur orange */}
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#fff3e0', color: '#e65100', borderBottom: '2px solid #e65100' }}>Contrôlées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#fff3e0', color: '#e65100', borderBottom: '2px solid #e65100' }}>Lignes contrôlées</TableCell>
              {/* Colonnes pour le nombre de commandes emballées - couleur violette */}
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#f3e5f5', color: '#6a1b9a', borderBottom: '2px solid #6a1b9a' }}>Emballées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600, backgroundColor: '#f3e5f5', color: '#6a1b9a', borderBottom: '2px solid #6a1b9a' }}>Lignes emballées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Total lignes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Afficher tous les éléments sans pagination pour simplifier l'interface */}
            {data.slice(0, 5).map((row, index) => {
              // Calculer le nombre de lignes pour chaque type de commande
              // Dans un cas réel, ces données viendraient du backend
              const linesPerOrder = row.avgLinesPerOrder || 5; // Nombre moyen de lignes par commande
              const preparedLines = (row.preparedOrders || 0) * linesPerOrder;
              const controlledLines = (row.controlledOrders || 0) * linesPerOrder;
              const packedLines = (row.packedOrders || 0) * linesPerOrder;
              const totalLines = preparedLines + controlledLines + packedLines;
              
              // Trouver la valeur maximale pour définir les couleurs des chips
              const maxOrders = Math.max(
                row.preparedOrders || 0, 
                row.controlledOrders || 0, 
                row.packedOrders || 0
              );
              const maxLines = Math.max(preparedLines, controlledLines, packedLines);
              
              return (
                <TableRow key={index} hover>
                  <TableCell component="th" scope="row" sx={{ py: 0.5, px: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {row.name}
                    </Typography>
                  </TableCell>
                  
                  {/* Nombre de commandes préparées - fond léger vert */}
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: row.preparedOrders > 0 ? 'rgba(46, 125, 50, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                      {row.preparedOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: preparedLines > 0 ? 'rgba(46, 125, 50, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                      {preparedLines}
                    </Typography>
                  </TableCell>
                  {/* Nombre de commandes contrôlées - fond léger orange */}
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: row.controlledOrders > 0 ? 'rgba(230, 81, 0, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 500 }}>
                      {row.controlledOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: controlledLines > 0 ? 'rgba(230, 81, 0, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 500 }}>
                      {controlledLines}
                    </Typography>
                  </TableCell>
                  {/* Nombre de commandes emballées - fond léger violet */}
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: row.packedOrders > 0 ? 'rgba(106, 27, 154, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#6a1b9a', fontWeight: 500 }}>
                      {row.packedOrders || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1, backgroundColor: packedLines > 0 ? 'rgba(106, 27, 154, 0.04)' : 'transparent' }}>
                    <Typography variant="body2" sx={{ color: '#6a1b9a', fontWeight: 500 }}>
                      {packedLines}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {totalLines}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
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

export default AgentPerformanceTable;
