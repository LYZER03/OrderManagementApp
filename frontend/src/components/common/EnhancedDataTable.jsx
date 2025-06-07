import React, { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Checkbox,
  Toolbar,
  Typography,
  Paper,
  Menu,
  MenuItem,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedDataTable = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick,
  onRefresh,
  enableSelection = false,
  enableSearch = true,
  enableFilters = true,
  enableExport = false,
  title,
  subtitle,
  actions = []
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.id];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(activeFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const value = row[columnId];
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, activeFilters, columns]);

  const handleSort = (columnId) => {
    setSortConfig(prev => ({
      key: columnId,
      direction: prev.key === columnId && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(new Set(processedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const renderCellContent = (row, column) => {
    if (column.render) {
      return column.render(row[column.id], row);
    }
    
    const value = row[column.id];
    
    // Handle different data types
    if (column.type === 'status') {
      return (
        <Chip
          label={value}
          size="small"
          color={getStatusColor(value)}
          variant="outlined"
        />
      );
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    return value;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'CREATED': 'default',
      'PREPARED': 'info',
      'CONTROLLED': 'warning',
      'PACKED': 'success',
      'SHIPPED': 'success'
    };
    return statusColors[status] || 'default';
  };

  const isSelected = (rowId) => selectedRows.has(rowId);
  const numSelected = selectedRows.size;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}
    >
      {/* Enhanced Toolbar */}
      <Toolbar
        sx={{
          pl: 2,
          pr: 1,
          py: 1,
          bgcolor: numSelected > 0 ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="primary"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Box sx={{ flex: '1 1 100%' }}>
            {title && (
              <Typography variant="h6" component="div">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          {enableSearch && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  width: 250,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5)
                  }
                }
              }}
            />
          )}
          
          {enableFilters && (
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              size="small"
            >
              <FilterIcon />
            </IconButton>
          )}
          
          {onRefresh && (
            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          )}
          
          {enableExport && (
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          )}
          
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outlined'}
              size="small"
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </Toolbar>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {enableSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < processedData.length}
                    checked={processedData.length > 0 && numSelected === processedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={sortConfig.key === column.id ? sortConfig.direction : false}
                  sx={{
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    ...(column.width && { width: column.width }),
                    ...(column.minWidth && { minWidth: column.minWidth })
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortConfig.key === column.id}
                      direction={sortConfig.key === column.id ? sortConfig.direction : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {processedData.map((row, index) => {
                const isItemSelected = isSelected(row.id);
                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    component={TableRow}
                    hover
                    onClick={() => onRowClick && onRowClick(row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.5)
                      }
                    }}
                  >
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {renderCellContent(row, column)}
                      </TableCell>
                    ))}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {processedData.length === 0 && !loading && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No data found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search terms' : 'No items to display'}
          </Typography>
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setFilterAnchorEl(null)}>Clear Filters</MenuItem>
      </Menu>
    </Paper>
  );
};

export default EnhancedDataTable;