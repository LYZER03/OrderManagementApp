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
import EditIcon from '@mui/icons-material/Edit';

const OrderCardMobile = ({ order, onValidate, onEdit }) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: '4px solid', 
        borderColor: 'primary.main',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {/* Statut à gauche */}
          <Chip 
            label="À préparer" 
            size="small" 
            sx={{ 
              bgcolor: 'primary.light',
              color: 'primary.dark',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '24px',
              mr: 1
            }} 
          />
          {/* Référence à droite */}
          <Typography variant="subtitle1" fontWeight={600} component="div">
            {order.reference}
          </Typography>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date de création
                </Typography>
                <Typography variant="body2">
                  {order.created_at ? 
                    format(new Date(order.created_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                    'Date inconnue'}
                </Typography>
              </Box>
              <Box
  component="button"
  onClick={() => onValidate && onValidate(order)}
  sx={{
    display: 'flex',
    alignItems: 'center',
    px: 3,
    py: 1.2,
    ml: 1,
    bgcolor: 'success.light',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    boxShadow: 1,
    transition: 'background 0.2s',
    '&:hover': {
      bgcolor: 'success.main',
    },
  }}
>
  <CheckCircleOutlineIcon sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
  <span style={{ fontWeight: 600, color: '#1b5e20', fontSize: 18 }}>Valider</span>
</Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1 }} />
        
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <IconButton 
            color="primary" 
            onClick={() => onEdit && onEdit(order)}
            size="small"
            sx={{ p: 1 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OrderCardMobile;
