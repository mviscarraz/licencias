import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import Layout from '../../components/Layout.jsx'

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [texto, setTexto] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from('alumnos').select('*').order('nombre_completo')
      setAlumnos(data || [])
    }
    cargar()
  }, [])

  const visibles = alumnos.filter((a) => {
    if (!texto) return true
    const t = texto.toLowerCase()
    return a.nombre_completo?.toLowerCase().includes(t) || a.ci?.toLowerCase().includes(t) || a.codigo_estudiante?.toLowerCase().includes(t)
  })

  return (
    <Layout>
      <h1>Alumnos</h1>
      <div className="panel">
        <div className="filtros">
          <input placeholder="Buscar por nombre, CI o código" value={texto} onChange={(e) => setTexto(e.target.value)} />
          <Link to="/admin/alumnos/nuevo" className="boton">Registrar alumno</Link>
        </div>

        <table className="tabla">
          <thead><tr><th>Nombre</th><th>CI</th><th>Código</th><th></th></tr></thead>
          <tbody>
            {visibles.map((a) => (
              <tr key={a.id}>
                <td>{a.nombre_completo}</td>
                <td>{a.ci}</td>
                <td>{a.codigo_estudiante}</td>
                <td><Link to={`/admin/alumnos/${a.id}`}>Editar</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
