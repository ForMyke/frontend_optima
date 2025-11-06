'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, User, Package, Truck, AlertCircle, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'
import Image from 'next/image'

const CreateViajeModal = ({ isOpen, onClose, onSave, operadores, clientes, unidades }) => {
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
    creadoPor: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
      if (user?.id) {
        setFormData(prev => ({
          ...prev,
          creadoPor: user.id.toString(),
          responsableLogistica: user.id.toString()
        }))
      }
      // Limpiar errores al abrir el modal
      setErrors({})
    }
  }, [isOpen])


  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar tipo de viaje
    if (!formData.tipo) {
      newErrors.tipo = 'Debes seleccionar un tipo de viaje'
    }

    // Validar asignaciones
    if (!formData.idOperador) {
      newErrors.idOperador = 'Debes seleccionar un operador'
    }
    if (!formData.idCliente) {
      newErrors.idCliente = 'Debes seleccionar un cliente'
    }
    if (!formData.idUnidad) {
      newErrors.idUnidad = 'Debes seleccionar una unidad'
    }

    // Validar origen (mínimo 5 caracteres)
    if (!formData.origen || !formData.origen.trim()) {
      newErrors.origen = 'El origen es obligatorio'
    } else if (formData.origen.trim().length < 3) {
      newErrors.origen = 'El origen debe tener al menos 3 caracteres'
    }

    // Validar destino (mínimo 5 caracteres)
    if (!formData.destino || !formData.destino.trim()) {
      newErrors.destino = 'El destino es obligatorio'
    } else if (formData.destino.trim().length < 3 ) {
      newErrors.destino = 'El destino debe tener al menos 3 caracteres'
    } else if (formData.destino.toLowerCase() === formData.origen.toLowerCase()) {
      newErrors.destino = 'El destino no puede ser igual al origen'
    }

    // Validar fechas
    if (!formData.fechaSalida) {
      newErrors.fechaSalida = 'La fecha de salida es obligatoria'
    }

    if (!formData.fechaEstimadaLlegada) {
      newErrors.fechaEstimadaLlegada = 'La fecha estimada de llegada es obligatoria'
    }

    // Validar que la fecha de llegada sea posterior o igual a la de salida (permite mismo día para viajes locales)
    if (formData.fechaSalida && formData.fechaEstimadaLlegada) {
      const fechaSalida = new Date(formData.fechaSalida)
      const fechaLlegada = new Date(formData.fechaEstimadaLlegada)
      
      if (fechaLlegada < fechaSalida) {
        newErrors.fechaEstimadaLlegada = 'La fecha de llegada no puede ser anterior a la fecha de salida'
      }
    }

    // Validar distancia
    if (!formData.distanciaKm) {
      newErrors.distanciaKm = 'La distancia es obligatoria'
    } else if (parseFloat(formData.distanciaKm) <= 0) {
      newErrors.distanciaKm = 'La distancia debe ser mayor a 0'
    } else if (parseFloat(formData.distanciaKm) > 10000) {
      newErrors.distanciaKm = 'La distancia no puede exceder 10,000 km'
    }

    // Validar tarifa (debe ser positiva)
    if (!formData.tarifa) {
      newErrors.tarifa = 'La tarifa es obligatoria'
    } else if (parseFloat(formData.tarifa) < 0) {
      newErrors.tarifa = 'La tarifa no puede ser negativa'
    } else if (parseFloat(formData.tarifa) > 1000000) {
      newErrors.tarifa = 'La tarifa no puede exceder $1,000,000'
    }

    // Validar descripción de carga
    if (!formData.cargaDescripcion || !formData.cargaDescripcion.trim()) {
      newErrors.cargaDescripcion = 'La descripción de la carga es obligatoria'
    } else if (formData.cargaDescripcion.trim().length < 10) {
      newErrors.cargaDescripcion = 'La descripción debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    
    // Debug: mostrar qué campos tienen errores
    console.log('=== VALIDACIÓN DEL FORMULARIO ===')
    console.log('Datos del formulario:', formData)
    console.log('Errores encontrados:', newErrors)
    console.log('Cantidad de errores:', Object.keys(newErrors).length)
    
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar formulario
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    if (!currentUser?.id) {
      toast.error('No se pudo obtener el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        idUnidad: parseInt(formData.idUnidad),
        idOperador: parseInt(formData.idOperador),
        idCliente: parseInt(formData.idCliente),
        origen: formData.origen.trim(),
        destino: formData.destino.trim(),
        fechaSalida: formData.fechaSalida,
        fechaEstimadaLlegada: formData.fechaEstimadaLlegada,
        estado: formData.estado,
        cargaDescripcion: formData.cargaDescripcion.trim(),
        observaciones: formData.observaciones.trim() || null,
        tarifa: parseFloat(formData.tarifa),
        distanciaKm: parseFloat(formData.distanciaKm),
        tipo: formData.tipo,
        responsableLogistica: parseInt(formData.responsableLogistica),
        evidenciaUrl: formData.evidenciaUrl || null,
        creadoPor: currentUser.id
      })
      setFormData({
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
        creadoPor: ''
      })
      setErrors({})
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
          <h2 className="text-2xl font-bold text-slate-900">Nuevo viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Registra un nuevo viaje con todos sus detalles</p>
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
                  onChange={(e) => {
                    setFormData({ ...formData, origen: e.target.value })
                    if (errors.origen) setErrors({ ...errors, origen: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.origen 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Ej: CDMX"
                />
                {errors.origen && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.origen}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  value={formData.destino}
                  onChange={(e) => {
                    setFormData({ ...formData, destino: e.target.value })
                    if (errors.destino) setErrors({ ...errors, destino: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.destino 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Ej: Guadalajara"
                />
                {errors.destino && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.destino}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distancia (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanciaKm}
                  onChange={(e) => {
                    setFormData({ ...formData, distanciaKm: e.target.value })
                    if (errors.distanciaKm) setErrors({ ...errors, distanciaKm: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.distanciaKm 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="550.0"
                />
                {errors.distanciaKm && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.distanciaKm}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de viaje *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${
                    errors.tipo ? 'border-red-500' : 'border-slate-200'
                  }`}
                  required
                >
                  <option value="LOCAL">Local</option>
                  <option value="FORANEO">Foráneo</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, fechaSalida: e.target.value })
                    if (errors.fechaSalida) setErrors({ ...errors, fechaSalida: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.fechaSalida 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                {errors.fechaSalida && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fechaSalida}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha estimada de llegada *
                </label>
                <input
                  type="date"
                  value={formData.fechaEstimadaLlegada}
                  onChange={(e) => {
                    setFormData({ ...formData, fechaEstimadaLlegada: e.target.value })
                    if (errors.fechaEstimadaLlegada) setErrors({ ...errors, fechaEstimadaLlegada: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.fechaEstimadaLlegada 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                {errors.fechaEstimadaLlegada && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.fechaEstimadaLlegada}
                  </p>
                )}
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
                  onChange={(e) => {
                    setFormData({ ...formData, cargaDescripcion: e.target.value })
                    if (errors.cargaDescripcion) setErrors({ ...errors, cargaDescripcion: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.cargaDescripcion 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Descripción detallada de la carga..."
                  rows={3}
                />
                {errors.cargaDescripcion && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.cargaDescripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tarifa}
                  onChange={(e) => {
                    setFormData({ ...formData, tarifa: e.target.value })
                    if (errors.tarifa) setErrors({ ...errors, tarifa: '' })
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                    errors.tarifa 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="4500.50"
                />
                {errors.tarifa && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tarifa}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
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
                  placeholder="Entrega prioritaria, cuidado con carga frágil, etc..."
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
                  Registrado por
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
              {isLoading ? 'Guardando...' : 'Crear viaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


export default CreateViajeModal
