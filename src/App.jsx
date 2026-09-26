import { Routes, Route, Navigate } from 'react-router-dom'
import RutaProtegida from './components/RutaProtegida.jsx'
import Login from './pages/Login.jsx'
import RecuperarPassword from './pages/RecuperarPassword.jsx'

import DashboardAlumno from './pages/alumno/Dashboard.jsx'
import NuevaSolicitud from './pages/alumno/NuevaSolicitud.jsx'
import MisSolicitudes from './pages/alumno/MisSolicitudes.jsx'
import DetalleSolicitudAlumno from './pages/alumno/DetalleSolicitud.jsx'
import PerfilAlumno from './pages/alumno/Perfil.jsx'

import DashboardSecretaria from './pages/secretaria/Dashboard.jsx'
import DetalleSolicitudSecretaria from './pages/secretaria/DetalleSolicitud.jsx'

import DashboardAdmin from './pages/admin/Dashboard.jsx'
import SolicitudesAdmin from './pages/admin/Solicitudes.jsx'
import DetalleSolicitudAdmin from './pages/admin/DetalleSolicitud.jsx'
import Alumnos from './pages/admin/Alumnos.jsx'
import AlumnoForm from './pages/admin/AlumnoForm.jsx'
import TiposLicencia from './pages/admin/TiposLicencia.jsx'
import Cursos from './pages/admin/Cursos.jsx'
import Paralelos from './pages/admin/Paralelos.jsx'
import Gestiones from './pages/admin/Gestiones.jsx'
import Usuarios from './pages/admin/Usuarios.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />

      <Route path="/alumno/dashboard" element={<RutaProtegida rolesPermitidos={['alumno']}><DashboardAlumno /></RutaProtegida>} />
      <Route path="/alumno/nueva-solicitud" element={<RutaProtegida rolesPermitidos={['alumno']}><NuevaSolicitud /></RutaProtegida>} />
      <Route path="/alumno/mis-solicitudes" element={<RutaProtegida rolesPermitidos={['alumno']}><MisSolicitudes /></RutaProtegida>} />
      <Route path="/alumno/solicitudes/:id" element={<RutaProtegida rolesPermitidos={['alumno']}><DetalleSolicitudAlumno /></RutaProtegida>} />
      <Route path="/alumno/perfil" element={<RutaProtegida rolesPermitidos={['alumno']}><PerfilAlumno /></RutaProtegida>} />

      <Route path="/secretaria/dashboard" element={<RutaProtegida rolesPermitidos={['secretario']}><DashboardSecretaria /></RutaProtegida>} />
      <Route path="/secretaria/solicitudes/:id" element={<RutaProtegida rolesPermitidos={['secretario']}><DetalleSolicitudSecretaria /></RutaProtegida>} />

      <Route path="/admin/dashboard" element={<RutaProtegida rolesPermitidos={['administrador']}><DashboardAdmin /></RutaProtegida>} />
      <Route path="/admin/solicitudes" element={<RutaProtegida rolesPermitidos={['administrador']}><SolicitudesAdmin /></RutaProtegida>} />
      <Route path="/admin/solicitudes/:id" element={<RutaProtegida rolesPermitidos={['administrador']}><DetalleSolicitudAdmin /></RutaProtegida>} />
      <Route path="/admin/alumnos" element={<RutaProtegida rolesPermitidos={['administrador']}><Alumnos /></RutaProtegida>} />
      <Route path="/admin/alumnos/:id" element={<RutaProtegida rolesPermitidos={['administrador']}><AlumnoForm /></RutaProtegida>} />
      <Route path="/admin/tipos-licencia" element={<RutaProtegida rolesPermitidos={['administrador']}><TiposLicencia /></RutaProtegida>} />
      <Route path="/admin/cursos" element={<RutaProtegida rolesPermitidos={['administrador']}><Cursos /></RutaProtegida>} />
      <Route path="/admin/paralelos" element={<RutaProtegida rolesPermitidos={['administrador']}><Paralelos /></RutaProtegida>} />
      <Route path="/admin/gestiones" element={<RutaProtegida rolesPermitidos={['administrador']}><Gestiones /></RutaProtegida>} />
      <Route path="/admin/usuarios" element={<RutaProtegida rolesPermitidos={['administrador']}><Usuarios /></RutaProtegida>} />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
