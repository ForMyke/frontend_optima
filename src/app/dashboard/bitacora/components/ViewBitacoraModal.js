'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  MapPin,
  Calendar,
  Clock,
  Truck,
  User,
  Package,
  DollarSign,
  Fuel
} from 'lucide-react'
import { usersService } from '@/app/services/usersService'

const ViewBitacoraModal = ({ isOpen, onClose, bitacora, viajes, operadores, clientes, unidades }) => {
  const [creadorNombre, setCreadorNombre] = useState('Cargando...')

  useEffect(() => {
    const fetchCreador = async () => {
      if (isOpen && bitacora?.creadoPor) {
        try {
          const usuario = await usersService.getUserById(bitacora.creadoPor)
          setCreadorNombre(usuario?.nombre || 'Usuario desconocido')
        } catch (error) {
          console.error('Error fetching user:', error)
          setCreadorNombre('Error al cargar')
        }
      }
    }
    fetchCreador()
  }, [isOpen, bitacora])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen || !bitacora) return null

  // Buscar información relacionada
  const viaje = viajes?.find(v => v.id === bitacora.viajeId)
  const cliente = clientes?.find(c => c.id === bitacora.clienteId)
  const operador = operadores?.find(o => o.id === bitacora.operadorId)
  const unidad = unidades?.find(u => u.id === bitacora.unidadId)

  return (
    <div className="fixed inset-0 backdrop-blur-xs  bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles de la bitácora</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del viaje</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <FileText className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Información General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Folio</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{bitacora.folio}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Viaje</label>
                <p className="text-sm text-slate-900 mt-1">
                  {viaje ? ` ${viaje.origen} → ${viaje.destino}` : `#${bitacora.viajeId}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Cliente</label>
                <p className="text-sm text-slate-900 mt-1 font-medium">
                  {cliente ? cliente.nombre : `ID #${bitacora.clienteId}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Número de Factura</label>
                <p className="text-sm text-slate-900 mt-1">{bitacora.numeroFactura || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Folio bitácora</label>
                <p className="text-sm text-slate-900 mt-1">{bitacora.folio}</p>
              </div>
            </div>
          </div>

          {/* Ruta */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Ruta del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Origen</label>
                <p className="text-sm text-slate-900 mt-1 font-medium">{bitacora.origen}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Destino</label>
                <p className="text-sm text-slate-900 mt-1 font-medium">{bitacora.destino}</p>
              </div>
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fechas y Horarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de Carga</label>
                <p className="text-sm text-slate-900 mt-1">{formatDate(bitacora.fechaCarga)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de Entrega</label>
                <p className="text-sm text-slate-900 mt-1">{formatDate(bitacora.fechaEntrega)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Hora de Entrega</label>
                <p className="text-sm text-slate-900 mt-1 flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {bitacora.horaEntrega}
                </p>
              </div>
            </div>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Recursos asignados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Operador</label>
                <p className="text-sm text-slate-900 mt-1 flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {operador ? `${operador.nombre} ` : `ID #${bitacora.operadorId}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Unidad</label>
                <p className="text-sm text-slate-900 mt-1 flex items-center">
                  <Truck className="h-3.5 w-3.5 mr-1" />
                  {unidad ? `${unidad.modelo} - ${unidad.placas}` : `ID #${bitacora.unidadId}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Caja</label>
                <p className="text-sm text-slate-900 mt-1 flex items-center">
                  <Package className="h-3.5 w-3.5 mr-1" />
                  {bitacora.caja}
                </p>
              </div>
            </div>
          </div>

          {/* Costos y Gastos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Costos y Gastos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500">Casetas</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatCurrency(bitacora.casetas)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500 flex items-center">
                  <Fuel className="h-3 w-3 mr-1" />
                  Costo total diesel
                </label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">${bitacora.dieselLitros}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500">Comisión Operador</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatCurrency(bitacora.comisionOperador)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500">Gastos Extras</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatCurrency(bitacora.gastosExtras)}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg md:col-span-2 border border-emerald-200">
                <label className="text-xs font-medium text-emerald-700">Costo Total</label>
                <p className="text-2xl text-emerald-700 mt-1 font-bold">{formatCurrency(bitacora.costoTotal)}</p>
              </div>
            </div>
          </div>

          {/* Comentarios */}
          {bitacora.comentarios && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Comentarios
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 leading-relaxed">{bitacora.comentarios}</p>
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Información del Sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Creado por</label>
                <p className="text-sm text-slate-900 mt-1 flex items-center">
                  <User className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                  {creadorNombre}
                </p>
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

export default ViewBitacoraModal