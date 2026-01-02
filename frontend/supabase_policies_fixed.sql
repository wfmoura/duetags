-- O erro ocorreu porque o RLS já vem habilitado por padrão e você não tem permissão de superusuário para alterá-lo.
-- Execute APENAS os comandos abaixo para criar as políticas.

-- 1. Permite VISUALIZAÇÃO PÚBLICA (Qualquer um pode ver as imagens)
create policy "Public Access Etiquetas"
on storage.objects for select
using ( bucket_id = 'etiquetas' );

-- 2. Permite UPLOAD para usuários AUTENTICADOS
create policy "Authenticated Upload Etiquetas"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'etiquetas' );

-- CASO AINDA DÊ ERRO DE PERMISSÃO AO FINALIZAR O PEDIDO:
-- Execute o comando abaixo para liberar upload para TODOS (apenas para teste):
/*
create policy "Public Upload Etiquetas"
on storage.objects for insert
to public
with check ( bucket_id = 'etiquetas' );
*/
