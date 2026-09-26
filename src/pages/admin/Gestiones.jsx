import Layout from '../../components/Layout.jsx'
import CatalogoSimple from '../../components/CatalogoSimple.jsx'

export default function Gestiones() {
  return (
    <Layout>
      <h1>Gestiones escolares</h1>
      <CatalogoSimple tabla="gestiones_escolares" titulo="Gestión escolar" tieneActivo nombreCampoActivo="activa" />
    </Layout>
  )
}
