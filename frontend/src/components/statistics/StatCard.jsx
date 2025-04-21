import React from 'react';
import { Box, Typography, Paper, useTheme} from '@mui/material';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  color = 'primary',
}) => {
  const theme = useTheme();
  
  // Détermine la couleur de la barre de progression en fonction de la couleur fournie
  const getProgressColor = () => {
    switch(color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        px: 3,
        py: 3,
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        borderRadius: 2,
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF'
      }}
    >
      {/* En-tête: titre et icône */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        {/* Titre */}
        <Typography 
          variant="subtitle1" 
          component="div" 
          sx={{ 
            fontWeight: 500, 
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>
        
        {/* Icône */}
        {icon && (
          <Box
            sx={{
              color: getProgressColor(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      
      {/* Valeur principale */}
      <Typography 
        variant="h2" 
        component="div" 
        sx={{ 
          fontWeight: 700, 
          my: 2,
          color: 'text.primary',
          textAlign: 'center',
          fontSize: '2.5rem'
        }}
      >
        {value}
      </Typography>
      
      {/* Le texte de pourcentage et la barre de progression ont été supprimés */}
    </Paper>
  );
};

export default StatCard;
