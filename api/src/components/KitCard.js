import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';

const KitCard = ({ kit }) => {
  return (
    <Card>
      <CardMedia
        component="img"
        height="340"
        image={kit.thumbnail}
        alt={kit.nome}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {kit.nome}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {kit.preco}
        </Typography>
        <Button size="small">Ver Detalhes</Button>
      </CardContent>
    </Card>
  );
};

export default KitCard;