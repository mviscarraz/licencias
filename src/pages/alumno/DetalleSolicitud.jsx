import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import Layout from '../../components/Layout.jsx'
import EtiquetaEstado from '../../components/EtiquetaEstado.jsx'

export default function DetalleSolicitudAlumno() {
  const { id } = useParams()
  const [solicitud, setSolicitud] = useState(null)
  const [documentos, setDocumentos] = useState([])

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('solicitudes')
        .select('*, tipos_licencia(nombre)')
        .eq('id', id)
        .single()
      setSolicitud(data)

      const { data: docs } = await supabase
        .from('documentos_solicitud').select('*').eq('solicitud_id', id)
      const conUrl = await Promise.all((docs || []).map(async (d) => {
        const { data: firmada } = await supabase.storage
          .from('documentos-solicitudes').createSignedUrl(d.ruta_storage, 3600)
        return { ...d, url: firmada?.signedUrl }
      }))
      setDocumentos(conUrl)
    }
    cargar()
  }, [id])

  if (!solicitud) return <Layout><p>Cargando…</p></Layout>

  return (
    <Layout>
      <p><Link to="/alumno/mis-solicitudes">← Volver a mis solicitudes</Link></p>
      <h1>{solicitud.tipos_licencia?.nombre}</h1>
      <div className="panel">
        <p><EtiquetaEstado estado={solicitud.estado} /></p>
        <p><strong>Del:</strong> {solicitud.fecha_inicio} <strong>al:</strong> {solicitud.fecha_fin}</p>
        {solicitud.cantidad && <p><strong>Cantidad:</strong> {solicitud.cantidad}</p>}
        {solicitud.observaciones && <p><strong>Observaciones:</strong> {solicitud.observaciones}</p>}
        {solicitud.estado === 'rechazada' && solicitud.motivo_rechazo && (
          <div className="mensaje-error">Motivo de rechazo: {solicitud.motivo_rechazo}</div>
        )}
      </div>

      <div className="panel">
        <h2>Documentos adjuntos</h2>
        {documentos.length === 0 && <p>No adjuntaste documentos.</p>}
        <ul>
          {documentos.map((d) => (
            <li key={d.id}><a href={d.url} target="_blank" rel="noreferrer">{d.nombre_archivo}</a></li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
