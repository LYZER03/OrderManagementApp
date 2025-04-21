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
              {/* Colonnes pour le nombre de commandes */}
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Préparées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Contrôlées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Emballées</TableCell>
              {/* Colonnes pour le nombre de lignes */}
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Lignes préparées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Lignes contrôlées</TableCell>
              <TableCell align="center" sx={{ py: 1, px: 1, fontWeight: 600 }}>Lignes emballées</TableCell>
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
                  
                  {/* Nombre de commandes */}
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Tooltip title="Commandes préparées">
                      <Chip 
                        size="small" 
                        label={row.preparedOrders || 0}
                        color={getPerformanceColor(row.preparedOrders || 0, maxOrders)}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Tooltip title="Commandes contrôlées">
                      <Chip 
                        size="small" 
                        label={row.controlledOrders || 0}
                        color={getPerformanceColor(row.controlledOrders || 0, maxOrders)}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Tooltip title="Commandes emballées">
                      <Chip 
                        size="small" 
                        label={row.packedOrders || 0}
                        color={getPerformanceColor(row.packedOrders || 0, maxOrders)}
                      />
                    </Tooltip>
                  </TableCell>
                  
                  {/* Nombre de lignes */}
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Typography variant="body2">
                      {preparedLines}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Typography variant="body2">
                      {controlledLines}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5, px: 1 }}>
                    <Typography variant="body2">
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
