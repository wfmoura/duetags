// api/controllers/gravarEtiquetas.js

const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken'); // Para validar o token
const fs = require('fs');
const path = require('path');

// Configurar o Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para validar token JWT
const validarToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.user_id; // Retorna o ID do usuário se o token for válido
    } catch (err) {
        console.error("[ERRO] Token inválido:", err);
        return null;
    }
};

// Função para gravar etiquetas no Supabase
const gravarEtiquetas = async (req, res) => {
    const userId = validarToken(req);
    if (!userId) {
        return res.status(401).json({ error: "Token inválido ou ausente." });
    }

    const { etiquetas } = req.body;
    if (!etiquetas || !Array.isArray(etiquetas)) {
        return res.status(400).json({ error: "Dados inválidos." });
    }

    try {
        console.log("[INFO] Iniciando gravação das etiquetas no Supabase");

        const savedEtiquetas = [];

        for (const [index, etiqueta] of etiquetas.entries()) {
            if (!etiqueta.imagem.startsWith("data:image/png;base64,")) {
                console.error("[ERRO] Formato de imagem inválido");
                continue;
            }

            // Criar nome do arquivo para o Supabase
            const nomeArquivo = `etiqueta_${userId}_${Date.now()}_${index}.png`;
            const base64Data = etiqueta.imagem.replace(/^data:image\/png;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            // Upload para o Supabase Storage
            const { data, error } = await supabase.storage
                .from("etiquetas")
                .upload(nomeArquivo, buffer, {
                    contentType: "image/png",
                    upsert: false, // Evita sobrescrever arquivos existentes
                });

            if (error) {
                console.error("[ERRO] Falha no upload da etiqueta:", error);
                continue;
            }

            // Obter a URL pública da imagem
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/etiquetas/${nomeArquivo}`;

            // Salvar metadados no banco de dados
            const { error: dbError } = await supabase.from("etiquetas").insert([
                {
                    user_id: userId,
                    cliente: etiqueta.cliente || "Desconhecido",
                    kit_id: etiqueta.kitId || null,
                    imagem_url: publicUrl,
                    fonte: etiqueta.fonte || "Padrão",
                    criado_em: new Date().toISOString(),
                },
            ]);

            if (dbError) {
                console.error("[ERRO] Falha ao salvar metadados no banco:", dbError);
            } else {
                console.log("[SUCESSO] Etiqueta salva:", publicUrl);
                savedEtiquetas.push(publicUrl);
            }
        }

        res.status(200).json({ message: "Etiquetas salvas com sucesso!", etiquetas: savedEtiquetas });
    } catch (err) {
        console.error("[ERRO] Erro ao processar etiquetas:", err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
};

module.exports = { gravarEtiquetas };
