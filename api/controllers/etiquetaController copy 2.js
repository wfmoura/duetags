const { v4: uuidv4 } = require('uuid');
const JSZip = require('jszip');
const config = require('../src/config/config');
// api/controllers/etiquetaController.js
const { gravarEtiquetas } = require('./gravarEtiquetas'); 


// Salvar múltiplas etiquetas
const saveEtiquetas = async (req, res, supabase) => {
  const { etiquetas, userId, cliente, kitId } = req.body;

  if (config.debug.enabled) {
    console.log('[DEBUG] Save etiquetas request:', { userId, etiquetas, cliente, kitId });
  }

  // Validação dos dados de entrada
  //if (!etiquetas || !Array.isArray(etiquetas) || !userId || !cliente || !kitId) {
  //  return res.status(400).json({ success: false, message: 'Dados incompletos ou inválidos' });
  //}

  try {
    // Busca o valor do kit no banco de dados
    
    const { data: kit, error: kitError } = await supabase
      .from('products') // Assumindo que os kits estão na tabela products
      .select('id')
      .eq('id', kitId)
      .single();
      console.log('[DEBUG] Save etiquetas request:', { userId, etiquetas, cliente, kitId });
    if (kitError || !kit) {
      if (config.debug.enabled) {
        console.error('[DEBUG] Erro ao buscar kit:', kitError);
      }
      return res.status(500).json({ success: false, message: 'Erro ao buscar informações do kit' });
    }

    const orderId = uuidv4();

    // Calcula o valor total do pedido
    const totalAmount = etiquetas.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0; // Garante que o preço seja um número
      const quantity = parseInt(item.quantity) || 0; // Garante que a quantidade seja um número
      return sum + price * quantity;
    }, 0);

    if (isNaN(totalAmount)) {
      return res.status(400).json({ success: false, message: 'Erro ao calcular o valor total do pedido' });
    }

    // Cria o pedido no Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        id: orderId, 
        user_id: userId, 
        total_amount: kit.price, 
        status: 'pendente', 
      }])
      .single();

    if (orderError) {
      if (config.debug.enabled) {
        console.error('[DEBUG] Erro ao criar pedido:', orderError);
      }
      return res.status(500).json({ success: false, message: 'Erro ao criar pedido', orderError });
    }

    // Salva os itens do pedido
    const orderItems = etiquetas.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: 1,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      if (config.debug.enabled) {
        console.error('[DEBUG] Erro ao salvar itens do pedido:', itemsError);
      }
      return res.status(500).json({ success: false, message: 'Erro ao salvar itens do pedido' });
    }

    if (config.debug.enabled) {
      console.log('[DEBUG] Pedido criado com sucesso:', orderId);
    }
    res.json({ success: true, orderId });
  } catch (error) {
    if (config.debug.enabled) {
      console.error('[DEBUG] Erro ao criar Pedido:', error);
    }
    res.status(500).json({ success: false, message: 'Erro ao salvar etiquetas' });
  }
    // Gravar as etiquetas em disco
    try {
      await gravarEtiquetas(etiquetas, userId, cliente, kitId);
    } catch (error) {
      // Trate o erro, por exemplo, retornando uma resposta de erro ao cliente
      console.error('Erro ao gravar etiquetas:', error);
      return res.status(500).json({ success: false, message: 'Erro ao gravar etiquetas' });
    }
};






// Obter a lista de pedidos
const getPedidos = async (req, res, supabase) => {
  const { userId } = req.query;

  if (config.debug.enabled) {
    console.log('[DEBUG] Get pedidos request:', { userId });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'ID do usuário é obrigatório' });
  }

  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (ordersError) {
      if (config.debug.enabled) {
        console.error('[DEBUG] Erro ao buscar pedidos:', ordersError);
      }
      return res.status(500).json({ success: false, message: 'Erro ao buscar pedidos' });
    }

    if (config.debug.enabled) {
      console.log('[DEBUG] Pedidos encontrados:', orders);
    }
    res.json({ success: true, orders });
  } catch (error) {
    if (config.debug.enabled) {
      console.error('[DEBUG] Erro ao buscar pedidos:', error);
    }
    res.status(500).json({ success: false, message: 'Erro ao buscar pedidos' });
  }
};

// Baixar todas as etiquetas de um pedido em um arquivo ZIP
const downloadPedido = async (req, res, supabase) => {
  const orderId = req.params.id;

  if (config.debug.enabled) {
    console.log('[DEBUG] Download pedido request:', { orderId });
  }

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'ID do pedido é obrigatório' });
  }

  try {
    // Busca os itens do pedido
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) {
      if (config.debug.enabled) {
        console.error('[DEBUG] Erro ao buscar itens do pedido:', itemsError);
      }
      return res.status(500).json({ success: false, message: 'Erro ao buscar itens do pedido' });
    }

    // Gera o arquivo ZIP
    const zip = new JSZip();
    items.forEach((item, index) => {
      zip.file(`etiqueta_${index + 1}.txt`, `Produto: ${item.product_id}, Quantidade: ${item.quantity}, Preço: ${item.unit_price}`);
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=pedido_${orderId}.zip`);

    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(res)
      .on('finish', () => {
        if (config.debug.enabled) {
          console.log(`[DEBUG] Arquivo ZIP para o pedido ${orderId} gerado com sucesso.`);
        }
      });
  } catch (error) {
    if (config.debug.enabled) {
      console.error('[DEBUG] Erro ao gerar arquivo ZIP:', error);
    }
    res.status(500).json({ success: false, message: 'Erro ao gerar arquivo ZIP' });
  }
};

module.exports = { saveEtiquetas, getPedidos, downloadPedido };