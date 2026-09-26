import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import Layout from '../../components/Layout.jsx'

export default function AlumnoForm() {
  const { id } = useParams()
  const esNuevo = id === 'nuevo'
  const navigate = useNavigate()

  const [nombreCompleto, setNombreCompleto] = useState('')
  const [ci, setCi] = useState('')
  const [codigoEstudiante, setCodigoEstudiante] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')

  const [cursos, setCursos] = useState([])
  const [paralelos, setParalelos] = useState([])
  const [gestiones, setGestiones] = useState([])
  const [cursoId, setCursoId] = useState('')
  const [paraleloId, setParaleloId] = useState('')
  const [gestionId, setGestionId] = useState('')

  const [alumnoId, setAlumnoId] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargarCatalogos() {
      const [{ data: c }, { data: p }, { data: g }] = await Promise.all([
        supabase.from('cursos').select('*').order('nombre'),
        supabase.from('paralelos').select('*').order('nombre'),
        supabase.from('gestiones_escolares').select('*').eq('activa', true).order('nombre'),
      ])
      setCursos(c || [])
      setParalelos(p || [])
      setGestiones(g || [])
      if (g && g.length > 0) setGestionId(g[0].id)
    }
    cargarCatalogos()

    if (!esNuevo) {
      supabase.from('alumnos').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setAlumnoId(data.id)
          setNombreCompleto(data.nombre_completo)
          setCi(data.ci || '')
          setCodigoEstudiante(data.codigo_estudiante || '')
          setTelefono(data.telefono || '')
          setCorreo(data.correo || '')
        }
      })
    }
  }, [id])

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      if (esNuevo) {
        const { data: sesion } = await supabase.auth.getSession()
        const respuesta = await fetch('/.netlify/functions/crear-usuario', {
          method: 'POST',
          body: JSON.stringify({
            token: sesion.session.access_token,
            correo,
            contrasena,
            nombre: nombreCompleto,
            rol: 'alumno',
          }),
        })
        const resultado = await respuesta.json()
        if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo crear la cuenta.')

        const { data: nuevoAlumno, error: errAlumno } = await supabase
          .from('alumnos')
          .insert({
            perfil_id: resultado.id,
            nombre_completo: nombreCompleto,
            ci, codigo_estudiante: codigoEstudiante, telefono, correo,
          })
          .select().single()
        if (errAlumno) throw errAlumno

        if (cursoId && paraleloId && gestionId) {
          await supabase.from('matriculas').insert({
            alumno_id: nuevoAlumno.id, curso_id: cursoId, paralelo_id: paraleloId, gestion_id: gestionId,
          })
        }
      } else {
        await supabase.from('alumnos').update({
          nombre_completo: nombreCompleto, ci, codigo_estudiante: codigoEstudiante, telefono, correo,
        }).eq('id', alumnoId)

        if (cursoId && paraleloId && gestionId) {
          await supabase.from('matriculas')
            .upsert({ alumno_id: alumnoId, curso_id: cursoId, paralelo_id: paraleloId, gestion_id: gestionId }, { onConflict: 'alumno_id,gestion_id' })
        }
      }

      navigate('/admin/alumnos')
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Layout>
      <h1>{esNuevo ? 'Registrar alumno' : 'Editar alumno'}</h1>
      <div className="panel">
        {error && <div className="mensaje-error">{error}</div>}
        <form onSubmit={manejarEnvio}>
          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Nombre completo</label>
              <input value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
            </div>
            <div className="fila-formulario">
              <label>CI</label>
              <input value={ci} onChange={(e) => setCi(e.target.value)} />
            </div>
          </div>

          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Código de estudiante</label>
              <input value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} />
            </div>
            <div className="fila-formulario">
              <label>Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
          </div>

          <div className="fila-formulario">
            <label>Correo</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required disabled={!esNuevo} />
          </div>

          {esNuevo && (
            <div className="fila-formulario">
              <label>Contraseña inicial</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required minLength={6} />
            </div>
          )}

          <h3>Matrícula de la gestión actual</h3>
          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Gestión escolar</label>
              <select value={gestionId} onChange={(e) => setGestionId(e.target.value)}>
                {gestiones.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
              </select>
            </div>
            <div className="fila-formulario">
              <label>Curso</label>
              <select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
                <option value="">Selecciona</option>
                {cursos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="fila-formulario">
            <label>Paralelo</label>
            <select value={paraleloId} onChange={(e) => setParaleloId(e.target.value)}>
              <option value="">Selecciona</option>
              {paralelos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <button className="boton" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </form>
      </div>
    </Layout>
  )
}
