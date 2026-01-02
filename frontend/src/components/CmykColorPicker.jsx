import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import tinycolor from 'tinycolor2';

function ModernColorPicker({ selectedColor, onColorSelect, title }) {
  const [color, setColor] = React.useState(selectedColor || '#4A90E2');

  React.useEffect(() => {
    if (selectedColor) setColor(selectedColor);
  }, [selectedColor]);

  const handleColorChange = (newColor) => {
    setColor(newColor);
    onColorSelect(newColor);
  };

  return (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {title}
        </Typography>
      )}
      <Box sx={{
        '& .react-colorful': { width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden' },
        '& .react-colorful__saturation': { borderRadius: '12px 12px 0 0' },
        '& .react-colorful__hue': { height: '12px', borderRadius: '0 0 12px 12px', mt: '8px' },
        mb: 2
      }}>
        <HexColorPicker color={color} onChange={handleColorChange} />
      </Box>
      <TextField
        fullWidth
        size="small"
        value={color.toUpperCase()}
        onChange={(e) => {
          const val = e.target.value;
          if (/^#?[0-9A-F]{0,6}$/i.test(val)) {
            handleColorChange(val.startsWith('#') ? val : `#${val}`);
          }
        }}
        inputProps={{ sx: { fontFamily: 'monospace', fontWeight: 600 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{
                width: 20,
                height: 20,
                borderRadius: '4px',
                backgroundColor: color,
                border: '1px solid rgba(0,0,0,0.1)'
              }} />
            </InputAdornment>
          ),
          sx: { borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.02)' }
        }}
      />
    </Box>
  );
}

export default ModernColorPicker;