import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCartDB, addToCartDB, removeFromCartDB, clearCartDB } from '../utils/indexedDBHelper';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadCart = useCallback(async () => {
        try {
            const savedCart = await getCartDB();
            setCart(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (item) => {
        const simplifiedItem = {
            id: item.id || Date.now(),
            nome: item.nome,
            preco: item.preco,
            thumbnail: item.thumbnail,
            customizations: item.customizations || {},
        };
        await addToCartDB(simplifiedItem);
        await loadCart();
    }, [loadCart]);

    const removeFromCart = useCallback(async (itemId) => {
        await removeFromCartDB(itemId);
        await loadCart();
    }, [loadCart]);

    const clearCart = useCallback(async () => {
        await clearCartDB();
        setCart([]);
    }, []);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const total = cart.reduce((acc, item) => {
        const price = typeof item.preco === 'number' ? item.preco : parseFloat(item.preco.replace('R$', '').replace(',', '.'));
        return acc + price;
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total, isLoading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
