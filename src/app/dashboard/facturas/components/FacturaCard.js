'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  MoreVertical,
  Eye,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

const FacturaCard = ({ factura, clientes, onPagar, onViewDetails, onEstatusChange }) => {
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

  // Buscar el cliente por ID
  const cliente = clientes.find(c => c.id === factura.clienteId)

  const getEstatusColor = (estatus) => {
    switch (estatus) {
      case 'PAGADA':
        return 'bg-emerald-100 text-emerald-700'
      case 'PENDIENTE':
        return 'bg-orange-100 text-orange-700'
      case 'VENCIDA':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getEstatusIcon = (estatus) => {
    switch (estatus) {
      case 'PAGADA':
        return CheckCircle
      case 'PENDIENTE':
        return Clock
      case 'VENCIDA':
        return XCircle
      default:
        return FileText
    }
  }

  const EstatusIcon = getEstatusIcon(factura.estatus)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{factura.numeroFactura}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstatusColor(factura.estatus)} flex items-center gap-1`}>
                  <EstatusIcon className="h-3 w-3" />
                  {factura.estatus}
                </span>
              </div>
              <p className="text-sm text-slate-500">{cliente?.nombre || 'Sin cliente'}</p>
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
                    onViewDetails(factura)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Select de estado */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Estado de la factura
          </label>
          <select
            value={factura.estatus}
            onChange={(e) => {
              const nuevoEstatus = e.target.value
              if (nuevoEstatus !== factura.estatus) {
                onEstatusChange(factura, nuevoEstatus)
              }
            }}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              factura.estatus === 'PENDIENTE' ? 'border-orange-200 bg-orange-50 text-orange-800' :
              factura.estatus === 'PAGADA' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
              'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <option value="PENDIENTE">⏳ Pendiente</option>
            <option value="PAGADA">✓ Pagada</option>
            <option value="VENCIDA">✗ Vencida</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Monto:
              </span>
              <span className="text-sm font-bold text-slate-900">
                ${(factura.monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Vencimiento:
              </span>
              <span className="text-sm font-medium text-slate-900">
                {factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString('es-MX') : 'N/A'}
              </span>
            </div>
          </div>

          {factura.observaciones && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Observaciones:</p>
              <p className="text-sm text-slate-700 line-clamp-2">{factura.observaciones}</p>
            </div>
          )}

          {factura.estatus === 'PAGADA' && factura.fechaPago && (
            <div className="pt-3 border-t border-slate-100 bg-emerald-50 rounded-lg p-3 -mx-3">
              <p className="text-xs text-emerald-600 font-medium mb-1">Pagada el:</p>
              <p className="text-sm text-emerald-700 font-semibold">
                {new Date(factura.fechaPago).toLocaleDateString('es-MX')}
              </p>
              {factura.metodoPago && (
                <p className="text-xs text-emerald-600 mt-1">
                  Método: {factura.metodoPago}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FacturaCard
