import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext.jsx'
import EtiquetaEstado from './EtiquetaEstado.jsx'

export default function DetalleSolicitudStaff({ rutaVolver }) {
  const { id } = useParams()
  const { perfil } = useAuth()
  const [solicitud, setSolicitud] = useState(null)
  const [documentos, setDocumentos] = useState([])
  const [historial, setHistorial] = useState([])
  const [motivo, setMotivo] = useState('')
  const [mostrarMotivo, setMostrarMotivo] = useState(false)
  const [error, setError] = useState('')
  const [procesando, setProcesando] = useState(false)

  async function cargar() {
    const { data } = await supabase
      .from('solicitudes')
      .select('*, tipos_licencia(nombre), alumnos(nombre_completo, ci, codigo_estudiante), matriculas(cursos(nombre), paralelos(nombre), gestiones_escolares(nombre))')
      .eq('id', id)
      .single()
    setSolicitud(data)

    const { data: docs } = await supabase.from('documentos_solicitud').select('*').eq('solicitud_id', id)
    const conUrl = await Promise.all((docs || []).map(async (d) => {
      const { data: firmada } = await supabase.storage.from('documentos-solicitudes').createSignedUrl(d.ruta_storage, 3600)
      return { ...d, url: firmada?.signedUrl }
    }))
    setDocumentos(conUrl)

    const { data: res } = await supabase
      .from('resoluciones').select('*').eq('solicitud_id', id).order('fecha', { ascending: false })
    setHistorial(res || [])
  }

  useEffect(() => { cargar() }, [id])

  async function aprobar() {
    setError('')
    setProcesando(true)
    const { error: err1 } = await supabase
      .from('solicitudes').update({ estado: 'aprobada', motivo_rechazo: null }).eq('id', id)
    if (!err1) {
      await supabase.from('resoluciones').insert({ solicitud_id: id, resuelto_por: perfil.id, decision: 'aprobada' })
      await cargar()
    } else setError('No se pudo aprobar la solicitud.')
    setProcesando(false)
  }

  async function rechazar() {
    if (!motivo.trim()) { setError('El motivo de rechazo es obligatorio.'); return }
    setError('')
    setProcesando(true)
    const { error: err1 } = await supabase
      .from('solicitudes').update({ estado: 'rechazada', motivo_rechazo: motivo }).eq('id', id)
    if (!err1) {
      await supabase.from('resoluciones').insert({ solicitud_id: id, resuelto_por: perfil.id, decision: 'rechazada', motivo_rechazo: motivo })
      setMostrarMotivo(false)
      setMotivo('')
      await cargar()
    } else setError('No se pudo rechazar la solicitud.')
    setProcesando(false)
  }

  async function revertir() {
    setError('')
    setProcesando(true)
    const { error: err1 } = await supabase
      .from('solicitudes').update({ estado: 'pendiente', motivo_rechazo: null }).eq('id', id)
    if (!err1) {
      await supabase.from('resoluciones').insert({ solicitud_id: id, resuelto_por: perfil.id, decision: 'revertida' })
      await cargar()
    } else setError('No se pudo revertir la decisión.')
    setProcesando(false)
  }

  if (!solicitud) return <p>Cargando…</p>

  return (
    <>
      <p><Link to={rutaVolver}>← Volver al listado</Link></p>
      <h1>{solicitud.alumnos?.nombre_completo}</h1>
      <p style={{ color: '#4a5568' }}>
        CI {solicitud.alumnos?.ci} · Código {solicitud.alumnos?.codigo_estudiante}
        {solicitud.matriculas && <> · {solicitud.matriculas.cursos?.nombre} "{solicitud.matriculas.paralelos?.nombre}" · {solicitud.matriculas.gestiones_escolares?.nombre}</>}
      </p>

      {error && <div className="mensaje-error">{error}</div>}

      <div className="panel">
        <p><EtiquetaEstado estado={solicitud.estado} /></p>
        <p><strong>Tipo:</strong> {solicitud.tipos_licencia?.nombre}</p>
        <p><strong>Del:</strong> {solicitud.fecha_inicio} <strong>al:</strong> {solicitud.fecha_fin}</p>
        {solicitud.cantidad && <p><strong>Cantidad:</strong> {solicitud.cantidad}</p>}
        {solicitud.observaciones && <p><strong>Observaciones:</strong> {solicitud.observaciones}</p>}
      </div>

      <div className="panel">
        <h2>Documentos adjuntos</h2>
        {documentos.length === 0 && <p>El alumno no adjuntó documentos.</p>}
        <ul>
          {documentos.map((d) => (
            <li key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.nombre_archivo}</a></li>
          ))}
        </ul>
      </div>

      <div className="panel">
        <h2>Decisión</h2>
        {solicitud.estado === 'pendiente' && !mostrarMotivo && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="boton" onClick={aprobar} disabled={procesando}>Aprobar</button>
            <button className="boton peligro" onClick={() => setMostrarMotivo(true)} disabled={procesando}>Rechazar</button>
          </div>
        )}

        {mostrarMotivo && (
          <div>
            <div className="fila-formulario">
              <label>Motivo de rechazo (obligatorio)</label>
              <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="boton peligro" onClick={rechazar} disabled={procesando}>Confirmar rechazo</button>
              <button className="boton secundario" onClick={() => setMostrarMotivo(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {solicitud.estado !== 'pendiente' && (
          <div>
            {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && (
              <p><strong>Motivo registrado:</strong> {solicitud.motivo_rechazo}</p>
            )}
            <button className="boton secundario" onClick={revertir} disabled={procesando}>
              Revertir esta decisión (volver a pendiente)
            </button>
          </div>
        )}
      </div>

      {historial.length > 0 && (
        <div className="panel">
          <h2>Historial de decisiones</h2>
          <table className="tabla">
            <thead><tr><th>Decisión</th><th>Motivo</th><th>Fecha</th></tr></thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id}>
                  <td>{h.decision}</td>
                  <td>{h.motivo_rechazo || '—'}</td>
                  <td>{new Date(h.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
