import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { config } from '../config/config';
import supabase from '../utils/supabaseClient';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [temas, setTemas] = useState([]);
    const [kits, setKits] = useState([]);
    const [etiquetas, setEtiquetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [
                { data: temasData, error: temasError },
                { data: kitsData, error: kitsError },
                { data: etiquetasData, error: etiquetasError }
            ] = await Promise.all([
                supabase.from('temas').select('*').order('nome'),
                supabase.from('kits').select(`
                    id, 
                    nome, 
                    thumbnail, 
                    preco,
                    payment_link,
                    pix_code,
                    pix_qrcode_url,
                    kit_etiquetas (
                        etiqueta_id,
                        quantidade,
                        etiquetas (
                            nome
                        )
                    )
                `).order('id'),
                supabase.from('etiquetas').select('*').order('nome')
            ]);

            if (temasError) throw temasError;
            if (kitsError) throw kitsError;
            if (etiquetasError) throw etiquetasError;

            // Normalize kits to include simplified labels structure if needed by other components
            const normalizedKits = kitsData.map(kit => ({
                ...kit,
                preco: typeof kit.preco === 'number' ? kit.preco : parseFloat(kit.preco),
                etiquetas: kit.kit_etiquetas?.map(ke => ({
                    id: ke.etiqueta_id,
                    quantidade: ke.quantidade,
                    nome: ke.etiquetas?.nome
                })) || []
            }));

            setTemas(temasData || []);
            setKits(normalizedKits || []);
            setEtiquetas(etiquetasData || []);
        } catch (err) {
            console.error('Error loading product data from Supabase:', err);
            setError('Erro ao carregar dados dos produtos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getEtiquetaById = (id) => etiquetas.find(e => e.id === id);
    const getKitById = (id) => kits.find(k => k.id === id);
    const getThemeById = (id) => temas.find(t => t.id === id);

    const fontesDisponiveis = config.personalizacao?.fontesDisponiveis || {};

    return (
        <ProductContext.Provider value={{ temas, kits, etiquetas, fontesDisponiveis, isLoading, error, refreshData: loadData, getEtiquetaById, getKitById, getThemeById }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) throw new Error('useProduct must be used within a ProductProvider');
    return context;
};
