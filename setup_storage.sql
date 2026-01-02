-- Criação do Bucket 'etiquetas'
INSERT INTO storage.buckets (id, name, public)
VALUES ('etiquetas', 'etiquetas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Habilitar RLS (Row Level Security) na tabela objects, caso não esteja
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Acesso Publico Leitura Etiquetas" ON storage.objects;
DROP POLICY IF EXISTS "Acesso Publico Upload Etiquetas" ON storage.objects;
DROP POLICY IF EXISTS "Acesso Publico Update Etiquetas" ON storage.objects;

-- Criar política de Leitura Pública (Qualquer um pode ver as imagens)
CREATE POLICY "Acesso Publico Leitura Etiquetas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'etiquetas' );

-- Criar política de Upload Público (Permitir que usuários salvem as etiquetas geradas)
CREATE POLICY "Acesso Publico Upload Etiquetas"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'etiquetas' );

-- Criar política de Atualização Pública (Caso precisem sobrescrever)
CREATE POLICY "Acesso Publico Update Etiquetas"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'etiquetas' );
