import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit2, Trash2, Eye, Calendar, User, DollarSign, FileText, CheckCircle } from 'lucide-react'

const FacturaExtraCard = ({ factura, clientes, onEdit, onDelete, onViewDetails, onPagar }) => {
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

  const getEstatusConfig = (estatus) => {
    switch (estatus) {
      case 'PAGADA':
        return { color: 'bg-green-100 text-green-800', label: 'Pagada' }
      case 'PENDIENTE':
        return { color: 'bg-orange-100 text-orange-800', label: 'Pendiente' }
      case 'VENCIDA':
        return { color: 'bg-red-100 text-red-800', label: 'Vencida' }
      case 'CANCELADA':
        return { color: 'bg-gray-100 text-gray-800', label: 'Cancelada' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: estatus || 'N/A' }
    }
  }

  const estatusConfig = getEstatusConfig(factura.estatus)

  // Buscar el cliente por ID
  const cliente = clientes.find(c => c.id === factura.clienteId)
  const clienteNombre = cliente?.nombre || 'Cliente no encontrado'

  // Formatear fechas
  const fechaEmision = factura.fechaEmision 
    ? new Date(factura.fechaEmision).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    : 'Sin fecha'

  const fechaVencimiento = factura.fechaVencimiento 
    ? new Date(factura.fechaVencimiento).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    : 'Sin fecha'

  const isPendiente = factura.estatus === 'PENDIENTE' || factura.estatus === 'VENCIDA'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estatusConfig.color}`}>
              {estatusConfig.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {factura.numeroFactura || 'Sin número'}
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
                  onViewDetails(factura)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Ver detalles</span>
              </button>
              {isPendiente && (
                <button
                  onClick={() => {
                    onPagar(factura)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Marcar como pagada</span>
                </button>
              )}
              <button
                onClick={() => {
                  onEdit(factura)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => {
                  onDelete(factura)
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
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Cliente</p>
            <p className="font-semibold text-slate-900">{clienteNombre}</p>
          </div>
        </div>

        {/* Concepto */}
        {factura.concepto && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Concepto</p>
              <p className="font-semibold text-slate-900 truncate">{factura.concepto}</p>
            </div>
          </div>
        )}

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Emisión</p>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="font-medium text-slate-900">{fechaEmision}</span>
            </div>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Vencimiento</p>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="font-medium text-slate-900">{fechaVencimiento}</span>
            </div>
          </div>
        </div>

        {/* Monto */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">Monto</span>
          </div>
          <span className="text-lg font-bold text-slate-900">
            ${parseFloat(factura.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default FacturaExtraCard
