import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import Layout from '../../components/Layout.jsx'

export default function DashboardAdmin() {
  const [contadores, setContadores] = useState(null)

  useEffect(() => {
    async function cargar() {
      const [{ count: pendientes }, { count: aprobadas }, { count: rechazadas }, { count: alumnos }] = await Promise.all([
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'aprobada'),
        supabase.from('solicitudes').select('*', { count: 'exact', head: true }).eq('estado', 'rechazada'),
        supabase.from('alumnos').select('*', { count: 'exact', head: true }),
      ])
      setContadores({ pendientes, aprobadas, rechazadas, alumnos })
    }
    cargar()
  }, [])

  return (
    <Layout>
      <h1>Panel general</h1>
      <div className="dos-columnas" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Tarjeta titulo="Pendientes" valor={contadores?.pendientes} />
        <Tarjeta titulo="Aprobadas" valor={contadores?.aprobadas} />
        <Tarjeta titulo="Rechazadas" valor={contadores?.rechazadas} />
        <Tarjeta titulo="Alumnos" valor={contadores?.alumnos} />
      </div>
    </Layout>
  )
}

function Tarjeta({ titulo, valor }) {
  return (
    <div className="panel">
      <div style={{ fontSize: '0.8rem', color: '#4a5568' }}>{titulo}</div>
      <div style={{ fontSize: '1.8rem', fontFamily: 'Georgia, serif' }}>{valor ?? '—'}</div>
    </div>
  )
}
