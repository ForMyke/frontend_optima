'use client'

import { MapPin, Calendar, User, Package, Truck, Camera, Eye, Clock, CheckCircle, XCircle, Navigation } from 'lucide-react'
import Image from 'next/image'

const ViewViajeModal = ({ isOpen, onClose, viaje }) => {

  const ESTADOS = {
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    EN_CURSO: { label: 'En curso', color: 'bg-blue-100 text-blue-800', icon: Navigation },
    COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const TIPOS_VIAJE = {
    LOCAL: { label: 'Local', color: 'bg-purple-100 text-purple-800' },
    FORANEO: { label: 'Foráneo', color: 'bg-indigo-100 text-indigo-800' },
    INTERNACIONAL: { label: 'Internacional', color: 'bg-pink-100 text-pink-800' }
  }
  if (!isOpen || !viaje) return null



  const estadoInfo = ESTADOS[viaje.estado] || ESTADOS.PENDIENTE
  const tipoInfo = TIPOS_VIAJE[viaje.tipo || viaje.tipoViaje] || TIPOS_VIAJE.LOCAL
  const EstadoIcon = estadoInfo.icon

  // Obtener información de operador - SIEMPRE mostrar el nombre
  const operadorNombre = viaje.operador?.nombre || 'No disponible'
  const operadorLicencia = viaje.operador?.licenciaNumero || viaje.operador?.licencia

  // Obtener información de cliente - SIEMPRE mostrar el nombre
  const clienteNombre = viaje.cliente?.nombre || 'No disponible'
  const clienteRfc = viaje.cliente?.rfc

  // Obtener información de unidad - SIEMPRE mostrar el número económico
  const unidadNumero = viaje.unidad?.modelo || 'No disponible'
  const unidadPlacas = viaje.unidad?.placas



  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Viaje #{viaje.id}</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del viaje</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y Tipo */}
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${estadoInfo.color}`}>
              <EstadoIcon className="h-4 w-4 mr-2" />
              {estadoInfo.label}
            </span>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${tipoInfo.color}`}>
              {tipoInfo.label}
            </span>
          </div>

          {/* Ruta */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Información de ruta
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500">Origen</label>
                  <p className="text-base font-semibold text-slate-900 mt-1">{viaje.origen}</p>
                </div>
                <div className="flex-shrink-0">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <label className="text-xs font-medium text-slate-500">Destino</label>
                  <p className="text-base font-semibold text-slate-900 mt-1">{viaje.destino}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Distancia</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{viaje.distanciaKm} km</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tarifa</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">${viaje.tarifa}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asignaciones */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Asignaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <label className="text-xs font-medium text-blue-700">Operador</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {operadorNombre}
                </p>
                {operadorLicencia && (
                  <p className="text-xs text-slate-600 mt-1">Lic: {operadorLicencia}</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Package className="h-4 w-4 text-green-600 mr-2" />
                  <label className="text-xs font-medium text-green-700">Cliente</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {clienteNombre}
                </p>
                {clienteRfc && (
                  <p className="text-xs text-slate-600 mt-1">RFC: {clienteRfc}</p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Truck className="h-4 w-4 text-purple-600 mr-2" />
                  <label className="text-xs font-medium text-purple-700">Unidad</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {unidadNumero}
                </p>
                {unidadPlacas && (
                  <p className="text-xs text-slate-600 mt-1">Placas: {unidadPlacas}</p>
                )}
              </div>
            </div>
          </div>

          {/* Carga */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Información de carga
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="text-xs font-medium text-slate-500">Descripción</label>
              <p className="text-sm text-slate-900 mt-1">{viaje.cargaDescripcion}</p>
              {viaje.observaciones && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <label className="text-xs font-medium text-slate-500">Observaciones</label>
                  <p className="text-sm text-slate-900 mt-1">{viaje.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fechas
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Fecha de salida:</span>
                <span className="ml-2 font-semibold text-slate-900">{viaje.fechaSalida || 'No especificada'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Llegada estimada:</span>
                <span className="ml-2 font-semibold text-slate-900">{viaje.fechaEstimadaLlegada || 'No especificada'}</span>
              </div>
              {viaje.fechaRealLlegada && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-slate-600">Llegada real:</span>
                  <span className="ml-2 font-semibold text-slate-900">{viaje.fechaRealLlegada}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidencia fotográfica */}
          {viaje.evidenciaUrl && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Evidencia fotográfica
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="relative w-full h-64 mb-3">
                  <Image
                    src={viaje.evidenciaUrl}
                    alt={`Evidencia del viaje #${viaje.id}`}
                    fill
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                </div>
                <a
                  href={viaje.evidenciaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver imagen completa</span>
                </a>
              </div>
            </div>
          )}
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


export default ViewViajeModal
