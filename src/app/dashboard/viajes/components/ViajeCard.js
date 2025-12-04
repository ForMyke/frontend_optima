'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  User,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Navigation
} from 'lucide-react'
import { authService } from '@/app/services/authService'

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EN_CURSO: { label: 'En curso', color: 'bg-blue-100 text-blue-800', icon: Navigation },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FINALIZADO: { label: 'Finalizado', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  RECHAZADO: { label: 'Rechazado', color: 'bg-orange-100 text-orange-800', icon: XCircle }
}

const TIPOS_VIAJE = {
  LOCAL: { label: 'Local', color: 'bg-purple-100 text-purple-800' },
  FORANEO: { label: 'Foráneo', color: 'bg-indigo-100 text-indigo-800' },
  INTERNACIONAL: { label: 'Internacional', color: 'bg-pink-100 text-pink-800' }
}

const ViajeCard = ({ viaje, onEdit, onDelete, onViewDetails, operadores, clientes, unidades, onEstadoChange }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const menuRef = useRef(null)

  // Verificar si el usuario es ADMIN
  useEffect(() => {
    const user = authService.getUser()
    setIsAdmin(user?.rol === 'ADMIN')
  }, [])

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

  const estadoInfo = ESTADOS[viaje.estado] || ESTADOS.PENDIENTE
  const tipoInfo = TIPOS_VIAJE[viaje.tipo] || TIPOS_VIAJE.LOCAL

  // Obtener datos de objetos anidados
  const operadorNombre = viaje.operador?.nombre || 'No asignado'
  const clienteNombre = viaje.cliente?.nombre || 'No asignado'
  const unidadPlacas = viaje.unidad?.numeroEconomico || viaje.unidad?.numeroEconomico || 'No asignada'

  // Obtener origen y destino de la ruta si existe
  const origen = viaje.ruta?.origen || viaje.origen || 'N/A'
  const destino = viaje.ruta?.destino || viaje.destino || 'N/A'

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado !== viaje.estado) {
      onEstadoChange(viaje, nuevoEstado)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">Viaje #{viaje.id}</h3>
                {viaje.folio && (
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                    {viaje.folio}
                  </span>
                )}
              </div>
              <div className="flex items-center text-sm text-slate-500 space-x-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{origen} → {destino}</span>
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
                    onViewDetails(viaje)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>

                {/* Solo ADMIN puede editar y eliminar */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        onEdit(viaje)
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
                        onDelete(viaje)
                        setShowMenu(false)
                      }}
                      className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-3" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Select de estado */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Estado del viaje
          </label>
          <select
            value={viaje.estado}
            onChange={handleEstadoChange}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${viaje.estado === 'PENDIENTE' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                viaje.estado === 'EN_CURSO' ? 'border-blue-200 bg-blue-50 text-blue-800' :
                  viaje.estado === 'COMPLETADO' ? 'border-green-200 bg-green-50 text-green-800' :
                    viaje.estado === 'FINALIZADO' ? 'border-teal-200 bg-teal-50 text-teal-800' :
                      viaje.estado === 'RECHAZADO' ? 'border-orange-200 bg-orange-50 text-orange-800' :
                        'border-red-200 bg-red-50 text-red-800'
              }`}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_CURSO">En curso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Operador:
            </span>
            <span className="font-medium text-slate-900">
              {operadorNombre || 'No asignado'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Package className="h-3.5 w-3.5 mr-1.5" />
              Cliente:
            </span>
            <span className="font-medium text-slate-900">
              {clienteNombre || 'No asignado'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Truck className="h-3.5 w-3.5 mr-1.5" />
              Unidad:
            </span>
            <span className="font-medium text-slate-900">
              {unidadPlacas}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {viaje.fechaSalida}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.color}`}>
            {tipoInfo.label}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ViajeCard
