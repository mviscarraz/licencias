import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext.jsx'
import Layout from '../../components/Layout.jsx'

export default function NuevaSolicitud() {
  const { perfil } = useAuth()
  const navigate = useNavigate()

  const [tipos, setTipos] = useState([])
  const [matricula, setMatricula] = useState(null)
  const [alumnoId, setAlumnoId] = useState(null)
  const [tipoLicenciaId, setTipoLicenciaId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [archivos, setArchivos] = useState([])
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data: alumno } = await supabase
        .from('alumnos').select('id').eq('perfil_id', perfil.id).single()
      if (!alumno) return
      setAlumnoId(alumno.id)

      const { data: mat } = await supabase
        .from('matriculas')
        .select('id, gestiones_escolares(activa)')
        .eq('alumno_id', alumno.id)
        .order('creado_en', { ascending: false })
        .limit(1)
        .single()
      setMatricula(mat || null)

      const { data: tiposData } = await supabase
        .from('tipos_licencia').select('id, nombre').eq('activo', true).order('nombre')
      setTipos(tiposData || [])
    }
    if (perfil) cargar()
  }, [perfil])

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')

    if (!matricula) {
      setError('No tienes una matrícula registrada para esta gestión. Contacta a la administración.')
      return
    }

    setEnviando(true)
    const { data: solicitud, error: errSolicitud } = await supabase
      .from('solicitudes')
      .insert({
        alumno_id: alumnoId,
        matricula_id: matricula.id,
        tipo_licencia_id: tipoLicenciaId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        cantidad: cantidad || null,
        observaciones,
      })
      .select()
      .single()

    if (errSolicitud) {
      setError('No se pudo registrar la solicitud. Intenta de nuevo.')
      setEnviando(false)
      return
    }

    for (const archivo of archivos) {
      const ruta = `${solicitud.id}/${Date.now()}-${archivo.name}`
      const { error: errSubida } = await supabase.storage
        .from('documentos-solicitudes')
        .upload(ruta, archivo)
      if (!errSubida) {
        await supabase.from('documentos_solicitud').insert({
          solicitud_id: solicitud.id,
          ruta_storage: ruta,
          nombre_archivo: archivo.name,
          tipo_archivo: archivo.type,
        })
      }
    }

    setEnviando(false)
    navigate(`/alumno/solicitudes/${solicitud.id}`)
  }

  return (
    <Layout>
      <h1>Nueva solicitud de licencia</h1>
      <div className="panel">
        {error && <div className="mensaje-error">{error}</div>}
        <form onSubmit={manejarEnvio}>
          <div className="fila-formulario">
            <label>Tipo de licencia</label>
            <select value={tipoLicenciaId} onChange={(e) => setTipoLicenciaId(e.target.value)} required>
              <option value="">Selecciona un tipo</option>
              {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          <div className="dos-columnas">
            <div className="fila-formulario">
              <label>Fecha de inicio</label>
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div className="fila-formulario">
              <label>Fecha de finalización</label>
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
          </div>

          <div className="fila-formulario">
            <label>Cantidad de días u horas</label>
            <input type="number" step="0.5" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>

          <div className="fila-formulario">
            <label>Observaciones</label>
            <textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>

          <div className="fila-formulario">
            <label>Documentos de respaldo (puedes tomar una foto desde el celular)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              capture="environment"
              onChange={(e) => setArchivos(Array.from(e.target.files))}
            />
          </div>

          <button className="boton" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
