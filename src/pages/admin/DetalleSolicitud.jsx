import Layout from '../../components/Layout.jsx'
import DetalleSolicitudStaff from '../../components/DetalleSolicitudStaff.jsx'

export default function DetalleSolicitudAdmin() {
  return (
    <Layout>
      <DetalleSolicitudStaff rutaVolver="/admin/solicitudes" />
    </Layout>
  )
}
