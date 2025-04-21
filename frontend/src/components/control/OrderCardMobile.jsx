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
import SwipeToValidate from '../common/SwipeToValidate.jsx';

const OrderCardMobile = ({ order, onValidate, onViewDetails }) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        borderLeft: '4px solid', 
        borderColor: 'success.main',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Ligne du haut : statut & référence */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip 
            label="À contrôler" 
            size="small" 
            sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600, fontSize: '0.7rem', height: 24, mr: 1 }} 
          />
          <Typography variant="subtitle1" fontWeight={600} component="div">
            {order.reference}
          </Typography>
        </Box>
        
        {/* Infos commande */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          {[{
            label: 'N° Chariot', value: order.cart_number
          }, {
            label: 'Lignes', value: order.line_count ?? '-'
          }].map((item, idx) => (
            <Grid key={item.label} xs={6} item>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="body2">{item.value}</Typography>
            </Grid>
          ))}
          <Grid xs={12} item>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Préparée le
                </Typography>
                <Typography variant="body2">
                  {order.prepared_at ? 
                    format(new Date(order.prepared_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                    'Date inconnue'}
                </Typography>
              </Box>
              <IconButton 
                color="info" 
                onClick={() => onViewDetails && onViewDetails(order)}
                size="small"
                sx={{ p: 1, ml: 1 }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid xs={12} item>
            <Typography variant="caption" color="text.secondary">
              Préparée par
            </Typography>
            <Typography variant="body2">
              {order.preparer_details ? order.preparer_details.username : 'Non spécifié'}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 1 }} />
        
        
        {/* Swipe validation */}
        <SwipeToValidate
          label="Swipe pour valider"
          onSwipe={() => onValidate && onValidate(order)}
          color="#4caf50"
          textColor="#4caf50"
        />
      </CardContent>
    </Card>
  );
};

export default OrderCardMobile;
