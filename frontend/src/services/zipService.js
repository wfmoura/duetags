import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Service to handle order asset bundling and ZIP downloads.
 */
export const downloadOrderZip = async (order) => {
    if (!order) return;

    const zip = new JSZip();
    const folder = zip.folder(`Pedido_${order.id.slice(0, 8)}`);

    // 1. Download Label Images
    const labelPromises = (order.etiquetas_urls || []).map(async (url, index) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const blob = await response.blob();
            folder.file(`etiqueta_${index + 1}.png`, blob);
        } catch (error) {
            console.error(`Erro ao baixar etiqueta ${index + 1}:`, error);
        }
    });

    // 2. Download Original Asset (if exists)
    if (order.original_asset_url) {
        try {
            const response = await fetch(order.original_asset_url);
            if (response.ok) {
                const blob = await response.blob();
                folder.file(`tema_original_sem_etiqueta.png`, blob);
            }
        } catch (error) {
            console.error('Erro ao baixar tema original:', error);
        }
    }

    // 3. Add Metadata JSON
    const metadata = {
        order_id: order.id,
        customer: order.customer_email,
        kit: order.kit_nome,
        tema: order.tema_nome,
        customizations: order.customizations,
        label_metadata: order.label_metadata,
        created_at: order.created_at
    };
    folder.file("detalhes_tecnicos_producao.json", JSON.stringify(metadata, null, 2));

    // Generate and Save
    await Promise.allSettled(labelPromises);
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `Producao_DueTags_${order.id.slice(0, 8)}.zip`);
};
