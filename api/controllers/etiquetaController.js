const { v4: uuidv4 } = require('uuid');
const JSZip = require('jszip');
const supabase = require('../config/supabase');
const { gravarEtiquetas } = require('./gravarEtiquetas'); 



// 📌 Salvar múltiplas etiquetas
const saveEtiquetas = async (req, res) => {
  console.log('saveEtiquetas:', typeof saveEtiquetas); // Deve ser "function"

  const { etiquetas, userId, cliente, kitId } = req.body;
  console.log('[INFO] Iniciando saveEtiquetas...', { etiquetas, userId, cliente, kitId });

  try {
    // 🔹 Buscar preço do kit no banco de dados
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('preco')
      .eq('id', kitId);

    if (kitError || !kit || kit.length === 0) {
      console.error('[ERRO] Kit não encontrado:', kitError);
      return res.status(404).json({ success: false, message: 'Kit não encontrado', error: kitError });
    }

    console.log('[INFO] Preço do kit encontrado:', kit[0].preco);
    const orderId = uuidv4();
    
    // 🔹 Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ id: orderId, user_id: userId, total_amount: kit[0].preco, status: 'pendente' }])
      .select();

    if (orderError) {
      console.error('[ERRO] Falha ao criar pedido:', orderError);
      return res.status(500).json({ success: false, message: 'Erro ao criar pedido', error: orderError });
    }

    console.log('[INFO] Pedido criado:', order[0]);

    // 🔹 Processamento das etiquetas
    const etiquetasInseridas = [];
    for (let i = 0; i < etiquetas.length; i++) {
      const etiqueta = etiquetas[i];
      console.log(`[INFO] Processando etiqueta ${i + 1}...`);

      try {
        // 🔹 Upload da imagem
        const { data: imagemStorage, error: storageError } = await supabase
          .storage
          .from('duetagsBucket')
          .upload(`etiqueta-${orderId}-${i}.png`, etiqueta.imagem, {
            contentType: 'image/png',
            upsert: true,
            meta: { order_id: orderId }
          });

        if (storageError) {
          console.error('[ERRO] Falha no upload:', storageError);
          return res.status(500).json({ success: false, message: 'Erro no upload da imagem', error: storageError });
        }

        const publicUrl = supabase.storage
          .from('duetagsBucket')
          .getPublicUrl(imagemStorage.path);

        console.log('[INFO] Imagem salva:', publicUrl);

        // 🔹 Salvar etiqueta no banco de dados
        const { data: newEtiqueta, error: sbError } = await supabase
          .from('order_etiquetas')
          .insert([{ order_id: orderId, etiqueta_id: etiqueta.id, dados: etiqueta, imagem_url: publicUrl.publicUrl }])
          .select();

        if (sbError) {
          console.error('[ERRO] Falha ao salvar etiqueta:', sbError);
          return res.status(500).json({ success: false, message: 'Erro ao salvar etiqueta', error: sbError });
        }

        console.log('[INFO] Etiqueta salva:', newEtiqueta);
        etiquetasInseridas.push(newEtiqueta);

      } catch (error) {
        console.error(`[ERRO] Falha ao processar etiqueta ${i + 1}:`, error);
      }
    }

    console.log('[INFO] Todas as etiquetas processadas.');
    res.json({ success: true, orderId });

  } catch (error) {
    console.error('[ERRO] Falha geral ao salvar etiquetas:', error);
    res.status(500).json({ success: false, message: 'Erro ao salvar etiquetas', error: error.message });
  }
};

// 📌 Obter lista de pedidos do usuário
const getPedidos = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    console.error('[ERRO] ID do usuário é obrigatório.');
    return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
  }

  console.log(`[INFO] Buscando pedidos para userId: ${userId}`);

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('[ERRO] Falha ao buscar pedidos:', error);
      return res.status(500).json({ success: false, message: 'Erro ao buscar pedidos', error });
    }

    console.log(`[INFO] ${orders.length} pedidos encontrados.`);
    return res.json({ success: true, data: orders });

  } catch (error) {
    console.error('[ERRO] Erro inesperado ao buscar pedidos:', error);
    return res.status(500).json({ success: false, message: 'Erro ao buscar pedidos', error: error.message });
  }
};

// 📌 Baixar etiquetas de um pedido em um arquivo ZIP
const downloadPedido = async (req, res) => {
  const orderId = req.params.id;

  if (!orderId) {
    console.error('[ERRO] ID do pedido é obrigatório.');
    return res.status(400).json({ success: false, message: 'ID do pedido é obrigatório' });
  }

  console.log(`[INFO] Iniciando download do pedido ${orderId}`);

  try {
    // 🔹 Buscar etiquetas do pedido
    const { data: items, error: itemsError } = await supabase
      .from('order_etiquetas')
      .select('etiqueta_id, dados, imagem_url')
      .eq('order_id', orderId);

    if (itemsError || !items || items.length === 0) {
      console.error('[ERRO] Nenhuma etiqueta encontrada:', itemsError);
      return res.status(404).json({ success: false, message: 'Nenhuma etiqueta encontrada', error: itemsError });
    }

    // 🔹 Criar ZIP
    const zip = new JSZip();
    items.forEach((item, index) => {
      zip.file(
        `etiqueta_${index + 1}.txt`,
        `Nome: ${item.dados.nome}\nComplemento: ${item.dados.complemento}\nTurma: ${item.dados.turma}\nImagem: ${item.imagem_url}`
      );
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=pedido_${orderId}.zip`);

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res)
      .on('finish', () => console.log(`[INFO] ZIP gerado para pedido ${orderId}`));

  } catch (error) {
    console.error('[ERRO] Falha ao gerar ZIP:', error);
    return res.status(500).json({ success: false, message: 'Erro ao gerar ZIP', error: error.message });
  }
};

module.exports = { saveEtiquetas, getPedidos, downloadPedido };
