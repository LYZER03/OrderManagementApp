import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

/**
 * SwipeToValidate
 * Slider "swipe to validate" mobile/desktop.
 * Props :
 *   - onSwipe: callback après swipe complet
 *   - label: texte affiché (défaut: 'Swipe to validate')
 *   - color: couleur principale (défaut: #d4ff4d)
 *   - textColor: couleur du texte (défaut: #fff)
 */

/**
 * SwipeToValidate
 * Un slider "swipe to complete" pour la validation de commande sur mobile.
 * Props :
 *   - onSwipe: callback appelé après un swipe complet
 *   - label: texte à afficher
 *   - color: couleur principale (optionnel)
 */
const SwipeToValidate = ({
  onSwipe,
  label = 'Swipe to validate',
  color = '#d4ff4d',
  textColor = '#fff'
}) => {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sliderRef = useRef();

  // Gestion du drag
  const handleStart = () => { if (!completed) setDragging(true); };
  const handleMove = e => {
    if (!dragging || completed) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    let newX = clientX - rect.left - 32;
    newX = Math.max(0, Math.min(newX, rect.width - 64));
    setDragX(newX);
  };
  const handleEnd = () => {
    setDragging(false);
    if (!sliderRef.current) return;
    if (dragX > sliderRef.current.offsetWidth - 100) {
      setCompleted(true);
      setDragX(sliderRef.current.offsetWidth - 64);
      setTimeout(() => {
        onSwipe && onSwipe();
        setTimeout(() => {
          setCompleted(false);
          setDragX(0);
        }, 800);
      }, 300);
    } else {
      setDragX(0);
    }
  };

  // Styles factorisés
  const sliderSx = {
    width: '100%',
    maxWidth: 370,
    height: 56,
    borderRadius: 28,
    bgcolor: '#fff',
    position: 'relative',
    userSelect: 'none',
    overflow: 'hidden',
    boxShadow: 2,
    mx: 'auto',
    my: 2,
    opacity: completed ? 0.7 : 1,
    transition: 'opacity 0.2s'
  };
  const labelSx = {
    color: textColor,
    position: 'absolute',
    left: 72,
    top: '50%',
    transform: 'translateY(-50%)',
    fontWeight: 500,
    fontSize: 18,
    opacity: dragging || completed ? 0.7 : 1,
    pointerEvents: 'none',
    transition: 'opacity 0.2s'
  };
  const buttonSx = {
    width: 56,
    height: 56,
    borderRadius: '50%',
    bgcolor: color,
    position: 'absolute',
    left: dragX,
    top: 0,
    boxShadow: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: completed ? 'default' : 'pointer',
    transition: dragging ? 'none' : 'left 0.3s cubic-bezier(.4,2,.6,1)',
    zIndex: 2
  };

  return (
    <Box
      ref={sliderRef}
      sx={sliderSx}
      onMouseMove={handleMove}
      onMouseLeave={handleEnd}
      onMouseUp={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      <Typography sx={labelSx}>
        {completed ? 'Validé !' : label}
      </Typography>
      <Box
        sx={buttonSx}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <ArrowForwardIosIcon sx={{ color: '#fff', fontSize: 32, ml: 0.5 }} />
      </Box>
    </Box>
  );
};

export default SwipeToValidate;
