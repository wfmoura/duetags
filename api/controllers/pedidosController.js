const { createClient } = require("@supabase/supabase-js");
const config = require("../config/config");

const supabase = createClient(config.supabase.url, config.supabase.key);

const getPedidos = async (req, res) => {
  try {
    const { data: pedidos, error } = await supabase
    .from("orders")
    .select(`
        id,
        status,
        created_at,
        user ( id, name ),
        kit ( id, nome ),
        order_labels ( id, label_url, metadata )
      `)
    .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return res.status(500).json({ message: "Erro ao buscar pedidos" });
    }

    res.json({ pedidos });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ message: "Erro ao buscar pedidos" });
  }
};

const downloadEtiqueta = async (req, res) => {
  const { pedidoId, etiquetaId } = req.params;

  try {
    const { data: etiqueta, error } = await supabase
    .from("order_labels")
    .select("label_url, metadata")
    .eq("id", etiquetaId)
    .eq("order_id", pedidoId)
    .single();

    if (error) {
      console.error("Erro ao buscar etiqueta:", error);
      return res.status(500).json({ message: "Erro ao buscar etiqueta" });
    }

    const base64Data = etiqueta.label_url.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="etiqueta-${etiquetaId}.png"`,
    });
    res.end(imgBuffer);
  } catch (error) {
    console.error("Erro ao baixar etiqueta:", error);
    res.status(500).json({ message: "Erro ao baixar etiqueta" });
  }
};

const downloadPedido = async (req, res) => {
  const { pedidoId } = req.params;

  try {
    // TODO: Implementar download do pedido completo
  } catch (error) {
    console.error("Erro ao baixar pedido:", error);
    res.status(500).json({ message: "Erro ao baixar pedido" });
  }
};

module.exports = {
  getPedidos,
  downloadEtiqueta,
  downloadPedido,
};