import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: window.location.origin + '/login',
    })
    if (error) setError('No se pudo enviar el correo. Verifica la dirección.')
    else setEnviado(true)
  }

  return (
    <div className="pantalla-login">
      <form className="tarjeta-login" onSubmit={manejarEnvio}>
        <h1 style={{ fontSize: '1.2rem' }}>Recuperar contraseña</h1>
        {enviado ? (
          <p className="mensaje-ok">Revisa tu correo para continuar con el restablecimiento.</p>
        ) : (
          <>
            {error && <div className="mensaje-error">{error}</div>}
            <div className="fila-formulario">
              <label>Correo</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>
            <button className="boton" style={{ width: '100%' }}>Enviar enlace</button>
          </>
        )}
        <p style={{ marginTop: 14, fontSize: '0.85rem' }}>
          <Link to="/login">Volver al inicio de sesión</Link>
        </p>
      </form>
    </div>
  )
}
