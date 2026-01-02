-- Adiciona colunas faltantes na tabela 'orders' para suportar a personalização
-- Execute este script no SQL Editor do Supabase

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS kit_id text,
ADD COLUMN IF NOT EXISTS kit_nome text,
ADD COLUMN IF NOT EXISTS kit_preco numeric,
ADD COLUMN IF NOT EXISTS tema_id text,
ADD COLUMN IF NOT EXISTS tema_nome text,
ADD COLUMN IF NOT EXISTS customizations jsonb,
ADD COLUMN IF NOT EXISTS etiquetas_urls text[];

-- Garante que o usuário possa ver e criar seus próprios pedidos (caso RLS esteja ativado)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
