import React from 'react';
import { Button, Box, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackToHomeButton = ({ color = 'primary' }) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 10,
        top: 80, // Ajusté pour être sous la barre de navigation
        left: 24
      }}
    >
      <Tooltip title="Retour au tableau de bord">
        <IconButton
          color={color}
          onClick={() => navigate('/dashboard')}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 4
            }
          }}
          size="large"
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BackToHomeButton;
