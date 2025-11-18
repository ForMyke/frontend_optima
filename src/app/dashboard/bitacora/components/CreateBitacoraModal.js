'use client'

import { useState, useEffect } from 'react'
import {
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

  // Función de validación (solo para campos de costos visibles)
  const validateForm = () => {
    const newErrors = {}

    // Validar viaje
    if (!formData.viajeId) {
      newErrors.viajeId = 'Debes seleccionar un viaje'
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

      // Obtener valores por defecto para campos no visibles
      const today = new Date().toISOString().split('T')[0]
      const defaultCliente = clientes && clientes.length > 0 ? clientes[0].id : 1
      const defaultOperador = operadores && operadores.length > 0 ? operadores[0].id : 1
      const defaultUnidad = unidades && unidades.length > 0 ? unidades[0].id : 1

      // Convertir strings a números y enviar costo de diesel calculado
      const dataToSend = {
        viajeId: parseInt(formData.viajeId),
        folio: `BIT-${Date.now()}`,
        clienteId: defaultCliente,
        origen: 'N/A',
        destino: 'N/A',
        fechaCarga: today,
        fechaEntrega: today,
        horaEntrega: '12:00',
        operadorId: defaultOperador,
        unidadId: defaultUnidad,
        caja: 'N/A',
        casetas: parseFloat(formData.casetas) || 0,
        dieselLitros: costoDieselTotal, // Enviar el costo total del diesel (litros × precio)
        comisionOperador: parseFloat(formData.comisionOperador) || 0,
        gastosExtras: parseFloat(formData.gastosExtras) || 0,
        costoTotal: parseFloat(formData.costoTotal) || 0,
        comentarios: formData.comentarios || '',
        numeroFactura: formData.numeroFactura || '',
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
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Registrar Costos de Viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Captura los costos y gastos asociados al viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Selección de Viaje */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Viaje * <span className="text-slate-500 font-normal">(selecciona el viaje al que pertenecen estos costos)</span>
              </label>
              <select
                value={formData.viajeId}
                onChange={(e) => {
                  setFormData({ ...formData, viajeId: e.target.value })
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
              {errors.viajeId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.viajeId}
                </p>
              )}
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

            {/* Información Adicional */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Información Adicional
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Registrado por
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-medium">{currentUser?.nombre || 'Cargando...'}</span>
                      </div>
                    </div>
                  </div>
                </div>
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