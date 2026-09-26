import Layout from '../../components/Layout.jsx'
import ListaSolicitudesStaff from '../../components/ListaSolicitudesStaff.jsx'

export default function SolicitudesAdmin() {
  return (
    <Layout>
      <h1>Todas las solicitudes</h1>
      <ListaSolicitudesStaff rutaDetalle="/admin/solicitudes" />
    </Layout>
  )
}
