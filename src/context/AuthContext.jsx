import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  async function cargarPerfil(userId) {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single()
    setPerfil(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      if (session) cargarPerfil(session.user.id).finally(() => setCargando(false))
      else setCargando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_evento, session) => {
      setSesion(session)
      if (session) cargarPerfil(session.user.id)
      else setPerfil(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function iniciarSesion(correo, contrasena) {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena })
    return error
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ sesion, perfil, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
