-- 1. Habilita RLS na tabela de objetos de armazenamento (geralmente já habilitado)
alter table storage.objects enable row level security;

-- 2. Remove políticas antigas para evitar conflitos (opcional, mas recomendado se você já tentou criar algo)
drop policy if exists "Public Access Etiquetas" on storage.objects;
drop policy if exists "Authenticated Upload Etiquetas" on storage.objects;
drop policy if exists "Public Upload Etiquetas" on storage.objects;

-- 3. Cria política para PERMITIR VISUALIZAÇÃO PÚBLICA (Qualquer um pode ver as imagens)
create policy "Public Access Etiquetas"
on storage.objects for select
using ( bucket_id = 'etiquetas' );

-- 4. Cria política para PERMITIR UPLOAD (INSERT) para usuários AUTENTICADOS
-- Se você quiser permitir upload sem login, mude 'to authenticated' para 'to public' ou remova a linha 'to'
create policy "Authenticated Upload Etiquetas"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'etiquetas' );

-- 5. (Opcional) Política para permitir upload público (caso o login esteja falhando ou seja um teste)
-- Descomente as linhas abaixo se ainda tiver problemas mesmo logado
/*
create policy "Public Upload Etiquetas"
on storage.objects for insert
to public
with check ( bucket_id = 'etiquetas' );
*/
