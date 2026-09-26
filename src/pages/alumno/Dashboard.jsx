import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext.jsx'
import Layout from '../../components/Layout.jsx'
import EtiquetaEstado from '../../components/EtiquetaEstado.jsx'

export default function DashboardAlumno() {
  const { perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
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
        .limit(5)
      setSolicitudes(data || [])
      setCargando(false)
    }
    if (perfil) cargar()
  }, [perfil])

  return (
    <Layout>
      <h1>Hola, {perfil?.nombre}</h1>
      <p style={{ color: '#4a5568' }}>Aquí puedes registrar y consultar tus solicitudes de licencia.</p>

      <div className="panel">
        <Link to="/alumno/nueva-solicitud" className="boton">Registrar nueva solicitud</Link>
      </div>

      <div className="panel">
        <h2>Últimas solicitudes</h2>
        {cargando && <p>Cargando…</p>}
        {!cargando && solicitudes.length === 0 && <p>Todavía no registraste ninguna solicitud.</p>}
        {solicitudes.length > 0 && (
          <table className="tabla">
            <thead>
              <tr><th>Tipo</th><th>Fechas</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
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
