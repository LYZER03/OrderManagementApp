import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../context/AuthContext';
import BackToHomeButton from './BackToHomeButton';

const drawerWidth = 260;

const AppLayout = () => {
  const theme = useTheme();
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
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
      text: 'Statistiques',
      icon: <BarChartIcon />,
      path: '/statistics',
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          GFC Provap <span style={{ color: theme.palette.text.primary }}>COMMANDES</span>
        </Typography>
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: theme.palette.primary.light,
            display: 'flex',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: '#fff',
              mr: 2
            }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.dark }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Chip
              label={user?.role === 'MANAGER' ? 'Manager' : 'Agent'}
              size="small"
              sx={{ 
                bgcolor: user?.role === 'MANAGER' ? theme.palette.secondary.light : theme.palette.success.light,
                color: user?.role === 'MANAGER' ? theme.palette.secondary.dark : theme.palette.success.dark,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      <Typography variant="overline" sx={{ px: 3, py: 1, color: theme.palette.text.secondary }}>
        MENU PRINCIPAL
      </Typography>
      
      <List sx={{ px: 2, flex: 1 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ 
                borderRadius: 2,
                py: 1,
                '&.Mui-selected': {
                  bgcolor: theme.palette.primary.light,
                  '&:hover': {
                    bgcolor: theme.palette.primary.light,
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.875rem', 
                  fontWeight: location.pathname === item.path ? 600 : 500 
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.dark,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.light, 0.8),
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.dark }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Déconnexion" 
            primaryTypographyProps={{ 
              fontSize: '0.875rem', 
              fontWeight: 600 
            }} 
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#fff',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
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
            <Typography 
              variant="h6" 
              noWrap 
              component="div" 
              sx={{ 
                display: { xs: 'none', sm: 'block' }, 
                color: theme.palette.text.primary,
                fontWeight: 600
              }}
            >
              {filteredMenuItems.find(item => item.path === location.pathname)?.text || 'Tableau de bord'}
            </Typography>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box 
              onClick={handleOpenUserMenu}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                p: '4px 8px',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: theme.palette.grey[100]
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
              {!isMobile && (
                <>
                  <Box sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {user?.first_name} {user?.last_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}>
                      {user?.role === 'MANAGER' ? 'Manager' : 'Agent'}
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon sx={{ color: theme.palette.text.secondary, ml: 0.5 }} />
                </>
              )}
            </Box>
            
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => {
                handleCloseUserMenu();
                navigate('/profile');
              }}>
                <Typography textAlign="center">Profil</Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                handleCloseUserMenu();
                navigate('/settings');
              }}>
                <Typography textAlign="center">Paramètres</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Déconnexion</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: '#fff'
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
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          bgcolor: theme.palette.grey[50],
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        <Toolbar />
        {location.pathname !== '/dashboard' && (
          <BackToHomeButton color="primary" />
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
