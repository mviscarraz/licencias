# Licencias Escolares

## 1. Base de datos (Supabase)

1. Crea un proyecto en https://supabase.com
2. Ve a **SQL Editor** → pega y ejecuta todo el contenido de `supabase/schema.sql`
3. Ve a **Authentication → Users** → crea un usuario con el correo y contraseña que quieras usar como administrador
4. Vuelve al **SQL Editor**, abre `supabase/paso2-hacer-administrador.sql`, reemplaza el correo de ejemplo por el que usaste, y ejecútalo
5. Ve a **Settings → API** y copia el **Project URL** y la **anon/public key**

## 2. Variables de conexión

Copia `.env.example` como `.env` y coloca ahí el Project URL y la anon key.

## 3. Ejecutar en tu computadora (opcional, para probar)

```
npm install
npm run dev
```

## 4. Publicar en Netlify

1. Sube este proyecto a un repositorio (GitHub, GitLab, etc.) o arrastra la carpeta a Netlify
2. En Netlify, en variables de entorno del sitio, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (la encuentras en Supabase → Settings → API → "service_role", **nunca la pongas en el frontend**, esta solo la usa la función del servidor)
3. Netlify detecta automáticamente el comando de build (`npm run build`) y la carpeta `dist`

Con eso el sitio queda funcionando, con el administrador que creaste en el paso 3 pudiendo entrar y, desde la pantalla "Usuarios del sistema", crear cuentas de secretarios u otros administradores, y desde "Alumnos", registrar alumnos.
