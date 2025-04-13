import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoIcon from '@mui/icons-material/Info';

const OrderCardMobile = ({ order, onValidate, onViewDetails }) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: '4px solid', 
        borderColor: 'warning.main',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} component="div">
            {order.reference}
          </Typography>
          <Chip 
            label="À emballer" 
            size="small" 
            sx={{ 
              bgcolor: 'warning.light',
              color: 'warning.dark',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '24px'
            }} 
          />
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              N° Chariot
            </Typography>
            <Typography variant="body2">
              {order.cart_number}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Lignes
            </Typography>
            <Typography variant="body2">
              {order.line_count ? order.line_count : '-'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Contrôlée le
            </Typography>
            <Typography variant="body2">
              {order.controlled_at ? 
                format(new Date(order.controlled_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                'Date inconnue'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Contrôlée par
            </Typography>
            <Typography variant="body2">
              {order.controller_details ? order.controller_details.username : 'Non spécifié'}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1 }} />
        
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton 
            color="info" 
            onClick={() => onViewDetails && onViewDetails(order)}
            size="small"
            sx={{ p: 1 }}
          >
            <InfoIcon fontSize="small" />
          </IconButton>
          <IconButton 
            color="warning" 
            onClick={() => onValidate && onValidate(order)}
            size="small"
            sx={{ p: 1 }}
          >
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCardMobile;
