import Layout from '../../components/Layout.jsx'
import CatalogoSimple from '../../components/CatalogoSimple.jsx'

export default function Cursos() {
  return (
    <Layout>
      <h1>Cursos / grados</h1>
      <CatalogoSimple tabla="cursos" titulo="Curso" />
    </Layout>
  )
}
