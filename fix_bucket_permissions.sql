-- 1. Garante que o bucket 'etiquetas' esteja configurado como PÚBLICO
-- Isso é essencial para que os links gerados funcionem sem autenticação (ex: no email)
update storage.buckets
set public = true
where id = 'etiquetas';

-- Caso o bucket não exista (o que não parece ser o caso), cria ele:
insert into storage.buckets (id, name, public)
values ('etiquetas', 'etiquetas', true)
on conflict (id) do update set public = true;

-- 2. Habilita RLS (Row Level Security) para segurança
alter table storage.objects enable row level security;

-- 3. Remove políticas antigas para limpar e evitar conflitos
drop policy if exists "Public Access Etiquetas" on storage.objects;
drop policy if exists "Authenticated Upload Etiquetas" on storage.objects;
drop policy if exists "Public Upload Etiquetas" on storage.objects;
drop policy if exists "Acesso Publico Leitura Etiquetas" on storage.objects;
drop policy if exists "Acesso Publico Upload Etiquetas" on storage.objects;

-- 4. Cria política para VISUALIZAÇÃO PÚBLICA (Essencial para os emails)
create policy "Public Access Etiquetas"
on storage.objects for select
using ( bucket_id = 'etiquetas' );

-- 5. Cria política para UPLOAD (INSERT) para usuários AUTENTICADOS
create policy "Authenticated Upload Etiquetas"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'etiquetas' );

-- 6. (Opcional) Política para permitir UPDATE/DELETE se necessário (ex: usuário corrigir etiqueta)
create policy "Authenticated Update Etiquetas"
on storage.objects for update
to authenticated
using ( bucket_id = 'etiquetas' );

create policy "Authenticated Delete Etiquetas"
on storage.objects for delete
to authenticated
using ( bucket_id = 'etiquetas' );
