import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CartItem = ({ item }) => {
    const { removeFromCart } = useContext(AppContext);

    return (
        <Card key={item.id} sx={{ mb: 2 }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        {item?.thumbnail && (
                            <img
                                src={item.thumbnail}
                                alt={item.nome}
                                style={{ width: '100%', borderRadius: '8px' }}
                            />
                        )}
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h6">{item.nome}</Typography>
                        <Typography variant="body1">
                            Preço: {item.preco}
                        </Typography>
                        <Box mt={2}>
                            <IconButton
                                color="error"
                                onClick={() => removeFromCart(item.id)}
                                aria-label="remover"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default CartItem;