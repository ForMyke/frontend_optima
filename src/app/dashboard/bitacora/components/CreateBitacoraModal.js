'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Package,
  User,
  Fuel,
  AlertCircle,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'
import gastosService from '@/app/services/gastosService'

const CreateBitacoraModal = ({ isOpen, onClose, onSave, viajes, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    casetas: '',
    dieselLitros: '',
    comisionOperador: '',
    gastosExtras: '',
    costoTotal: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [totalViajes, setTotalViajes] = useState(0)

  // Cargar datos desde la API al abrir el modal (prellenado pero editable)
  useEffect(() => {
    const loadDatosGenerados = async () => {
      if (isOpen) {
        setLoadingDatos(true)
        try {
          // Cargar datos generados desde la API
          const datosGenerados = await gastosService.getGastosGenerados()
          
          // Prellenar todos los campos con los datos de la API
          setFormData({
            casetas: datosGenerados.iave?.toString() || '',
            dieselLitros: datosGenerados.diesel?.toString() || '',
            comisionOperador: datosGenerados.nomina?.toString() || '',
            gastosExtras: datosGenerados.gastosExtras?.toString() || '',
            costoTotal: (
              (parseFloat(datosGenerados.iave) || 0) +
              (parseFloat(datosGenerados.diesel) || 0) +
              (parseFloat(datosGenerados.nomina) || 0) +
              (parseFloat(datosGenerados.gastosExtras) || 0)
            ).toString()
          })
          
          setTotalViajes(datosGenerados.totalViajes || 0)
          setErrors({})
          
          toast.success('Datos precargados desde los viajes completados')
        } catch (error) {
          console.error('Error al cargar datos generados:', error)
          toast.error('Error al cargar datos automáticos')
          setTotalViajes(0)
        } finally {
          setLoadingDatos(false)
        }
      } else {
        // Limpiar cuando se cierra
        setFormData({
          casetas: '',
          dieselLitros: '',
          comisionOperador: '',
          gastosExtras: '',
          costoTotal: ''
        })
        setTotalViajes(0)
        setErrors({})
      }
    }

    loadDatosGenerados()
  }, [isOpen])

  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar costos
    if (!formData.casetas || parseFloat(formData.casetas) < 0) {
      newErrors.casetas = 'El valor de casetas es requerido y no puede ser negativo'
    }

    if (!formData.dieselLitros || parseFloat(formData.dieselLitros) < 0) {
      newErrors.dieselLitros = 'Los litros de diesel son requeridos y no pueden ser negativos'
    }

    if (!formData.comisionOperador || parseFloat(formData.comisionOperador) < 0) {
      newErrors.comisionOperador = 'La comisión del operador es requerida y no puede ser negativa'
    }

    if (formData.gastosExtras && parseFloat(formData.gastosExtras) < 0) {
      newErrors.gastosExtras = 'Los gastos extras no pueden ser negativos'
    }

    if (!formData.costoTotal || parseFloat(formData.costoTotal) < 0) {
      newErrors.costoTotal = 'El costo total es requerido y no puede ser negativo'
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

    setIsLoading(true)
    try {
      const user = authService.getUser()
      const creadoPor = user?.id || 1

      // Crear el objeto con el formato correcto de costos
      const dataToSend = {
        casetas: parseFloat(formData.casetas),
        dieselLitros: parseFloat(formData.dieselLitros),
        comisionOperador: parseFloat(formData.comisionOperador),
        gastosExtras: parseFloat(formData.gastosExtras) || 0,
        costoTotal: parseFloat(formData.costoTotal),
        creadoPor: creadoPor,
        totalViajes: totalViajes
      }

      await onSave(dataToSend)
      
      // Limpiar formulario
      setFormData({
        casetas: '',
        dieselLitros: '',
        comisionOperador: '',
        gastosExtras: '',
        costoTotal: ''
      })
      setTotalViajes(0)
      onClose()
    } catch (error) {
      console.error('Error en handleSubmit:', error)
      toast.error(error.message || 'Error al guardar la bitácora')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nueva Bitácora</h2>
          <p className="text-sm text-slate-600 mt-1">Registrar datos de la bitácora</p>
          
          {/* Mostrar total de viajes si está disponible */}
          {totalViajes > 0 && (
            <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Total de viajes: {totalViajes}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loadingDatos && (
          <div className="p-6">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span>Cargando datos automáticos...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Aviso de datos prellenados */}
          {!loadingDatos && formData.casetas && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900">Datos automáticos cargados</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Los campos se han prellenado con los datos calculados de los viajes completados. Puedes modificarlos según sea necesario.
                </p>
              </div>
            </div>
          )}

          {/* Tarjeta de información de Total de Viajes */}
          {totalViajes > 0 && (
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total de viajes registrados</p>
                    <p className="text-3xl font-bold text-blue-900">{totalViajes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                    Periodo actual
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Costos y Gastos del Viaje
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Casetas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Casetas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="casetas"
                    value={formData.casetas}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.casetas ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.casetas && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.casetas}</span>
                  </p>
                )}
              </div>

              {/* Diesel Litros */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Costo diesel <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="dieselLitros"
                    value={formData.dieselLitros}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.dieselLitros ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.dieselLitros && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.dieselLitros}</span>
                  </p>
                )}
              </div>

              {/* Comisión Operador */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comisión Operador <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="comisionOperador"
                    value={formData.comisionOperador}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.comisionOperador ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.comisionOperador && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.comisionOperador}</span>
                  </p>
                )}
              </div>

              {/* Gastos Extras */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gastos Extras
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="gastosExtras"
                    value={formData.gastosExtras}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.gastosExtras ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.gastosExtras && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.gastosExtras}</span>
                  </p>
                )}
              </div>

              {/* Costo Total */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Costo Total <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name="costoTotal"
                    value={formData.costoTotal}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.costoTotal ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.costoTotal && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.costoTotal}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingDatos}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  <span>Guardar Bitácora</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBitacoraModal
                