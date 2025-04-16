import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import gfcLogo from '../../assets/gfc_logo.webp';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Stack,
  InputBase,
  alpha,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import TableViewIcon from '@mui/icons-material/TableView';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';
import BackToHomeButton from './BackToHomeButton';

const drawerWidth = 240;

const AppLayout = () => {
  const theme = useTheme();
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Définition des éléments du menu en fonction du rôle de l'utilisateur
  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['AGENT', 'MANAGER']
    },
    {
      text: 'Préparation',
      icon: <InventoryIcon />,
      path: '/preparation',
      roles: ['AGENT', 'MANAGER']
    },
    {
      text: 'Contrôle',
      icon: <CheckCircleIcon />,
      path: '/control',
      roles: ['AGENT', 'MANAGER']
    },
    {
      text: 'Emballage',
      icon: <LocalShippingIcon />,
      path: '/packing',
      roles: ['AGENT', 'MANAGER']
    },
    {
      text: 'Table des commandes',
      icon: <TableViewIcon />,
      path: '/orders-table',
      roles: ['MANAGER']
    },
    {
      text: 'Statistiques',
      icon: <BarChartIcon />,
      path: '/statistics',
      roles: ['MANAGER']
    },
    {
      text: 'Analyses Avancées',
      icon: <BarChartIcon />,
      path: '/advanced-analytics',
      roles: ['MANAGER']
    },
    {
      text: 'Gestion des utilisateurs',
      icon: <PeopleIcon />,
      path: '/users',
      roles: ['MANAGER']
    }
  ];

  // Filtrer les éléments du menu en fonction du rôle de l'utilisateur
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#424242', 
      color: 'white',
      borderRadius: '16px',
      m: 1.5,
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,66,0.4)',
      overflow: 'hidden'
    }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', bgcolor: '#424242' }}>
        <Box 
          component="img"
          src={gfcLogo}
          alt="GFC Logo"
          sx={{ 
            height: 40,
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      

      

      
      <List sx={{ px: 1, flex: 1, mt: 2, color: 'rgba(255, 255, 255, 0.9)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                py: 1,
                pl: 2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.25)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '80%',
                    width: '4px',
                    bgcolor: '#fff',
                    borderRadius: '0 4px 4px 0'
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                },
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255, 255, 255, 0.7)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, mt: 'auto', bgcolor: '#424242' }}>
        <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        <ListItemButton 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 1,
            py: 1,
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255, 255, 255, 0.7)' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Sign Out" 
            primaryTypographyProps={{ 
              fontSize: '0.875rem', 
              fontWeight: 400 
            }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100vw', maxWidth: '100%', overflowX: 'hidden', bgcolor: '#ffffff' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth + 16}px)` }, 
          ml: { sm: `${drawerWidth + 16}px` },
          bgcolor: '#ffffff',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none'
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: [1, 2],
            py: 1,
            bgcolor: 'transparent'
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: theme.palette.text.primary }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {location.pathname !== '/dashboard' && (
                <IconButton
                  size="small"
                  color="inherit"
                  onClick={() => navigate('/dashboard')}
                  sx={{ 
                    mr: 1,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Typography 
                variant="subtitle1" 
                noWrap 
                component="div" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' }, 
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  fontSize: '0.875rem'
                }}
              >
                / {filteredMenuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" sx={{ mx: 0.5, color: '#757575' }} onClick={handleLogout}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
          position: 'relative',
          zIndex: 1200
        }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              bgcolor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              bgcolor: 'transparent',
              color: 'white',
              backgroundImage: 'none',
              boxShadow: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          bgcolor: 'transparent',
          minHeight: '100vh',
          position: 'relative',
          overflowX: 'hidden',
          ml: { sm: 2 }
        }}
      >
        <Toolbar sx={{ bgcolor: 'transparent' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
