'use client'

import { useState, useEffect } from 'react'
import { Truck, Settings, Wrench, Calendar, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'

const CreateUnidadModal = ({ isOpen, onClose, onSave }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [formData, setFormData] = useState({
    placas: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    tipo: 'TRACTOCAMION',
    kilometrajeActual: '',
    fechaUltimoMto: '',
    estado: 'ACTIVA'
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Obtener usuario autenticado al montar el componente
    const user = authService.getUser()
    setCurrentUser(user)
  }, [])

  // Limpiar errores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setErrors({})
    }
  }, [isOpen])

  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar número económico (formato mexicano: 7 caracteres - 3 letras + 4 números o 4 letras + 3 números)
    if (!formData.placas.trim()) {
      newErrors.placas = 'El número económico es obligatorio'
    } else if (formData.placas.trim().length < 6) {
      newErrors.placas = 'El número económico debe tener al menos 6 caracteres'
    } else if (formData.placas.trim().length > 10) {
      newErrors.placas = 'El número económico no puede tener más de 10 caracteres'
    } else if (!/^[A-Z0-9-]+$/.test(formData.placas.trim())) {
      newErrors.placas = 'El número económico solo puede contener letras mayúsculas, números y guiones'
    }

    // Validar marca (mínimo 2 caracteres, solo letras)
    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria'
    } else if (formData.marca.trim().length < 2) {
      newErrors.marca = 'La marca debe tener al menos 2 caracteres'
    } else if (/\d/.test(formData.marca)) {
      newErrors.marca = 'La marca no puede contener números'
    }

    // Validar modelo (mínimo 2 caracteres)
    if (!formData.modelo.trim()) {
      newErrors.modelo = 'El modelo es obligatorio'
    } else if (formData.modelo.trim().length < 2) {
      newErrors.modelo = 'El modelo debe tener al menos 2 caracteres'
    }

    // Validar año
    const currentYear = new Date().getFullYear()
    const anio = parseInt(formData.anio)
    if (!formData.anio) {
      newErrors.anio = 'El año es obligatorio'
    } else if (isNaN(anio) || anio < 1900 || anio > currentYear + 1) {
      newErrors.anio = `El año debe estar entre 1900 y ${currentYear + 1}`
    }

    // Validar tipo
    if (!formData.tipo) {
      newErrors.tipo = 'Debes seleccionar un tipo de unidad'
    }

    // Validar kilometraje (debe ser positivo)
    if (formData.kilometrajeActual) {
      const km = parseFloat(formData.kilometrajeActual)
      if (isNaN(km) || km < 0) {
        newErrors.kilometrajeActual = 'El kilometraje debe ser un número positivo'
      }
    }

    // Validar fecha de último mantenimiento (opcional pero debe ser válida)
    if (formData.fechaUltimoMto) {
      const fechaMto = new Date(formData.fechaUltimoMto)
      const today = new Date()

      if (fechaMto > today) {
        newErrors.fechaUltimoMto = 'La fecha de mantenimiento no puede ser futura'
      }
    }

    // Validar estado
    if (!formData.estado) {
      newErrors.estado = 'Debes seleccionar un estado'
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
      toast.error('No se pudo identificar el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        anio: parseInt(formData.anio),
        kilometrajeActual: parseFloat(formData.kilometrajeActual) || 0,
        creadoPorId: currentUser.id
      }
      await onSave(dataToSend)
      setFormData({
        placas: '',
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        tipo: 'TRACTOCAMION',
        kilometrajeActual: '',
        fechaUltimoMto: '',
        estado: 'ACTIVA'
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving unidad:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nueva unidad</h2>
          <p className="text-sm text-slate-600 mt-1">Registra una nueva unidad en el sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número Económico *
                  </label>
                  <input
                    type="text"
                    value={formData.placas}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                      setFormData({ ...formData, placas: value })
                      if (errors.placas) setErrors({ ...errors, placas: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.placas ? 'border-red-500' : 'border-slate-200'
                      }`}
                    maxLength={10}
                    placeholder="ABC123DEF"
                  />
                  {errors.placas && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.placas}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => {
                      setFormData({ ...formData, marca: e.target.value })
                      if (errors.marca) setErrors({ ...errors, marca: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.marca ? 'border-red-500' : 'border-slate-200'
                      }`}
                    placeholder="Freightliner"
                  />
                  {errors.marca && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.marca}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => {
                      setFormData({ ...formData, modelo: e.target.value })
                      if (errors.modelo) setErrors({ ...errors, modelo: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.modelo ? 'border-red-500' : 'border-slate-200'
                      }`}
                    placeholder="Cascadia"
                  />
                  {errors.modelo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.modelo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => {
                      setFormData({ ...formData, anio: e.target.value })
                      if (errors.anio) setErrors({ ...errors, anio: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.anio ? 'border-red-500' : 'border-slate-200'
                      }`}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.anio && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.anio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Especificaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de unidad *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => {
                      setFormData({ ...formData, tipo: e.target.value })
                      if (errors.tipo) setErrors({ ...errors, tipo: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.tipo ? 'border-red-500' : 'border-slate-200'
                      }`}
                  >
                    <option value="TRACTOCAMION">Tractocamión</option>
                    <option value="CAMION">Camión</option>
                    <option value="CAMIONETA">Camioneta</option>
                    <option value="REMOLQUE">Remolque</option>
                    <option value="SEMIREMOLQUE">Semiremolque</option>
                  </select>
                  {errors.tipo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.tipo}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => {
                      setFormData({ ...formData, estado: e.target.value })
                      if (errors.estado) setErrors({ ...errors, estado: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.estado ? 'border-red-500' : 'border-slate-200'
                      }`}
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVA">Inactiva</option>
                  </select>
                  {errors.estado && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.estado}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Mantenimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kilometraje actual *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.kilometrajeActual}
                    onChange={(e) => {
                      const value = Math.max(0, parseFloat(e.target.value) || 0)
                      setFormData({ ...formData, kilometrajeActual: value.toString() })
                      if (errors.kilometrajeActual) setErrors({ ...errors, kilometrajeActual: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.kilometrajeActual ? 'border-red-500' : 'border-slate-200'
                      }`}
                    placeholder="158000.5"
                  />
                  {errors.kilometrajeActual && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.kilometrajeActual}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha último mantenimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaUltimoMto}
                    onChange={(e) => {
                      setFormData({ ...formData, fechaUltimoMto: e.target.value })
                      if (errors.fechaUltimoMto) setErrors({ ...errors, fechaUltimoMto: '' })
                    }}
                    className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 ${errors.fechaUltimoMto ? 'border-red-500' : 'border-slate-200'
                      }`}
                  />
                  {errors.fechaUltimoMto && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fechaUltimoMto}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Usuario - Mostrar info del usuario autenticado */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Información de registro
              </h3>
              <div>
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
              disabled={isLoading}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Crear unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUnidadModal
