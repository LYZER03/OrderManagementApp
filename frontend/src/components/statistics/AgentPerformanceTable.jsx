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
  useTheme,
  useMediaQuery
} from '@mui/material';

const AgentPerformanceTable = ({
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

  // Fonction pour déterminer la couleur du chip en fonction du temps moyen
  const getTimeColor = (time) => {
    if (time <= 15) return 'success';
    if (time <= 20) return 'warning';
    return 'error';
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

      <TableContainer sx={{ flex: 1, overflowX: 'auto' }}>
        <Table size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 350 : 500 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ p: isMobile ? 1 : 2 }}>Agent</TableCell>
              <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>{isMobile ? 'Cmd.' : 'Commandes traitées'}</TableCell>
              <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>{isMobile ? 'Temps' : 'Temps moyen (min)'}</TableCell>
              <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>Éval.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell component="th" scope="row" sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight="medium">
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>
                    <Typography variant={isMobile ? "body2" : "body1"}>
                      {row.ordersProcessed}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>
                    <Chip
                      label={isMobile ? row.averageTime : `${row.averageTime} min`}
                      size={isMobile ? "small" : "medium"}
                      color={getTimeColor(row.averageTime)}
                      sx={{ fontWeight: 500, px: isMobile ? 0.5 : 1 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ p: isMobile ? 1 : 2 }}>
                    <Rating
                      value={row.rating}
                      precision={0.1}
                      size={isMobile ? "small" : "medium"}
                      readOnly
                    />
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

export default AgentPerformanceTable;
