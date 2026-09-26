-- ============================================================
-- PASO 2: convertir en administrador al usuario que creaste
-- ============================================================
-- Antes de ejecutar esto:
-- 1. Ve a Authentication > Users en el panel de Supabase.
-- 2. Crea un usuario nuevo con el correo y contraseña que tú quieras
--    para ser el administrador del sistema.
-- 3. Reemplaza abajo 'correo@ejemplo.com' por el correo exacto
--    que usaste, y ejecuta este script en el SQL Editor.
-- ============================================================

update perfiles
set rol = 'administrador'
where id = (select id from auth.users where email = 'correo@ejemplo.com');

-- Verifica que funcionó:
select correo, rol from perfiles where correo = 'correo@ejemplo.com';
