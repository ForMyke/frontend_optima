'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Wrench,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Warehouse,
  AlertCircle
} from 'lucide-react'

const RefaccionCard = ({ refaccion, almacenes, onEdit, onDelete, onViewDetails }) => {
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

  const almacen = refaccion.almacen
  const almacenNombre = almacen?.nombre || 'Sin asignar'
  const isLowStock = (refaccion.stockActual || 0) < 10

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">{refaccion.nombre}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{refaccion.descripcion || 'Sin descripción'}</p>
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
                    onViewDetails(refaccion)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(refaccion)
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
                    onDelete(refaccion)
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

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500 flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Stock:
              </span>
              <span className={`text-sm font-medium ${isLowStock ? 'text-orange-600' : 'text-slate-900'}`}>
                {refaccion.stockActual || 0} {refaccion.unidadMedida || 'und'}
              </span>
              {isLowStock && (
                <AlertCircle className="inline h-3 w-3 ml-1 text-orange-600" />
              )}
            </div>
            <div>
              <span className="text-xs text-slate-500 flex items-center">
                <DollarSign className="h-3 w-3 mr-1" />
                Costo:
              </span>
              <span className="text-sm font-medium text-slate-900">
                ${(refaccion.costoUnitario || 0).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
            <span className="text-slate-500 flex items-center">
              <Warehouse className="h-3.5 w-3.5 mr-1.5" />
              Almacén:
            </span>
            <span className={`font-medium ${almacen ? 'text-slate-900' : 'text-slate-400'}`}>
              {almacenNombre}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefaccionCard
