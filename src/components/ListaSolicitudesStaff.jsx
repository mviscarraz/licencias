import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import EtiquetaEstado from './EtiquetaEstado.jsx'

export default function ListaSolicitudesStaff({ rutaDetalle }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [tipos, setTipos] = useState([])
  const [cargando, setCargando] = useState(true)

  const [filtroEstado, setFiltroEstado] = useState('pendiente')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroTexto, setFiltroTexto] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: tiposData } = await supabase.from('tipos_licencia').select('id, nombre').order('nombre')
      setTipos(tiposData || [])

      let consulta = supabase
        .from('solicitudes')
        .select(`
          id, estado, fecha_inicio, fecha_fin, creado_en,
          tipos_licencia(id, nombre),
          alumnos(nombre_completo, ci, codigo_estudiante)
        `)
        .order('creado_en', { ascending: false })

      const { data } = await consulta
      setSolicitudes(data || [])
      setCargando(false)
    }
    cargar()
  }, [])

  const visibles = solicitudes.filter((s) => {
    if (filtroEstado && s.estado !== filtroEstado) return false
    if (filtroTipo && s.tipos_licencia?.id !== filtroTipo) return false
    if (filtroTexto) {
      const texto = filtroTexto.toLowerCase()
      const enNombre = s.alumnos?.nombre_completo?.toLowerCase().includes(texto)
      const enCi = s.alumnos?.ci?.toLowerCase().includes(texto)
      const enCodigo = s.alumnos?.codigo_estudiante?.toLowerCase().includes(texto)
      if (!enNombre && !enCi && !enCodigo) return false
    }
    return true
  })

  return (
    <div className="panel">
      <div className="filtros">
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
        </select>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <input
          placeholder="Buscar por nombre, CI o código"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
      </div>

      {cargando && <p>Cargando…</p>}
      {!cargando && visibles.length === 0 && <p>No hay solicitudes que coincidan con el filtro.</p>}
      {visibles.length > 0 && (
        <table className="tabla">
          <thead>
            <tr><th>Alumno</th><th>Tipo</th><th>Fechas</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {visibles.map((s) => (
              <tr key={s.id}>
                <td>{s.alumnos?.nombre_completo}</td>
                <td>{s.tipos_licencia?.nombre}</td>
                <td>{s.fecha_inicio} a {s.fecha_fin}</td>
                <td><EtiquetaEstado estado={s.estado} /></td>
                <td><Link to={`${rutaDetalle}/${s.id}`}>Revisar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
