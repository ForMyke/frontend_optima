'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileText,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Package,
  Fuel,
  Receipt,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { bitacoraService } from '@/app/services/bitacoraService'
import { viajesService } from '@/app/services/viajesService'
import { operadoresService } from '@/app/services/operadoresService'
import { clientsService } from '@/app/services/clientsService'
import { unidadesService } from '@/app/services/unidadesService'
import { authService } from '@/app/services/authService'
import { usersService } from '@/app/services/usersService'

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
)

const BitacoraCard = ({ bitacora, onEdit, onDelete, onViewDetails }) => {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{bitacora.folio}</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  Viaje #{bitacora.viajeId}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-500 space-x-2">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{bitacora.origen} → {bitacora.destino}</span>
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
                    onViewDetails(bitacora)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(bitacora)
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
                    onDelete(bitacora)
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
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Carga
            </span>
            <span className="font-medium text-slate-900">{formatDate(bitacora.fechaCarga)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Entrega
            </span>
            <span className="font-medium text-slate-900">{formatDate(bitacora.fechaEntrega)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-1.5" />
              Costo Total
            </span>
            <span className="font-semibold text-emerald-600">{formatCurrency(bitacora.costoTotal)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Receipt className="h-3.5 w-3.5 mr-1.5" />
            {bitacora.numeroFactura || 'Sin factura'}
          </div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            ID: {bitacora.id}
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [validationStep, setValidationStep] = useState('general') // 'general', 'operacional', 'costos'
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
      setValidationStep('general')
    }
  }, [isOpen])

  // Calcular costo de diesel cuando cambien litros o precio
  useEffect(() => {
    const litros = parseFloat(formData.dieselLitros) || 0
    const precio = parseFloat(formData.precioDiesel) || 0
    const costo = litros * precio
    setCostoDiesel(costo)
  }, [formData.dieselLitros, formData.precioDiesel])

  // Función de validación por pasos
  const validateForm = () => {
    const newErrors = {}

    // PASO 1: Información General
    if (validationStep === 'general') {
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
    }

    // PASO 2: Datos Operacionales
    if (validationStep === 'operacional') {
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
    }

    // PASO 3: Costos y Gastos
    if (validationStep === 'costos') {
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

    // Validar paso actual
    if (!validateForm()) {
      // Si hay errores, mostrar mensaje según el paso
      const stepNames = {
        'general': 'Información General',
        'operacional': 'Datos Operacionales',
        'costos': 'Costos y Gastos'
      }
      toast.error(`Corrige los errores en: ${stepNames[validationStep]}`)
      return
    }

    // Si pasó la validación, avanzar al siguiente paso
    if (validationStep === 'general') {
      setValidationStep('operacional')
      toast.success('Información general validada ✓')
      return
    }

    if (validationStep === 'operacional') {
      setValidationStep('costos')
      toast.success('Datos operacionales validados ✓')
      return
    }

    // Si llegamos aquí, estamos en el paso final (costos) y todo está validado
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
      setValidationStep('general')
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving bitácora:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const steps = [
    { id: 'general', name: 'Información General', icon: FileText },
    { id: 'operacional', name: 'Datos Operacionales', icon: Truck },
    { id: 'costos', name: 'Costos y Gastos', icon: DollarSign }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === validationStep)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nueva bitácora de viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Registra un nuevo viaje con todos sus detalles</p>
          
          {/* Indicador de pasos */}
          <div className="flex items-center justify-between mt-4 px-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === validationStep
              const isCompleted = index < currentStepIndex
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 mb-6 rounded transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.viajeId 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.folio 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.clienteId 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.origen 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.destino 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.fechaCarga 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.fechaEntrega 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.horaEntrega 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.operadorId 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.unidadId 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.caja 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.casetas 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.dieselLitros 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.precioDiesel 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.comisionOperador 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.gastosExtras 
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
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                      errors.costoTotal 
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
              {isLoading ? 'Guardando...' : validationStep === 'costos' ? 'Crear bitácora' : 'Continuar →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditBitacoraModal = ({ isOpen, onClose, onSave, bitacora, viajes, operadores, clientes, unidades }) => {
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
    numeroFactura: '',
    creadoPor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [costoDiesel, setCostoDiesel] = useState(0) // Estado para mostrar el cálculo

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
    }
  }, [isOpen])

  // Calcular costo de diesel cuando cambien litros o precio
  useEffect(() => {
    const litros = parseFloat(formData.dieselLitros) || 0
    const precio = parseFloat(formData.precioDiesel) || 0
    const costo = litros * precio
    setCostoDiesel(costo)
  }, [formData.dieselLitros, formData.precioDiesel])

  useEffect(() => {
    if (bitacora) {
      // El campo dieselLitros en el backend almacena el COSTO TOTAL en pesos
      // Necesitamos calcular los litros reales si tenemos el precio
      const costoDieselTotal = parseFloat(bitacora.dieselLitros) || 0
      const precioDelDiesel = parseFloat(bitacora.precioDiesel) || 0
      
      // Si tenemos precio, calculamos los litros; si no, dejamos el costo como litros (para retrocompatibilidad)
      const litrosCalculados = precioDelDiesel > 0 ? (costoDieselTotal / precioDelDiesel) : costoDieselTotal
      
      setFormData({
        viajeId: bitacora.viajeId || '',
        folio: bitacora.folio || '',
        clienteId: bitacora.clienteId || '',
        origen: bitacora.origen || '',
        destino: bitacora.destino || '',
        fechaCarga: bitacora.fechaCarga || '',
        fechaEntrega: bitacora.fechaEntrega || '',
        horaEntrega: bitacora.horaEntrega || '',
        operadorId: bitacora.operadorId || '',
        unidadId: bitacora.unidadId || '',
        caja: bitacora.caja || '',
        casetas: bitacora.casetas || '',
        dieselLitros: litrosCalculados.toFixed(2), // Mostrar litros reales calculados
        precioDiesel: precioDelDiesel || '', // Cargar precio diesel existente
        comisionOperador: bitacora.comisionOperador || '',
        gastosExtras: bitacora.gastosExtras || '',
        costoTotal: bitacora.costoTotal || '',
        comentarios: bitacora.comentarios || '',
        numeroFactura: bitacora.numeroFactura || '',
        creadoPor: bitacora.creadoPor || ''
      })
    }
  }, [bitacora])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
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
      await onSave(bitacora.id, dataToSend)
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
          <h2 className="text-2xl font-bold text-slate-900">Editar bitácora de viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del viaje</p>
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
                    onChange={(e) => setFormData({ ...formData, viajeId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="">Selecciona un viaje</option>
                    {viajes && viajes.map((viaje) => (
                      <option key={viaje.id} value={viaje.id}>
                        #{viaje.id} - {viaje.origen} → {viaje.destino}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Folio *
                  </label>
                  <input
                    type="text"
                    value={formData.folio}
                    onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
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
                    onChange={(e) => setFormData({ ...formData, fechaCarga: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora de Entrega *
                  </label>
                  <input
                    type="time"
                    value={formData.horaEntrega}
                    onChange={(e) => setFormData({ ...formData, horaEntrega: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
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
                    onChange={(e) => setFormData({ ...formData, operadorId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="">Selecciona un operador</option>
                    {operadores && operadores.map((operador) => (
                      <option key={operador.id} value={operador.id}>
                        {operador.nombre} - {operador.licencia}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unidad *
                  </label>
                  <select
                    value={formData.unidadId}
                    onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Caja *
                  </label>
                  <input
                    type="text"
                    value={formData.caja}
                    onChange={(e) => setFormData({ ...formData, caja: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
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
                    onChange={(e) => setFormData({ ...formData, casetas: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diesel (Litros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dieselLitros}
                    onChange={(e) => setFormData({ ...formData, dieselLitros: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Precio Diesel ($/Litro)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioDiesel}
                    onChange={(e) => setFormData({ ...formData, precioDiesel: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="24.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo Total Diesel (calculado)
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
                    onChange={(e) => setFormData({ ...formData, comisionOperador: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gastos Extras ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gastosExtras}
                    onChange={(e) => setFormData({ ...formData, gastosExtras: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo Total ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoTotal}
                    onChange={(e) => setFormData({ ...formData, costoTotal: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
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
              {isLoading ? 'Actualizando...' : 'Actualizar bitácora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, bitacoraFolio }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar bitácora</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar la bitácora <span className="font-semibold">{bitacoraFolio}</span>? 
            Esta acción no se puede deshacer y se perderán todos los registros asociados.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 cursor-pointer px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BitacoraPage() {
  const [bitacoras, setBitacoras] = useState([])
  const [filteredBitacoras, setFilteredBitacoras] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBitacora, setSelectedBitacora] = useState(null)

  // Estados para catálogos
  const [viajes, setViajes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [clientes, setClientes] = useState([])
  const [unidades, setUnidades] = useState([])

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBitacoras(bitacoras)
    } else {
      const filtered = bitacoras.filter(bitacora =>
        bitacora.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBitacoras(filtered)
    }
  }, [searchTerm, bitacoras])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        fetchBitacoras(),
        fetchViajes(),
        fetchOperadores(),
        fetchClientes(),
        fetchUnidades()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBitacoras = async () => {
    try {
      const response = await bitacoraService.getAll()
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setBitacoras(data)
      setFilteredBitacoras(data)
    } catch (error) {
      console.error('Error fetching bitácoras:', error)
      toast.error('Error al cargar las bitácoras')
      setBitacoras([])
      setFilteredBitacoras([])
    }
  }

  const fetchViajes = async () => {
    try {
      const response = await viajesService.getViajes(0, 100)
      setViajes(response.content || [])
    } catch (error) {
      console.error('Error fetching viajes:', error)
      setViajes([])
    }
  }

  const fetchOperadores = async () => {
    try {
      const response = await operadoresService.getOperadores(0, 100)
      setOperadores(response.content || [])
    } catch (error) {
      console.error('Error fetching operadores:', error)
      setOperadores([])
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      setClientes(response.content || [])
    } catch (error) {
      console.error('Error fetching clientes:', error)
      setClientes([])
    }
  }

  const fetchUnidades = async () => {
    try {
      const response = await unidadesService.getAll()
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setUnidades(data)
    } catch (error) {
      console.error('Error fetching unidades:', error)
      setUnidades([])
    }
  }

  const handleCreate = async (data) => {
    try {
      await bitacoraService.create(data)
      toast.success('Bitácora creada exitosamente')
      fetchBitacoras()
    } catch (error) {
      console.error('Error creating bitácora:', error)
      toast.error('Error al crear la bitácora')
      throw error
    }
  }

  const handleEdit = async (id, data) => {
    try {
      await bitacoraService.update(id, data)
      toast.success('Bitácora actualizada exitosamente')
      fetchBitacoras()
    } catch (error) {
      console.error('Error updating bitácora:', error)
      toast.error('Error al actualizar la bitácora')
      throw error
    }
  }

  const handleDelete = async () => {
    try {
      await bitacoraService.delete(selectedBitacora.id)
      toast.success('Bitácora eliminada exitosamente')
      setShowDeleteModal(false)
      setSelectedBitacora(null)
      fetchBitacoras()
    } catch (error) {
      console.error('Error deleting bitácora:', error)
      toast.error('Error al eliminar la bitácora')
    }
  }

  const calculateStats = () => {
    // Asegurarse de que bitacoras sea un array
    const bitacorasArray = Array.isArray(bitacoras) ? bitacoras : []
    const totalBitacoras = bitacorasArray.length
    const totalCosto = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.costoTotal) || 0), 0)
    const totalDiesel = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.dieselLitros) || 0), 0)
    const totalCasetas = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.casetas) || 0), 0)

    return {
      totalBitacoras,
      totalCosto,
      totalDiesel,
      totalCasetas
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando bitácoras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Bitácora de Viajes
            </h1>
            <p className="text-slate-600 mt-1">Gestiona y monitorea todos los viajes registrados</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl cursor-pointer font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva bitácora
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Viajes"
            value={stats.totalBitacoras}
            icon={FileText}
            color="bg-blue-600"
            description="Bitácoras registradas"
          />
          <StatCard
            title="Costo Total"
            value={new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0
            }).format(stats.totalCosto)}
            icon={DollarSign}
            color="bg-emerald-600"
            description="Suma de todos los viajes"
          />
          <StatCard
            title="Diesel Total"
            value={`${stats.totalDiesel.toFixed(1)} L`}
            icon={Fuel}
            color="bg-amber-600"
            description="Litros consumidos"
          />
          <StatCard
            title="Casetas Total"
            value={new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0
            }).format(stats.totalCasetas)}
            icon={Receipt}
            color="bg-purple-600"
            description="Gastos en casetas"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por folio, origen, destino o número de factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Bitácoras List */}
        {filteredBitacoras.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No se encontraron bitácoras' : 'No hay bitácoras registradas'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera bitácora de viaje'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear bitácora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBitacoras.map((bitacora) => (
              <BitacoraCard
                key={bitacora.id}
                bitacora={bitacora}
                onEdit={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowEditModal(true)
                }}
                onDelete={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowDeleteModal(true)
                }}
                onViewDetails={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowViewModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateBitacoraModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <EditBitacoraModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedBitacora(null)
        }}
        onSave={handleEdit}
        bitacora={selectedBitacora}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ViewBitacoraModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedBitacora(null)
        }}
        bitacora={selectedBitacora}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedBitacora(null)
        }}
        onConfirm={handleDelete}
        bitacoraFolio={selectedBitacora?.folio}
      />
    </div>
  )
}