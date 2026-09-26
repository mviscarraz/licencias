import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RutaProtegida({ rolesPermitidos, children }) {
  const { sesion, perfil, cargando } = useAuth()

  if (cargando) return <div style={{ padding: 40 }}>Cargando…</div>
  if (!sesion) return <Navigate to="/login" replace />
  if (!perfil) return <div style={{ padding: 40 }}>Cargando…</div>

  if (rolesPermitidos && !rolesPermitidos.includes(perfil.rol)) {
    return <Navigate to={rutaInicioPorRol(perfil.rol)} replace />
  }

  return children
}

export function rutaInicioPorRol(rol) {
  if (rol === 'administrador') return '/admin/dashboard'
  if (rol === 'secretario') return '/secretaria/dashboard'
  return '/alumno/dashboard'
}
