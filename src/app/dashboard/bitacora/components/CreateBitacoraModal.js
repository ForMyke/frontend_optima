'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  MapPin,
  Calendar,
  Truck,
  DollarSign,
  Package,
  User,
  Fuel,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'

const CreateBitacoraModal = ({ isOpen, onClose, onSave, viajes, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    viajeId: '',
    folio: '',
    clienteId: '',
    origen: '',
    destino: '',
    fechaCarga: '',
    fechaEntrega: '',
    horaEntrega: '',
    operadorId: '',
    unidadId: '',
    caja: '',
    casetas: '',
    dieselLitros: '',
    precioDiesel: '', // Nuevo campo para precio por litro
    comisionOperador: '',
    gastosExtras: '',
    costoTotal: '',
    comentarios: '',
    numeroFactura: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [costoDiesel, setCostoDiesel] = useState(0) // Estado para mostrar el cálculo

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
      // Limpiar errores al abrir el modal
      setErrors({})
    }
  }, [isOpen])

  // Calcular costo de diesel cuando cambien litros o precio
  useEffect(() => {
    const litros = parseFloat(formData.dieselLitros) || 0
    const precio = parseFloat(formData.precioDiesel) || 0
    const costo = litros * precio
    setCostoDiesel(costo)
  }, [formData.dieselLitros, formData.precioDiesel])

  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar viaje
    if (!formData.viajeId) {
      newErrors.viajeId = 'Debes seleccionar un viaje'
    }

    // Validar folio
    if (!formData.folio.trim()) {
      newErrors.folio = 'El folio es obligatorio'
    } else if (formData.folio.trim().length < 5) {
      newErrors.folio = 'El folio debe tener al menos 5 caracteres'
    }

    // Validar cliente
    if (!formData.clienteId) {
      newErrors.clienteId = 'Debes seleccionar un cliente'
    }

    // Validar origen
    if (!formData.origen.trim()) {
      newErrors.origen = 'El origen es obligatorio'
    } else if (formData.origen.trim().length < 3) {
      newErrors.origen = 'El origen debe tener al menos 3 caracteres'
    }

    // Validar destino
    if (!formData.destino.trim()) {
      newErrors.destino = 'El destino es obligatorio'
    } else if (formData.destino.trim().length < 3) {
      newErrors.destino = 'El destino debe tener al menos 3 caracteres'
    } else if (formData.destino.toLowerCase() === formData.origen.toLowerCase()) {
      newErrors.destino = 'El destino no puede ser igual al origen'
    }

    // Validar fechas
    if (!formData.fechaCarga) {
      newErrors.fechaCarga = 'La fecha de carga es obligatoria'
    }

    if (!formData.fechaEntrega) {
      newErrors.fechaEntrega = 'La fecha de entrega es obligatoria'
    }

    // Validar que la fecha de entrega sea posterior o igual a la de carga
    if (formData.fechaCarga && formData.fechaEntrega) {
      const fechaCarga = new Date(formData.fechaCarga)
      const fechaEntrega = new Date(formData.fechaEntrega)

      if (fechaEntrega < fechaCarga) {
        newErrors.fechaEntrega = 'La fecha de entrega debe ser posterior o igual a la fecha de carga'
      }
    }

    // Validar hora de entrega
    if (!formData.horaEntrega) {
      newErrors.horaEntrega = 'La hora de entrega es obligatoria'
    }

    // Validar operador
    if (!formData.operadorId) {
      newErrors.operadorId = 'Debes seleccionar un operador'
    }

    // Validar unidad
    if (!formData.unidadId) {
      newErrors.unidadId = 'Debes seleccionar una unidad'
    }

    // Validar caja
    if (!formData.caja.trim()) {
      newErrors.caja = 'El número de caja es obligatorio'
    } else if (formData.caja.trim().length < 3) {
      newErrors.caja = 'El número de caja debe tener al menos 3 caracteres'
    }

    // Validar gastos (opcionales pero deben ser valores válidos si se ingresan)
    if (formData.casetas && parseFloat(formData.casetas) < 0) {
      newErrors.casetas = 'El costo de casetas no puede ser negativo'
    }

    if (formData.dieselLitros && parseFloat(formData.dieselLitros) < 0) {
      newErrors.dieselLitros = 'Los litros de diesel no pueden ser negativos'
    }

    if (formData.precioDiesel && parseFloat(formData.precioDiesel) < 0) {
      newErrors.precioDiesel = 'El precio del diesel no puede ser negativo'
    }

    if (formData.comisionOperador && parseFloat(formData.comisionOperador) < 0) {
      newErrors.comisionOperador = 'La comisión del operador no puede ser negativa'
    }

    if (formData.gastosExtras && parseFloat(formData.gastosExtras) < 0) {
      newErrors.gastosExtras = 'Los gastos extras no pueden ser negativos'
    }

    if (!formData.costoTotal || parseFloat(formData.costoTotal) <= 0) {
      newErrors.costoTotal = 'El costo total es obligatorio y debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Autocompletar datos cuando se selecciona un viaje
  const handleViajeChange = (viajeId) => {
    const viaje = viajes.find(v => v.id === parseInt(viajeId))
    if (viaje) {
      setFormData({
        ...formData,
        viajeId,
        clienteId: viaje.idCliente || viaje.clienteId || '',
        origen: viaje.origen || '',
        destino: viaje.destino || '',
        operadorId: viaje.idOperador || viaje.operadorId || '',
        unidadId: viaje.idUnidad || viaje.unidadId || ''
      })
    } else {
      setFormData({ ...formData, viajeId })
    }
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
      // Calcular el costo total del diesel (litros × precio)
      const litros = parseFloat(formData.dieselLitros) || 0
      const precio = parseFloat(formData.precioDiesel) || 0
      const costoDieselTotal = litros * precio

      // Convertir strings a números y enviar costo de diesel calculado
      const dataToSend = {
        ...formData,
        viajeId: parseInt(formData.viajeId),
        clienteId: parseInt(formData.clienteId),
        operadorId: parseInt(formData.operadorId),
        unidadId: parseInt(formData.unidadId),
        casetas: parseFloat(formData.casetas) || 0,
        dieselLitros: costoDieselTotal, // Enviar el costo total del diesel (litros × precio)
        comisionOperador: parseFloat(formData.comisionOperador) || 0,
        gastosExtras: parseFloat(formData.gastosExtras) || 0,
        costoTotal: parseFloat(formData.costoTotal) || 0,
        creadoPor: currentUser.id // Usar el ID del usuario autenticado
      }
      await onSave(dataToSend)
      setFormData({
        viajeId: '',
        folio: '',
        clienteId: '',
        origen: '',
        destino: '',
        fechaCarga: '',
        fechaEntrega: '',
        horaEntrega: '',
        operadorId: '',
        unidadId: '',
        caja: '',
        casetas: '',
        dieselLitros: '',
        precioDiesel: '',
        comisionOperador: '',
        gastosExtras: '',
        costoTotal: '',
        comentarios: '',
        numeroFactura: ''
      })
      setCostoDiesel(0)
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving bitácora:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nueva bitácora de viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Registra un nuevo viaje con todos sus detalles</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Información General */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Viaje *
                  </label>
                  <select
                    value={formData.viajeId}
                    onChange={(e) => {
                      handleViajeChange(e.target.value)
                      if (errors.viajeId) setErrors({ ...errors, viajeId: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.viajeId
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  >
                    <option value="">Selecciona un viaje</option>
                    {viajes && viajes.map((viaje) => (
                      <option key={viaje.id} value={viaje.id}>
                        #{viaje.id} - {viaje.origen} → {viaje.destino}
                      </option>
                    ))}
                  </select>
                  {errors.viajeId ? (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.viajeId}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">El viaje autocompletará algunos campos</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Folio *
                  </label>
                  <input
                    type="text"
                    value={formData.folio}
                    onChange={(e) => {
                      setFormData({ ...formData, folio: e.target.value })
                      if (errors.folio) setErrors({ ...errors, folio: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.folio
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="BIT-2025-001"
                  />
                  {errors.folio && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.folio}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => {
                      setFormData({ ...formData, clienteId: e.target.value })
                      if (errors.clienteId) setErrors({ ...errors, clienteId: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.clienteId
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes && clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    value={formData.numeroFactura}
                    onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="FACT-2025-001"
                  />
                </div>
              </div>
            </div>

            {/* Ruta */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ruta
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.origen
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="Ciudad de México"
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.destino
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="Guadalajara"
                  />
                  {errors.destino && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.destino}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas y Horarios */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Fechas y Horarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Carga *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaCarga}
                    onChange={(e) => {
                      setFormData({ ...formData, fechaCarga: e.target.value })
                      if (errors.fechaCarga) setErrors({ ...errors, fechaCarga: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.fechaCarga
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  />
                  {errors.fechaCarga && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fechaCarga}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => {
                      setFormData({ ...formData, fechaEntrega: e.target.value })
                      if (errors.fechaEntrega) setErrors({ ...errors, fechaEntrega: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.fechaEntrega
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  />
                  {errors.fechaEntrega && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fechaEntrega}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora de Entrega *
                  </label>
                  <input
                    type="time"
                    value={formData.horaEntrega}
                    onChange={(e) => {
                      setFormData({ ...formData, horaEntrega: e.target.value })
                      if (errors.horaEntrega) setErrors({ ...errors, horaEntrega: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.horaEntrega
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  />
                  {errors.horaEntrega && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.horaEntrega}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Recursos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Operador *
                  </label>
                  <select
                    value={formData.operadorId}
                    onChange={(e) => {
                      setFormData({ ...formData, operadorId: e.target.value })
                      if (errors.operadorId) setErrors({ ...errors, operadorId: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.operadorId
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  >
                    <option value="">Selecciona un operador</option>
                    {operadores && operadores.map((operador) => (
                      <option key={operador.id} value={operador.id}>
                        {operador.nombre} - {operador.licencia}
                      </option>
                    ))}
                  </select>
                  {errors.operadorId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.operadorId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unidad *
                  </label>
                  <select
                    value={formData.unidadId}
                    onChange={(e) => {
                      setFormData({ ...formData, unidadId: e.target.value })
                      if (errors.unidadId) setErrors({ ...errors, unidadId: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.unidadId
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                  >
                    <option value="">Selecciona una unidad</option>
                    {unidades && unidades.map((unidad) => (
                      <option key={unidad.id} value={unidad.id}>
                        {unidad.numeroEconomico} - {unidad.placas}
                      </option>
                    ))}
                  </select>
                  {errors.unidadId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.unidadId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Caja *
                  </label>
                  <input
                    type="text"
                    value={formData.caja}
                    onChange={(e) => {
                      setFormData({ ...formData, caja: e.target.value })
                      if (errors.caja) setErrors({ ...errors, caja: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.caja
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="CAJA-001"
                  />
                  {errors.caja && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.caja}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Costos */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Costos y Gastos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Casetas ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.casetas}
                    onChange={(e) => {
                      setFormData({ ...formData, casetas: e.target.value })
                      if (errors.casetas) setErrors({ ...errors, casetas: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.casetas
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="850.50"
                  />
                  {errors.casetas && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.casetas}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diesel (Litros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dieselLitros}
                    onChange={(e) => {
                      setFormData({ ...formData, dieselLitros: e.target.value })
                      if (errors.dieselLitros) setErrors({ ...errors, dieselLitros: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.dieselLitros
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="120.75"
                  />
                  {errors.dieselLitros && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.dieselLitros}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Precio Diesel ($/Litro)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioDiesel}
                    onChange={(e) => {
                      setFormData({ ...formData, precioDiesel: e.target.value })
                      if (errors.precioDiesel) setErrors({ ...errors, precioDiesel: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.precioDiesel
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="24.50"
                  />
                  {errors.precioDiesel && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.precioDiesel}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo total diesel
                  </label>
                  <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-semibold flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-amber-600" />
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }).format(costoDiesel)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.dieselLitros && formData.precioDiesel
                      ? `${formData.dieselLitros} L × $${formData.precioDiesel} = $${costoDiesel.toFixed(2)}`
                      : 'Ingresa litros y precio para calcular'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comisión Operador ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comisionOperador}
                    onChange={(e) => {
                      setFormData({ ...formData, comisionOperador: e.target.value })
                      if (errors.comisionOperador) setErrors({ ...errors, comisionOperador: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.comisionOperador
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="1500.00"
                  />
                  {errors.comisionOperador && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.comisionOperador}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gastos Extras ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gastosExtras}
                    onChange={(e) => {
                      setFormData({ ...formData, gastosExtras: e.target.value })
                      if (errors.gastosExtras) setErrors({ ...errors, gastosExtras: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.gastosExtras
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="250.00"
                  />
                  {errors.gastosExtras && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.gastosExtras}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo Total ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoTotal}
                    onChange={(e) => {
                      setFormData({ ...formData, costoTotal: e.target.value })
                      if (errors.costoTotal) setErrors({ ...errors, costoTotal: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${errors.costoTotal
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder="5800.00"
                  />
                  {errors.costoTotal && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.costoTotal}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Adicional */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Información Adicional
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comentarios
                  </label>
                  <textarea
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    rows={3}
                    placeholder="Observaciones o incidencias del viaje..."
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
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
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
              {isLoading ? 'Guardando...' : 'Crear bitácora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBitacoraModal