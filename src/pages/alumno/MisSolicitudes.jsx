import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext.jsx'
import Layout from '../../components/Layout.jsx'
import EtiquetaEstado from '../../components/EtiquetaEstado.jsx'

export default function MisSolicitudes() {
  const { perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      const { data: alumno } = await supabase
        .from('alumnos').select('id').eq('perfil_id', perfil.id).single()
      if (!alumno) { setCargando(false); return }
      const { data } = await supabase
        .from('solicitudes')
        .select('id, estado, fecha_inicio, fecha_fin, creado_en, tipos_licencia(nombre)')
        .eq('alumno_id', alumno.id)
        .order('creado_en', { ascending: false })
      setSolicitudes(data || [])
      setCargando(false)
    }
    if (perfil) cargar()
  }, [perfil])

  const visibles = filtroEstado ? solicitudes.filter((s) => s.estado === filtroEstado) : solicitudes

  return (
    <Layout>
      <h1>Mis solicitudes</h1>
      <div className="panel">
        <div className="filtros">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        {cargando && <p>Cargando…</p>}
        {!cargando && visibles.length === 0 && <p>No hay solicitudes que coincidan.</p>}
        {visibles.length > 0 && (
          <table className="tabla">
            <thead><tr><th>Tipo</th><th>Fechas</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {visibles.map((s) => (
                <tr key={s.id}>
                  <td>{s.tipos_licencia?.nombre}</td>
                  <td>{s.fecha_inicio} a {s.fecha_fin}</td>
                  <td><EtiquetaEstado estado={s.estado} /></td>
                  <td><Link to={`/alumno/solicitudes/${s.id}`}>Ver detalle</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
