'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Truck,
  MoreVertical,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react'

const BitacoraCard = ({ bitacora, onEdit, onDelete, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{bitacora.folio}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  Viaje #{bitacora.viajeId}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-500 space-x-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{bitacora.origen} → {bitacora.destino}</span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                <button
                  onClick={() => {
                    onViewDetails(bitacora)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(bitacora)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-3 text-slate-400" />
                  Editar
                </button>
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={() => {
                    onDelete(bitacora)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Carga
            </span>
            <span className="font-medium text-slate-900">{formatDate(bitacora.fechaCarga)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Entrega
            </span>
            <span className="font-medium text-slate-900">{formatDate(bitacora.fechaEntrega)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              Costo Total
            </span>
            <span className="font-semibold text-emerald-600">{formatCurrency(bitacora.costoTotal)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            {bitacora.numeroFactura || 'Sin factura'}
          </div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            ID: {bitacora.id}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BitacoraCard
