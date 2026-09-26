import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ENLACES = {
  alumno: [
    { to: '/alumno/dashboard', texto: 'Inicio' },
    { to: '/alumno/nueva-solicitud', texto: 'Nueva solicitud' },
    { to: '/alumno/mis-solicitudes', texto: 'Mis solicitudes' },
    { to: '/alumno/perfil', texto: 'Mi perfil' },
  ],
  secretario: [
    { to: '/secretaria/dashboard', texto: 'Solicitudes' },
  ],
  administrador: [
    { to: '/admin/dashboard', texto: 'Panel' },
    { to: '/admin/solicitudes', texto: 'Solicitudes' },
    { to: '/admin/alumnos', texto: 'Alumnos' },
    { to: '/admin/tipos-licencia', texto: 'Tipos de licencia' },
    { to: '/admin/cursos', texto: 'Cursos' },
    { to: '/admin/paralelos', texto: 'Paralelos' },
    { to: '/admin/gestiones', texto: 'Gestiones escolares' },
    { to: '/admin/usuarios', texto: 'Usuarios del sistema' },
  ],
}

const NOMBRE_ROL = {
  alumno: 'Alumno',
  secretario: 'Secretaría',
  administrador: 'Administración',
}

export default function Layout({ children }) {
  const { perfil, cerrarSesion } = useAuth()
  const enlaces = ENLACES[perfil?.rol] || []

  return (
    <div className="app-shell">
      <nav className="barra-lateral">
        <div className="marca">Licencias Escolares</div>
        <div className="rol">{NOMBRE_ROL[perfil?.rol]} · {perfil?.nombre}</div>
        {enlaces.map((e) => (
          <NavLink key={e.to} to={e.to} className={({ isActive }) => isActive ? 'activo' : ''}>
            {e.texto}
          </NavLink>
        ))}
        <button className="salir" onClick={cerrarSesion}>Cerrar sesión</button>
      </nav>
      <div className="contenido">{children}</div>
    </div>
  )
}
