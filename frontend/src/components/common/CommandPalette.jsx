import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  TableView as TableViewIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const CommandPalette = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { user, isManager, isSuperAgent } = useAuth();
  const theme = useTheme();

  // Define all available commands
  const commands = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Main overview page',
      icon: <DashboardIcon />,
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'home', 'main'],
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER']
    },
    {
      id: 'preparation',
      title: 'Go to Preparation',
      subtitle: 'Manage orders preparation',
      icon: <InventoryIcon />,
      action: () => navigate('/preparation'),
      keywords: ['preparation', 'prepare', 'orders'],
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER']
    },
    {
      id: 'control',
      title: 'Go to Control',
      subtitle: 'Control prepared orders',
      icon: <CheckCircleIcon />,
      action: () => navigate('/control'),
      keywords: ['control', 'check', 'verify'],
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER']
    },
    {
      id: 'packing',
      title: 'Go to Packing',
      subtitle: 'Pack controlled orders',
      icon: <LocalShippingIcon />,
      action: () => navigate('/packing'),
      keywords: ['packing', 'pack', 'shipping'],
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER']
    },
    {
      id: 'orders-table',
      title: 'Orders Table',
      subtitle: 'View all orders in table format',
      icon: <TableViewIcon />,
      action: () => navigate('/orders-table'),
      keywords: ['orders', 'table', 'list', 'all'],
      roles: ['SUPER_AGENT', 'MANAGER']
    },
    {
      id: 'statistics',
      title: 'Statistics',
      subtitle: 'View performance metrics',
      icon: <BarChartIcon />,
      action: () => navigate('/statistics'),
      keywords: ['statistics', 'stats', 'metrics', 'performance'],
      roles: ['MANAGER']
    },
    {
      id: 'users',
      title: 'User Management',
      subtitle: 'Manage user accounts',
      icon: <PeopleIcon />,
      action: () => navigate('/users'),
      keywords: ['users', 'accounts', 'management'],
      roles: ['MANAGER']
    },
    {
      id: 'add-order',
      title: 'Create New Order',
      subtitle: 'Add a new order to the system',
      icon: <AddIcon />,
      action: () => {
        navigate('/preparation');
        // You can add logic here to open the add order form
      },
      keywords: ['create', 'new', 'add', 'order'],
      roles: ['AGENT', 'SUPER_AGENT', 'MANAGER']
    }
  ];

  // Filter commands based on user role and search query
  const filteredCommands = commands.filter(command => {
    const hasRole = command.roles.includes(user?.role);
    const matchesQuery = query === '' || 
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()));
    
    return hasRole && matchesQuery;
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            handleClose();
          }
          break;
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  const handleCommandSelect = (command) => {
    command.action();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[20],
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            fullWidth
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            size="small"
            autoFocus
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none'
                },
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                borderRadius: 1
              }
            }}
          />
        </Box>

        {filteredCommands.length > 0 ? (
          <List sx={{ py: 1, maxHeight: 400, overflow: 'auto' }}>
            {filteredCommands.map((command, index) => (
              <ListItem
                key={command.id}
                button
                selected={index === selectedIndex}
                onClick={() => handleCommandSelect(command)}
                sx={{
                  py: 1.5,
                  px: 2,
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15)
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5)
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {command.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={500}>
                      {command.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {command.subtitle}
                    </Typography>
                  }
                />
                <Box sx={{ ml: 2 }}>
                  <Chip
                    label="Enter"
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.75rem',
                      height: 24,
                      opacity: index === selectedIndex ? 1 : 0.5
                    }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No commands found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try searching for "dashboard", "orders", or "statistics"
            </Typography>
          </Box>
        )}

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.action.hover, 0.3) }}>
          <Typography variant="caption" color="text.secondary">
            Press <Chip label="↑↓" size="small" variant="outlined" sx={{ mx: 0.5, fontSize: '0.7rem', height: 20 }} /> to navigate,{' '}
            <Chip label="Enter" size="small" variant="outlined" sx={{ mx: 0.5, fontSize: '0.7rem', height: 20 }} /> to select,{' '}
            <Chip label="Esc" size="small" variant="outlined" sx={{ mx: 0.5, fontSize: '0.7rem', height: 20 }} /> to close
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;