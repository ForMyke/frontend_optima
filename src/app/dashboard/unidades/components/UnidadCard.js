'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Gauge,
  AlertCircle,
  CheckCircle,
  Settings,
  Wrench
} from 'lucide-react'

const UnidadCard = ({ unidad, onEdit, onDelete, onViewDetails }) => {
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

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-emerald-100 text-emerald-800'
      case 'MANTENIMIENTO':
        return 'bg-amber-100 text-amber-800'
      case 'INACTIVA':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{unidad.placas}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getEstadoColor(unidad.estado)}`}>
                  {unidad.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500">{unidad.marca} {unidad.modelo} {unidad.anio}</p>
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
                    onViewDetails(unidad)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(unidad)
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
                    onDelete(unidad)
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
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Tipo
            </span>
            <span className="font-medium text-slate-900">{unidad.tipo}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Gauge className="h-3.5 w-3.5 mr-1.5" />
              Kilometraje
            </span>
            <span className="font-medium text-slate-900">{unidad.kilometrajeActual?.toLocaleString('es-MX')} km</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Wrench className="h-3.5 w-3.5 mr-1.5" />
              Último Mto.
            </span>
            <span className="font-medium text-slate-900">{formatDate(unidad.fechaUltimoMto)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            ID: {unidad.id}
          </div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            {unidad.estado === 'ACTIVA' ? (
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
            )}
            {unidad.estado === 'ACTIVA' ? 'Disponible' : 'No disponible'}
          </div>
        </div>
      </div>
    </div>
  )
}


export default UnidadCard
