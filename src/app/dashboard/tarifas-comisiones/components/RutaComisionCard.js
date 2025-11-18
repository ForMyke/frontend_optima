import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Eye, MapPin, DollarSign, User } from 'lucide-react'

const RutaComisionCard = ({ ruta, clientes, onEdit, onDelete, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar el cliente por ID
  const cliente = clientes.find(c => c.id === ruta.clienteId)
  const clienteNombre = cliente?.nombre || 'Cliente no encontrado'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              ID: {ruta.id}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {ruta.origen} → {ruta.destino}
          </h3>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-slate-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
              <button
                onClick={() => {
                  onViewDetails(ruta)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Ver detalles</span>
              </button>
              <button
                onClick={() => {
                  onEdit(ruta)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  onDelete(ruta)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Cliente */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="p-2 bg-purple-50 rounded-lg">
            <User className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="font-semibold text-slate-900">{clienteNombre}</p>
          </div>
        </div>

        {/* Ruta Tarifa ID */}
        {ruta.rutaTarifaId && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Ruta Tarifa ID</p>
              <p className="font-semibold text-slate-900">#{ruta.rutaTarifaId}</p>
            </div>
          </div>
        )}

        {/* Comisión */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">Comisión</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            ${parseFloat(ruta.comision).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default RutaComisionCard
