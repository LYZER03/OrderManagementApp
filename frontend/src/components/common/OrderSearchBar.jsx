import React, { useState } from 'react';
import { Box, InputBase, IconButton, Paper, Typography, useTheme, Tooltip, Button, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';

const OrderSearchBar = ({ onSearch, placeholder = "Filtrer les commandes par référence...", onAddClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    
    // Envoyer la référence exactement comme elle a été tapée (après trim)
    onSearch(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    setError('');
    onSearch('');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center', 
      mb: 3,
      width: '100%'
    }}>
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Paper
          component="form"
          onSubmit={handleSearch}
          elevation={0}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: isMobile ? '100%' : '100%',
            mb: error ? 1 : 0,
            border: `1px solid ${error ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: 2,
            '&:hover': {
              boxShadow: theme.shadows[1]
            }
          }}
        >
          <Tooltip title="Filtrer">
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (error) setError('');
              // Filtrage en temps réel
              onSearch(e.target.value.trim());
            }}
            inputProps={{ 'aria-label': 'filtrer les commandes' }}
          />
          {searchTerm && (
            <Tooltip title="Effacer">
              <IconButton sx={{ p: '10px' }} aria-label="clear" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          )}
        </Paper>
        {error && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ display: 'block', mb: 2, ml: 1 }}
          >
            {error}
          </Typography>
        )}
      </Box>
      
      {onAddClick && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddClick}
          sx={{ 
            ml: isMobile ? 0 : 2, 
            mt: isMobile ? 2 : 0,
            height: 40,
            width: isMobile ? '100%' : 'auto'
          }}
        >
          {isMobile ? 'Ajouter' : 'Ajouter'}
        </Button>
      )}
    </Box>
  );
};

export default OrderSearchBar;