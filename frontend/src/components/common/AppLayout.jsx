import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import gfcLogo from '../../assets/gfc_logo.webp';
import gfcProvapLogo from '../../assets/gfc_provap_logo2.jpg';
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
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../../context/AuthContext';
import BackToHomeButton from './BackToHomeButton';

const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 64;

const AppLayout = () => {
  const theme = useTheme();
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const drawerWidth = drawerExpanded ? expandedDrawerWidth : collapsedDrawerWidth;

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
      text: 'MENU',
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
      text: 'Table des Scores',
      icon: <BarChartIcon />,
      path: '/table_score',
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

  const toggleDrawer = () => {
    setDrawerExpanded(!drawerExpanded);
  };
  
  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#FFFFFF', 
      color: 'black',
      borderRight: '1px solid #EEEEEE',
      position: 'relative',
      overflowX: 'hidden',
      transition: 'all 0.3s ease-in-out',
      width: drawerWidth
    }}>
      {/* Header avec logo ou titre */}
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: drawerExpanded ? 'space-between' : 'center',
        p: drawerExpanded ? 2 : 1,
        height: '64px',
        borderBottom: '1px solid #EEEEEE'
      }}>
        {drawerExpanded ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                component="img"
                src={gfcProvapLogo}
                alt="GFC Provap Logo"
                sx={{ 
                  height: 40,
                  maxWidth: '70%',
                  objectFit: 'contain'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1.5,
                  fontWeight: 700,
                  color: '#333',
                  letterSpacing: 1,
                  fontSize: '1.2rem',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Montserrat, Poppins, Roboto, Arial, sans-serif'
                }}
              >
                Stock
              </Typography>
            </Box>
            <IconButton onClick={toggleDrawer} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={toggleDrawer} size="small">
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {/* Menu items */}
      <List sx={{ 
        flex: 1, 
        py: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 0,
                py: 2,
                pl: drawerExpanded ? 2 : 1,
                minHeight: '48px',
                justifyContent: drawerExpanded ? 'flex-start' : 'center',
                '&.Mui-selected': {
                  bgcolor: 'transparent',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)'
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: drawerExpanded ? 40 : 24, 
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              {drawerExpanded && (
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    noWrap: true
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {/* Settings button at bottom */}
      <Box sx={{ 
        borderTop: '1px solid #EEEEEE',
        display: 'flex',
        justifyContent: drawerExpanded ? 'flex-start' : 'center'
      }}>
        <ListItemButton
          onClick={() => navigate('/settings')}
          sx={{
            borderRadius: 0,
            p: 1.5,
            minWidth: drawerExpanded ? 'auto' : 40,
            display: 'flex',
            justifyContent: drawerExpanded ? 'flex-start' : 'center'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerExpanded ? 40 : 24,
            color: location.pathname === '/settings' ? theme.palette.primary.main : 'inherit'
          }}>
            <SettingsIcon />
          </ListItemIcon>
          {drawerExpanded && (
            <ListItemText 
              primary="Paramètres" 
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: location.pathname === '/settings' ? 600 : 400,
              }}
            />
          )}
        </ListItemButton>
      </Box>
      
      {/* Logout button */}
      <Box sx={{ 
        borderTop: '1px solid #EEEEEE',
        display: 'flex',
        justifyContent: drawerExpanded ? 'flex-start' : 'center',
        mb: 1
      }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 0,
            p: 1.5,
            minWidth: drawerExpanded ? 'auto' : 40,
            display: 'flex',
            justifyContent: drawerExpanded ? 'flex-start' : 'center'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerExpanded ? 40 : 24,
            color: 'inherit'
          }}>
            <LogoutIcon />
          </ListItemIcon>
          {drawerExpanded && (
            <ListItemText 
              primary="Déconnexion" 
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: 400,
              }}
            />
          )}
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
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` },
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
            sx={{ ml: 1.5, mr: 2, display: { sm: 'none' }, color: theme.palette.text.primary }}
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
                    ml: { xs: 1.5, sm: 0 },
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
  {user && (
    <Typography
      variant="subtitle2"
      sx={{
        mx: 1.5,
        color: theme.palette.text.primary,
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: 0.2,
        textTransform: 'none',
        maxWidth: 180,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {user.full_name || user.username}
    </Typography>
  )}
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
          ml: { sm: 0 },
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Toolbar sx={{ bgcolor: 'transparent' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
