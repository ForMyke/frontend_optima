'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, User, Package, Truck, AlertCircle, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'
import tarifasComisionesService from '@/app/services/tarifasComisionesService'
import Image from 'next/image'

const CreateViajeModal = ({ isOpen, onClose, onSave, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    idUnidad: '',
    idOperador: '',
    idCliente: '',
    idRutaComisiones: '',
    fechaSalida: '',
    fechaEstimadaLlegada: '',
    estado: 'PENDIENTE',
    cargaDescripcion: '',
    observaciones: '',
    tipo: 'NORMAL',
    responsableLogistica: '',
    creadoPor: ''
  })
  const [archivo, setArchivo] = useState(null)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [rutasDisponibles, setRutasDisponibles] = useState([])
  const [tarifaRuta, setTarifaRuta] = useState(null)
  const [loadingRutas, setLoadingRutas] = useState(false)

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
      setRutasDisponibles([])
      setTarifaRuta(null)
    }
  }, [isOpen])

  // Cargar rutas cuando se selecciona un cliente
  useEffect(() => {
    const loadRutasCliente = async () => {
      if (!formData.idCliente) {
        setRutasDisponibles([])
        setTarifaRuta(null)
        return
      }

      setLoadingRutas(true)
      try {
        const response = await tarifasComisionesService.getRutasComisionesByCliente(formData.idCliente, 0, 100)
        setRutasDisponibles(response.content || [])
      } catch (error) {
        console.error('Error al cargar rutas del cliente:', error)
        toast.error('Error al cargar las rutas del cliente')
        setRutasDisponibles([])
      } finally {
        setLoadingRutas(false)
      }
    }

    loadRutasCliente()
  }, [formData.idCliente])

  // Actualizar tarifa cuando se selecciona una ruta
  useEffect(() => {
    if (!formData.idRutaComisiones) {
      setTarifaRuta(null)
      return
    }

    // Buscar la ruta seleccionada en las rutas disponibles
    const rutaSeleccionada = rutasDisponibles.find(
      ruta => ruta.id === parseInt(formData.idRutaComisiones)
    )
    
    if (rutaSeleccionada) {
      setTarifaRuta(rutaSeleccionada)
    } else {
      setTarifaRuta(null)
    }
  }, [formData.idRutaComisiones, rutasDisponibles])


  // Función de validación
  const validateForm = () => {
    const newErrors = {}

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

    // Validar fechas
    if (!formData.fechaSalida) {
      newErrors.fechaSalida = 'La fecha de salida es obligatoria'
    }

    if (!formData.fechaEstimadaLlegada) {
      newErrors.fechaEstimadaLlegada = 'La fecha estimada de llegada es obligatoria'
    }

    // Validar que la fecha de llegada sea posterior o igual a la de salida
    if (formData.fechaSalida && formData.fechaEstimadaLlegada) {
      const fechaSalida = new Date(formData.fechaSalida)
      const fechaLlegada = new Date(formData.fechaEstimadaLlegada)
      
      if (fechaLlegada < fechaSalida) {
        newErrors.fechaEstimadaLlegada = 'La fecha de llegada no puede ser anterior a la fecha de salida'
      }
    }

    // Validar descripción de carga
    if (!formData.cargaDescripcion || !formData.cargaDescripcion.trim()) {
      newErrors.cargaDescripcion = 'La descripción de la carga es obligatoria'
    } else if (formData.cargaDescripcion.trim().length < 10) {
      newErrors.cargaDescripcion = 'La descripción debe tener al menos 10 caracteres'
    }

    setErrors(newErrors)
    
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
      const viajeData = {
        idUnidad: parseInt(formData.idUnidad),
        idOperador: parseInt(formData.idOperador),
        idCliente: parseInt(formData.idCliente),
        idRutaComisiones: formData.idRutaComisiones ? parseInt(formData.idRutaComisiones) : null,
        fechaSalida: formData.fechaSalida,
        fechaEstimadaLlegada: formData.fechaEstimadaLlegada,
        tipo: formData.tipo,
        estado: formData.estado,
        cargaDescripcion: formData.cargaDescripcion.trim(),
        observaciones: formData.observaciones.trim() || null,
        responsableLogistica: parseInt(formData.responsableLogistica),
        creadoPor: currentUser.id
      }
      
      // Pasar el archivo como segundo parámetro
      await onSave(viajeData, archivo)
      
      setFormData({
        idUnidad: '',
        idOperador: '',
        idCliente: '',
        idRutaComisiones: '',
        fechaSalida: '',
        fechaEstimadaLlegada: '',
        estado: 'PENDIENTE',
        cargaDescripcion: '',
        observaciones: '',
        tipo: 'NORMAL',
        responsableLogistica: '',
        creadoPor: ''
      })
      setArchivo(null)
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error en handleSubmit:', error)
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
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      idCliente: e.target.value,
                      idRutaComisiones: '' // Resetear ruta al cambiar cliente
                    })
                  }}
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

          {/* Sección: Tipo de viaje y Ruta comisiones */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Configuración del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="NORMAL">Normal</option>
                  <option value="ESPECIAL">Especial</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ruta de comisiones (opcional)
                </label>
                <select
                  value={formData.idRutaComisiones}
                  onChange={(e) => setFormData({ ...formData, idRutaComisiones: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  disabled={!formData.idCliente || loadingRutas}
                >
                  <option value="">
                    {!formData.idCliente 
                      ? 'Primero selecciona un cliente' 
                      : loadingRutas 
                        ? 'Cargando rutas...' 
                        : 'Selecciona una ruta'}
                  </option>
                  {rutasDisponibles.map((ruta) => (
                    <option key={ruta.id} value={ruta.id}>
                      {ruta.origen} → {ruta.destino} {ruta.kms ? `(${ruta.kms} km)` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {rutasDisponibles.length > 0 
                    ? `${rutasDisponibles.length} ruta(s) disponible(s)` 
                    : formData.idCliente ? 'No hay rutas disponibles para este cliente' : 'Selecciona un cliente para ver rutas'}
                </p>
              </div>
            </div>

            {/* Mostrar información de tarifa si existe */}
            {tarifaRuta && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Información de la Ruta
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-blue-600 font-medium">Origen</p>
                    <p className="text-blue-900">{tarifaRuta.origen || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-medium">Destino</p>
                    <p className="text-blue-900">{tarifaRuta.destino || 'N/A'}</p>
                  </div>
                  {tarifaRuta.kms && (
                    <div>
                      <p className="text-blue-600 font-medium">Distancia</p>
                      <p className="text-blue-900">{tarifaRuta.kms} km</p>
                    </div>
                  )}
                  {tarifaRuta.tarifa && (
                    <div>
                      <p className="text-blue-600 font-medium">Tarifa</p>
                      <p className="text-blue-900 font-bold">
                        ${parseFloat(tarifaRuta.tarifa).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                  {tarifaRuta.comision && (
                    <div>
                      <p className="text-blue-600 font-medium">Comisión</p>
                      <p className="text-blue-900">
                        ${parseFloat(tarifaRuta.comision).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Archivo adjunto (opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setArchivo(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  {archivo && (
                    <div className="mt-2 flex items-center justify-between text-sm text-slate-600 bg-blue-50 p-2 rounded-lg">
                      <span className="truncate">{archivo.name}</span>
                      <button
                        type="button"
                        onClick={() => setArchivo(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">Formatos permitidos: imágenes, PDF, Word</p>
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
