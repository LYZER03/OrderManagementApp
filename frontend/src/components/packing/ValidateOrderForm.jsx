// ValidateOrderForm.jsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Slide,
  Zoom,
  Fade,
  IconButton
} from '@mui/material';
import {
  LocalShipping as PackageIcon,
  SwipeRight as SwipeRightIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import orderService from '../../services/orderService';

const ValidateOrderForm = ({ open, onClose, order, onOrderValidated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwipeComplete, setIsSwipeComplete] = useState(false);
  const swipeRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleSwipeStart = (e) => {
    if (loading || success) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleSwipeMove = (e) => {
    if (loading || success || !startX.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    currentX.current = clientX;
    const diff = clientX - startX.current;
    const maxWidth = swipeRef.current ? swipeRef.current.offsetWidth - 60 : 200;
    const progress = Math.max(0, Math.min(1, diff / maxWidth));
    setSwipeProgress(progress);
  };

  const handleSwipeEnd = () => {
    if (loading || success) return;
    if (swipeProgress > 0.8) {
      setIsSwipeComplete(true);
      handleSubmit();
    } else {
      setSwipeProgress(0);
    }
    startX.current = 0;
    currentX.current = 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Appel API pour valider l'emballage
      await orderService.packOrder(order.id);
      
      setSuccess(true);
      
      // Informer le parent qu'une commande a été validée
      if (onOrderValidated) {
        onOrderValidated();
      }
      
      // Fermer le dialogue après un court délai
      setTimeout(() => {
        onClose();
        // Reset states
        setSwipeProgress(0);
        setIsSwipeComplete(false);
        setSuccess(false);
        setError('');
      }, 2000);
      
    } catch (err) {
      console.error('Erreur lors de la validation de l\'emballage', err);
      setError(err.message || 'Une erreur est survenue lors de la validation de l\'emballage');
      setSwipeProgress(0);
      setIsSwipeComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSwipeProgress(0);
    setIsSwipeComplete(false);
    setSuccess(false);
    setError('');
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : handleClose}
      maxWidth="sm" 
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : undefined,
          margin: isMobile ? '16px' : undefined,
          borderRadius: isMobile ? '12px' : '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: isMobile ? '1.25rem' : '1.5rem', 
        py: isMobile ? 1.5 : 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: success ? theme.palette.warning.light : theme.palette.background.paper,
        color: success ? theme.palette.warning.contrastText : 'inherit',
        transition: 'all 0.3s ease'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnimatePresence>
            {success ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <PackageIcon sx={{ color: theme.palette.warning.contrastText }} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          {success ? 'Emballage validé !' : 'Valider l\'emballage'}
        </Box>
        {!loading && (
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ 
              color: success ? theme.palette.warning.contrastText : 'inherit',
              opacity: 0.7,
              '&:hover': { opacity: 1 }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
        <DialogContentText sx={{ mb: 2 }}>
          Confirmez la validation de l'emballage de cette commande.
        </DialogContentText>
        
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Référence: <strong>{order.reference}</strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Numéro de chariot: <strong>{order.cart_number}</strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Nombre de lignes: <Chip label={order.line_count || 'Non défini'} color={order.line_count ? 'warning' : 'default'} size="small" />
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Contrôlée le: <strong>
              {order.controlled_at ? 
                format(new Date(order.controlled_at), 'dd MMM yyyy à HH:mm', { locale: fr }) : 
                'Date inconnue'}
            </strong>
          </Typography>
          <Typography variant="subtitle2" gutterBottom>
            Contrôlée par: <strong>{order.controller_details ? order.controller_details.username : 'Non spécifié'}</strong>
          </Typography>
        </Box>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 2,
                  '& .MuiAlert-icon': {
                    animation: 'pulse 1s infinite'
                  }
                }}
              >
                Emballage validé avec succès !
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
      <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3, flexDirection: 'column', gap: 2 }}>
        {!success && (
          <>
            {/* Swipe to validate */}
            <Box
              ref={swipeRef}
              sx={{
                width: '100%',
                height: 60,
                bgcolor: theme.palette.warning.light,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                cursor: loading ? 'not-allowed' : 'grab',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.3s ease'
              }}
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
            >
              {/* Background progress */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${swipeProgress * 100}%`,
                  bgcolor: theme.palette.warning.main,
                  transition: isSwipeComplete ? 'width 0.3s ease' : 'none'
                }}
              />
              
              {/* Swipe button */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 4,
                  left: 4 + (swipeProgress * (swipeRef.current?.offsetWidth - 60 || 200)),
                  width: 52,
                  height: 52,
                  backgroundColor: theme.palette.common.white,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: theme.shadows[3],
                  zIndex: 2
                }}
                animate={{
                  scale: loading ? [1, 1.1, 1] : 1
                }}
                transition={{
                  scale: {
                    duration: 1,
                    repeat: loading ? Infinity : 0
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="warning" />
                ) : (
                  <SwipeRightIcon 
                    sx={{ 
                      color: theme.palette.warning.main,
                      transform: `rotate(${swipeProgress * 360}deg)`,
                      transition: 'transform 0.1s ease'
                    }} 
                  />
                )}
              </motion.div>
              
              {/* Text overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.warning.contrastText,
                  fontWeight: 600,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  opacity: 1 - swipeProgress * 0.7,
                  transition: 'opacity 0.1s ease',
                  pointerEvents: 'none'
                }}
              >
                {loading ? 'Validation en cours...' : 'Glissez pour valider l\'emballage'}
              </Box>
            </Box>
            
            {/* Traditional button as fallback */}
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <Button 
                onClick={handleClose} 
                disabled={loading}
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  flex: 1
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="outlined" 
                color="warning" 
                disabled={loading}
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  flex: 1
                }}
              >
                Validation classique
              </Button>
            </Box>
          </>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%' }}
          >
            <Button 
              onClick={handleClose}
              variant="contained"
              color="warning"
              fullWidth
              sx={{ 
                fontSize: isMobile ? '0.9rem' : '1rem',
                py: 1.5
              }}
            >
              Fermer
            </Button>
          </motion.div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ValidateOrderForm;
