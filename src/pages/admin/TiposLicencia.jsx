import Layout from '../../components/Layout.jsx'
import CatalogoSimple from '../../components/CatalogoSimple.jsx'

export default function TiposLicencia() {
  return (
    <Layout>
      <h1>Tipos de licencia</h1>
      <CatalogoSimple tabla="tipos_licencia" titulo="Tipo de licencia" tieneActivo nombreCampoActivo="activo" />
    </Layout>
  )
}
