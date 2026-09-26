// Esta función corre en el servidor de Netlify, nunca en el navegador.
// Usa la Service Role Key de Supabase (variable de entorno, nunca en el frontend)
// para crear cuentas de usuario sin que el administrador tenga que entrar a Supabase.

const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' }
  }

  try {
    const { token, correo, contrasena, nombre, rol } = JSON.parse(event.body)

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabaseAdmin = createClient(supabaseUrl, serviceKey)

    // Verifica que quien llama es un administrador autenticado
    const { data: userData, error: errUsuario } = await supabaseAdmin.auth.getUser(token)
    if (errUsuario || !userData?.user) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado.' }) }
    }

    const { data: perfilLlamador } = await supabaseAdmin
      .from('perfiles').select('rol').eq('id', userData.user.id).single()

    if (perfilLlamador?.rol !== 'administrador') {
      return { statusCode: 403, body: JSON.stringify({ error: 'Solo un administrador puede crear cuentas.' }) }
    }

    // Crea el usuario (el trigger de la base de datos crea su perfil con rol "alumno" por defecto)
    const { data: nuevo, error: errCrear } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
      user_metadata: { nombre },
    })

    if (errCrear) {
      return { statusCode: 400, body: JSON.stringify({ error: errCrear.message }) }
    }

    // Si el rol solicitado no es "alumno", lo actualizamos
    if (rol && rol !== 'alumno') {
      await supabaseAdmin.from('perfiles').update({ rol }).eq('id', nuevo.user.id)
    }

    return { statusCode: 200, body: JSON.stringify({ id: nuevo.user.id }) }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) }
  }
}
