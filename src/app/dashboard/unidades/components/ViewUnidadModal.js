'use client'

import { useState, useEffect } from 'react'
import { Truck, Settings, Wrench, Calendar, Gauge } from 'lucide-react'
import { usersService } from '@/app/services/usersService'

const ViewUnidadModal = ({ isOpen, onClose, unidad }) => {
  const [creadorNombre, setCreadorNombre] = useState('Cargando...')

  useEffect(() => {
    const fetchCreador = async () => {
      if (unidad?.creadoPorId) {
        try {
          const usuario = await usersService.getUserById(unidad.creadoPorId)
          setCreadorNombre(usuario.nombre || 'Usuario desconocido')
        } catch (error) {
          console.error('Error al cargar usuario:', error)
          setCreadorNombre('Usuario no encontrado')
        }
      }
    }

    if (isOpen && unidad) {
      fetchCreador()
    }
  }, [isOpen, unidad])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstadoBadge = (estado) => {
    const styles = {
      ACTIVA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      MANTENIMIENTO: 'bg-amber-100 text-amber-800 border-amber-200',
      INACTIVA: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[estado] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  if (!isOpen || !unidad) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles de la unidad</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa de la unidad</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Información General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Número Económico</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{unidad.placas}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Marca</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.marca}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Modelo</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.modelo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Año</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.anio}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Tipo</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.tipo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <p className="text-sm mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getEstadoBadge(unidad.estado)}`}>
                    {unidad.estado}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Información de Mantenimiento */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Mantenimiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500 flex items-center">
                  <Gauge className="h-3 w-3 mr-1" />
                  Kilometraje Actual
                </label>
                <p className="text-lg text-slate-900 mt-1 font-bold">{unidad.kilometrajeActual?.toLocaleString('es-MX')} km</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Último Mantenimiento
                </label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatDate(unidad.fechaUltimoMto)}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Información del Sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-xs font-medium text-slate-500">Creado por</label>
                <p className="text-sm text-slate-900 mt-1">{creadorNombre}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewUnidadModal
