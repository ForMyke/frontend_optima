import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Eye, Calendar, DollarSign } from 'lucide-react'

const GastoSemanalCard = ({ gasto, calcularTotal, onEdit, onDelete, onViewDetails }) => {
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

  const total = calcularTotal(gasto)

  // Formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              Semana #{gasto.id}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {formatDate(gasto.semanaInicio)} - {formatDate(gasto.semanaFin)}
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
                  onViewDetails(gasto)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Ver detalles</span>
              </button>
              <button
                onClick={() => {
                  onEdit(gasto)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  onDelete(gasto)
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
        {/* Principales gastos */}
        <div className="space-y-2 text-sm">
          {gasto.diesel > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Diesel</span>
              <span className="font-semibold text-slate-900">
                ${parseFloat(gasto.diesel).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {gasto.nomina > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Nómina</span>
              <span className="font-semibold text-slate-900">
                ${parseFloat(gasto.nomina).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {gasto.imss > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-slate-600">IMSS</span>
              <span className="font-semibold text-slate-900">
                ${parseFloat(gasto.imss).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Observaciones */}
        {gasto.observaciones && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-1">Observaciones</p>
            <p className="text-sm text-slate-700 truncate">{gasto.observaciones}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-600">Total</span>
          </div>
          <span className="text-lg font-bold text-red-600">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GastoSemanalCard
