import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext.jsx'
import Layout from '../../components/Layout.jsx'

export default function PerfilAlumno() {
  const { perfil } = useAuth()
  const [alumno, setAlumno] = useState(null)
  const [matricula, setMatricula] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data: a } = await supabase
        .from('alumnos').select('*').eq('perfil_id', perfil.id).single()
      setAlumno(a)
      if (a) {
        const { data: m } = await supabase
          .from('matriculas')
          .select('cursos(nombre), paralelos(nombre), gestiones_escolares(nombre)')
          .eq('alumno_id', a.id)
          .order('creado_en', { ascending: false })
          .limit(1)
          .single()
        setMatricula(m)
      }
    }
    if (perfil) cargar()
  }, [perfil])

  return (
    <Layout>
      <h1>Mi perfil</h1>
      <div className="panel">
        {!alumno && <p>Cargando…</p>}
        {alumno && (
          <>
            <p><strong>Nombre:</strong> {alumno.nombre_completo}</p>
            <p><strong>CI:</strong> {alumno.ci}</p>
            <p><strong>Código de estudiante:</strong> {alumno.codigo_estudiante}</p>
            <p><strong>Correo:</strong> {alumno.correo}</p>
            <p><strong>Teléfono:</strong> {alumno.telefono}</p>
            {matricula && (
              <p><strong>Curso actual:</strong> {matricula.cursos?.nombre} "{matricula.paralelos?.nombre}" — {matricula.gestiones_escolares?.nombre}</p>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
