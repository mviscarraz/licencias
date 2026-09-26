import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import Layout from '../../components/Layout.jsx'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [rol, setRol] = useState('secretario')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    const { data } = await supabase.from('perfiles').select('*').in('rol', ['secretario', 'administrador']).order('nombre')
    setUsuarios(data || [])
  }

  useEffect(() => { cargar() }, [])

  async function crearUsuario(e) {
    e.preventDefault()
    setError(''); setOk('')
    setGuardando(true)
    try {
      const { data: sesion } = await supabase.auth.getSession()
      const respuesta = await fetch('/.netlify/functions/crear-usuario', {
        method: 'POST',
        body: JSON.stringify({ token: sesion.session.access_token, correo, contrasena, nombre, rol }),
      })
      const resultado = await respuesta.json()
      if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo crear la cuenta.')
      setOk('Cuenta creada correctamente.')
      setNombre(''); setCorreo(''); setContrasena('')
      cargar()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Layout>
      <h1>Usuarios del sistema</h1>
      <div className="panel">
        <h2>Crear nueva cuenta</h2>
        {error && <div className="mensaje-error">{error}</div>}
        {ok && <div className="mensaje-ok">{ok}</div>}
        <form onSubmit={crearUsuario}>
          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="fila-formulario">
              <label>Rol</label>
              <select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="secretario">Secretario</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>
          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Correo</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>
            <div className="fila-formulario">
              <label>Contraseña inicial</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required minLength={6} />
            </div>
          </div>
          <button className="boton" disabled={guardando}>{guardando ? 'Creando…' : 'Crear cuenta'}</button>
        </form>
      </div>

      <div className="panel">
        <h2>Cuentas existentes</h2>
        <table className="tabla">
          <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr></thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}><td>{u.nombre}</td><td>{u.correo}</td><td>{u.rol}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
