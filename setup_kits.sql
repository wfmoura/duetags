-- Habilitar a extensão UUID se necessário (opcional, mas boa prática)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Etiquetas
CREATE TABLE IF NOT EXISTS etiquetas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    width NUMERIC(10, 2) NOT NULL,
    height NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    area_delimitada_left NUMERIC(10, 2),
    area_delimitada_top NUMERIC(10, 2),
    area_delimitada_width NUMERIC(10, 2),
    area_delimitada_height NUMERIC(10, 2),
    campos JSONB,
    campos_mesclados JSONB,
    imagem BOOLEAN,
    max_font_size_nome INT,
    max_font_size_complemento INT,
    max_font_size_turma INT,
    proporcao_personagem NUMERIC(10, 2),
    distancia_do_rodape NUMERIC(10, 2)
);

-- Habilitar RLS para etiquetas
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
-- Política de leitura pública para etiquetas
CREATE POLICY "Leitura pública de etiquetas" ON etiquetas FOR SELECT USING (true);

-- Inserir dados iniciais de etiquetas (se não existirem)
INSERT INTO etiquetas (
    id, nome, width, height, tipo, 
    area_delimitada_left, area_delimitada_top, area_delimitada_width, area_delimitada_height,
    campos, campos_mesclados, imagem, 
    max_font_size_nome, max_font_size_complemento, max_font_size_turma,
    proporcao_personagem, distancia_do_rodape
) VALUES 
    ('mini', 'Mini', 3.0, 1.5, 'Mini', 0, 0, 3.0, 1.5, '["nome", "complemento"]', '[]', FALSE, 15, 15, 10, 0.6, NULL),
    ('grande', 'Grande', 8.0, 4.0, 'Grande', 2.9, 0.3, 4.5, 3.2, '["nome", "complemento", "turma"]', '[]', TRUE, 35, 35, 15, 0.8, NULL),
    ('pequena', 'Pequena', 5.0, 1.0, 'Pequena', 1.15, 0.1, 3.6, 0.8, '["nome", "complemento"]', '["nome", "complemento"]', TRUE, 20, 15, 10, 0.6, 0.5),
    ('intermediaria', 'Intermediária', 6.0, 2.5, 'Intermediária', 1.8, 0.2, 3.9, 2.1, '["nome", "complemento"]', '[]', TRUE, 22, 18, 12, 0.8, NULL),
    ('redonda', 'Redonda', 2.5, 2.5, 'redonda', 0.2, 0.2, 2.1, 2.1, '["nome", "complemento"]', '[]', TRUE, 40, 15, 10, 0.3, NULL),
    ('termocolante', 'Termocolante para Roupas', 6.0, 1.5, 'Termocolante para Roupas', 1, 0.1, 4.0, 1.3, '["nome"]', '[]', TRUE, 20, 15, 10, 0.7, NULL)
ON CONFLICT (id) DO NOTHING;


-- 2. Tabela de Kits
CREATE TABLE IF NOT EXISTS kits (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(255),
    preco NUMERIC(10, 2) NOT NULL
);

-- Habilitar RLS para kits
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
-- Política de leitura pública para kits
CREATE POLICY "Leitura pública de kits" ON kits FOR SELECT USING (true);

-- Inserir dados iniciais de kits
INSERT INTO kits (id, nome, thumbnail, preco)
VALUES 
    (1, 'Kit 1', 'images/kits/kit1.jpg', 60.00),
    (2, 'Kit 2', 'images/kits/kit2.jpg', 60.00),
    (3, 'Kit 3', 'images/kits/kit3.jpg', 40.00),
    (4, 'KIT 4', 'images/kits/kit4.jpg', 40.00),
    (5, 'KIT 5', 'images/kits/kit5.jpg', 40.00)
ON CONFLICT (id) DO NOTHING;


-- 3. Tabela de Relacionamento Kit_Etiquetas
CREATE TABLE IF NOT EXISTS kit_etiquetas (
    kit_id INT REFERENCES kits(id) ON DELETE CASCADE,
    etiqueta_id VARCHAR(50) REFERENCES etiquetas(id) ON DELETE CASCADE,
    quantidade INT NOT NULL,
    PRIMARY KEY (kit_id, etiqueta_id)
);

-- Habilitar RLS para kit_etiquetas
ALTER TABLE kit_etiquetas ENABLE ROW LEVEL SECURITY;
-- Política de leitura pública para kit_etiquetas
CREATE POLICY "Leitura pública de kit_etiquetas" ON kit_etiquetas FOR SELECT USING (true);

-- Inserir dados de relacionamento
INSERT INTO kit_etiquetas (kit_id, etiqueta_id, quantidade)
VALUES 
    (1, 'grande', 20),
    (1, 'pequena', 50),
    (2, 'grande', 10),
    (2, 'intermediaria', 9),
    (2, 'redonda', 20),
    (2, 'pequena', 20),
    (2, 'mini', 12),
    (3, 'pequena', 50),
    (3, 'mini', 20),
    (3, 'redonda', 8),
    (4, 'intermediaria', 20),
    (5, 'termocolante', 20)
ON CONFLICT (kit_id, etiqueta_id) DO NOTHING;
