import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { rutaInicioPorRol } from '../components/RutaProtegida.jsx'

export default function Login() {
  const { sesion, perfil, iniciarSesion } = useAuth()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (sesion && perfil) return <Navigate to={rutaInicioPorRol(perfil.rol)} replace />

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    const err = await iniciarSesion(correo, contrasena)
    setCargando(false)
    if (err) setError('Correo o contraseña incorrectos.')
  }

  return (
    <div className="pantalla-login">
      <form className="tarjeta-login" onSubmit={manejarEnvio}>
        <h1 style={{ fontSize: '1.3rem' }}>Licencias Escolares</h1>
        <p style={{ color: '#4a5568', fontSize: '0.88rem', marginBottom: 20 }}>
          Ingresa con tu correo y contraseña.
        </p>
        {error && <div className="mensaje-error">{error}</div>}
        <div className="fila-formulario">
          <label>Correo</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="fila-formulario">
          <label>Contraseña</label>
          <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        </div>
        <button className="boton" style={{ width: '100%' }} disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p style={{ marginTop: 14, fontSize: '0.85rem' }}>
          <Link to="/recuperar-password">Olvidé mi contraseña</Link>
        </p>
      </form>
    </div>
  )
}
