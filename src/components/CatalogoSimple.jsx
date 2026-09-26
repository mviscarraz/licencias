import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CatalogoSimple({ tabla, titulo, tieneActivo, nombreCampoActivo }) {
  const [items, setItems] = useState([])
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [error, setError] = useState('')

  async function cargar() {
    const { data } = await supabase.from(tabla).select('*').order('nombre')
    setItems(data || [])
  }

  useEffect(() => { cargar() }, [])

  async function agregar(e) {
    e.preventDefault()
    setError('')
    if (!nombreNuevo.trim()) return
    const { error: err } = await supabase.from(tabla).insert({ nombre: nombreNuevo.trim() })
    if (err) setError('No se pudo crear (¿el nombre ya existe?).')
    else { setNombreNuevo(''); cargar() }
  }

  async function alternarActivo(item) {
    await supabase.from(tabla).update({ [nombreCampoActivo]: !item[nombreCampoActivo] }).eq('id', item.id)
    cargar()
  }

  async function renombrar(item, nuevoNombre) {
    if (!nuevoNombre.trim() || nuevoNombre === item.nombre) return
    await supabase.from(tabla).update({ nombre: nuevoNombre.trim() }).eq('id', item.id)
    cargar()
  }

  return (
    <div className="panel">
      <h2>{titulo}</h2>
      {error && <div className="mensaje-error">{error}</div>}
      <form onSubmit={agregar} style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input placeholder={`Nuevo ${titulo.toLowerCase()}`} value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} />
        <button className="boton">Agregar</button>
      </form>

      <table className="tabla">
        <thead><tr><th>Nombre</th>{tieneActivo && <th>Estado</th>}<th></th></tr></thead>
        <tbody>
          {items.map((item) => (
            <FilaCatalogo
              key={item.id}
              item={item}
              tieneActivo={tieneActivo}
              nombreCampoActivo={nombreCampoActivo}
              onRenombrar={renombrar}
              onAlternarActivo={alternarActivo}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FilaCatalogo({ item, tieneActivo, nombreCampoActivo, onRenombrar, onAlternarActivo }) {
  const [nombre, setNombre] = useState(item.nombre)
  const activo = tieneActivo ? item[nombreCampoActivo] : true

  return (
    <tr>
      <td>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => onRenombrar(item, nombre)}
          style={{ border: 'none', background: 'transparent', width: '100%' }}
        />
      </td>
      {tieneActivo && <td>{activo ? 'Activo' : 'Inactivo'}</td>}
      {tieneActivo && (
        <td>
          <button className="boton secundario" onClick={() => onAlternarActivo(item)}>
            {activo ? 'Desactivar' : 'Activar'}
          </button>
        </td>
      )}
      {!tieneActivo && <td></td>}
    </tr>
  )
}
