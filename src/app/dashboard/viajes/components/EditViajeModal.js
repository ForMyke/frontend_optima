'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, User, Package, Truck, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'

const EditViajeModal = ({ isOpen, onClose, onSave, viaje, operadores, clientes, unidades, onEstadoChange }) => {
  const [formData, setFormData] = useState({
    idUnidad: '',
    idOperador: '',
    idCliente: '',
    origen: '',
    destino: '',
    fechaSalida: '',
    fechaEstimadaLlegada: '',
    estado: 'PENDIENTE',
    cargaDescripcion: '',
    observaciones: '',
    tarifa: '',
    distanciaKm: '',
    tipo: 'LOCAL',
    responsableLogistica: '',
    evidenciaUrl: '',
    creadoPor: '',
    folio: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
    }
  }, [isOpen])

  useEffect(() => {
    if (viaje) {
      setFormData({
        idUnidad: viaje.idUnidad || viaje.unidad?.id || '',
        idOperador: viaje.idOperador || viaje.operador?.id || '',
        idCliente: viaje.idCliente || viaje.cliente?.id || '',
        origen: viaje.origen || '',
        destino: viaje.destino || '',
        fechaSalida: viaje.fechaSalida || '',
        fechaEstimadaLlegada: viaje.fechaEstimadaLlegada || '',
        estado: viaje.estado || 'PENDIENTE',
        cargaDescripcion: viaje.cargaDescripcion || '',
        observaciones: viaje.observaciones || '',
        tarifa: viaje.tarifa || '',
        distanciaKm: viaje.distanciaKm || '',
        tipo: viaje.tipo || 'NORMAL',
        responsableLogistica: viaje.responsableLogistica || '',
        evidenciaUrl: viaje.evidenciaUrl || '',
        creadoPor: viaje.creadoPor || '',
        folio: viaje.folio || ''
      })
    }
  }, [viaje])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.id) {
      toast.error('No se pudo obtener el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      await onSave(viaje.id, {
        idUnidad: parseInt(formData.idUnidad),
        idOperador: parseInt(formData.idOperador),
        idCliente: parseInt(formData.idCliente),
        origen: formData.origen,
        destino: formData.destino,
        fechaSalida: formData.fechaSalida,
        fechaEstimadaLlegada: formData.fechaEstimadaLlegada,
        estado: formData.estado,
        cargaDescripcion: formData.cargaDescripcion,
        observaciones: formData.observaciones || null,
        tarifa: parseFloat(formData.tarifa),
        distanciaKm: parseFloat(formData.distanciaKm),
        tipo: formData.tipo,
        responsableLogistica: parseInt(formData.responsableLogistica),
        evidenciaUrl: formData.evidenciaUrl || null,
        creadoPor: currentUser.id,
        folio: formData.folio || null
      })
      onClose()
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">Editar viaje #{viaje?.id}</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección: Asignaciones */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Asignaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Operador *
                </label>
                <select
                  value={formData.idOperador}
                  onChange={(e) => setFormData({ ...formData, idOperador: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un operador</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} - {op.licencia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.idCliente}
                  onChange={(e) => setFormData({ ...formData, idCliente: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unidad *
                </label>
                <select
                  value={formData.idUnidad}
                  onChange={(e) => setFormData({ ...formData, idUnidad: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona una unidad</option>
                  {unidades && unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.numeroEconomico} - {unidad.placas}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Ruta */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Ruta del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distancia (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanciaKm}
                  onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de viaje *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="LOCAL">Local</option>
                  <option value="FORANEO">Foráneo</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Folio
                </label>
                <input
                  type="text"
                  value={formData.folio}
                  onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="FOL001"
                />
              </div>
            </div>
          </div>

          {/* Sección: Fechas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Fechas del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de salida *
                </label>
                <input
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha estimada de llegada *
                </label>
                <input
                  type="date"
                  value={formData.fechaEstimadaLlegada}
                  onChange={(e) => setFormData({ ...formData, fechaEstimadaLlegada: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Carga y Costos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Carga y Tarifas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción de la carga *
                </label>
                <textarea
                  value={formData.cargaDescripcion}
                  onChange={(e) => setFormData({ ...formData, cargaDescripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tarifa}
                  onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado del viaje *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => {
                    const nuevoEstado = e.target.value
                    // Si el estado cambió, abrir el modal de evidencia
                    if (nuevoEstado !== formData.estado && onEstadoChange) {
                      // Cerrar el modal de edición y abrir el modal de evidencia
                      onEstadoChange(viaje, nuevoEstado)
                    } else {
                      setFormData({ ...formData, estado: nuevoEstado })
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formData.estado === 'PENDIENTE' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                    formData.estado === 'EN_CURSO' ? 'border-blue-200 bg-blue-50 text-blue-800' :
                    formData.estado === 'COMPLETADO' ? 'border-green-200 bg-green-50 text-green-800' :
                    'border-red-200 bg-red-50 text-red-800'
                  }`}
                  required
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Información Adicional */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Información Adicional
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de evidencia (opcional)
                </label>
                <input
                  type="url"
                  value={formData.evidenciaUrl}
                  onChange={(e) => setFormData({ ...formData, evidenciaUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="https://ejemplo.com/evidencia.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actualizado por
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium">{currentUser?.nombre || 'Cargando...'}</span>
                    <span className="ml-2 text-sm text-slate-500">({currentUser?.email})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Usuario autenticado actualmente</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !currentUser}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar viaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


export default EditViajeModal
