import Layout from '../../components/Layout.jsx'
import ListaSolicitudesStaff from '../../components/ListaSolicitudesStaff.jsx'

export default function DashboardSecretaria() {
  return (
    <Layout>
      <h1>Solicitudes de licencia</h1>
      <ListaSolicitudesStaff rutaDetalle="/secretaria/solicitudes" />
    </Layout>
  )
}
