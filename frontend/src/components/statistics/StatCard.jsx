import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const StatCard = ({ 
  icon, 
  title, 
  value, 
  changePercentage, 
  changeText, 
  color = 'primary',
  lastUpdated
}) => {
  const theme = useTheme();
  
  // Déterminer la couleur de l'icône de changement
  const getChangeColor = () => {
    if (changePercentage > 0) return theme.palette.success.main;
    if (changePercentage < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  // Déterminer l'icône de changement
  const getChangeIcon = () => {
    if (changePercentage > 0) return <ArrowUpwardIcon fontSize="small" />;
    if (changePercentage < 0) return <ArrowDownwardIcon fontSize="small" />;
    return null;
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1,
          color: `${color}.main`
        }}
      >
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
            color: `${color}.main`,
            p: 1,
            borderRadius: 1,
            mr: 1
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
      </Box>
      
      <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
        {value}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
        {changePercentage !== undefined && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: getChangeColor(),
              mr: 1
            }}
          >
            {getChangeIcon()}
            <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
              {Math.abs(changePercentage)}%
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" color="text.secondary">
          {changeText || lastUpdated || ''}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
