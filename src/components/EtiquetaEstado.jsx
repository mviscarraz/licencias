const TEXTO = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

export default function EtiquetaEstado({ estado }) {
  return <span className={`etiqueta-estado ${estado}`}>{TEXTO[estado] || estado}</span>
}
