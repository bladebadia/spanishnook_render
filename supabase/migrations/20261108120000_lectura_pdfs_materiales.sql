-- Lectura del bucket privado pdfs_materiales (aplicada en producción el 2026-11-08).
-- createSignedUrl exige SELECT sobre storage.objects: sin esta política solo los admins
-- podían descargar. Puede leer un usuario autenticado si el material está visible y es
-- gratuito (< 0,50 €, mismo umbral que checkout-material) o si lo ha comprado.
drop policy if exists "Descarga de PDFs gratuitos o comprados" on storage.objects;
create policy "Descarga de PDFs gratuitos o comprados" on storage.objects
for select to authenticated
using (
  bucket_id = 'pdfs_materiales'
  and exists (
    select 1 from public.materiales_didacticos m
    where m.archivo_pdf = storage.objects.name
      and m.visible
      and (coalesce(m.precio, 0) < 0.5
           or exists (select 1 from public.compras_materiales c
                      where c.material_id = m.id and c.user_id = (select auth.uid())))
  )
);
