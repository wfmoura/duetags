import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from './config/config';
import JSZip from 'jszip';

// Export the Supabase client so it can be used elsewhere
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create an Axios instance for external API calls if needed, 
// but Supabase client should be preferred for backend interactions.
const api = axios.create({
    baseURL: 'http://localhost:3001/', // Keep for now if other endpoints exist, but auth should move to Supabase
    withCredentials: true, 
});

export const saveEtiquetas = async (etiquetas, userId, cliente, kitId) => {
    try {
        // 1. Salvar as etiquetas no Supabase
        const { data: newEtiquetas, error: sbError } =
            await supabase.from('etiqueta').insert([
                {
                    user_id: userId,
                    etiquetas: etiquetas,
                    cliente,
                    kit_id: kitId,
                },
            ]).select();

        if (sbError) {
            console.error(
                'Erro ao salvar etiquetas no Supabase:',
                sbError
            );
            return { success: false, message: sbError.message };
        }

        // 2. We are no longer calling the local API for this.
        // If there is additional logic (emails, processing), it should be moved to Supabase Edge Functions or Triggers.
        
        return { success: true, data: newEtiquetas };
    } catch (error) {
        console.error('Erro ao salvar etiquetas:', error);
        return { success: false, message: error.message };
    }
};

export const getPedidos = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(
                `
                id,
                total_amount,
                status,
                created_at,
                order_items (
                  product_id,
                  quantity,
                  unit_price,
                  products (
                    name
                  )
                )
              `
            )
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao buscar pedidos:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return { success: false, message: error.message };
    }
};


export const downloadPedido = async (orderId) => {
    try {
        const { data, error } = await supabase
            .from('etiqueta')
            .select('*')
            .eq('order_id', orderId);
        if (error) {
            console.error('Erro ao buscar etiquetas do pedido:', error);
            return { success: false, message: error.message };
        }

        const zip = new JSZip();
        data.forEach((etiqueta) => {
            etiqueta.etiquetas.forEach((e) => {
                zip.file(e.nome, e.image, { base64: true });
            });
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pedido_${orderId}.zip`;
        link.click();
    } catch (error) {
        console.error('Erro ao gerar arquivo ZIP:', error);
        return { success: false, message: error.message };
    }
};

export default api;
