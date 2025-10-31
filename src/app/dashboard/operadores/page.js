'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users as UsersIcon, 
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { operadoresService } from '@/app/services/operadoresService'
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

const OperadorCard = ({ operador, onEdit, onDelete, onViewDetails }) => {
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

  // Verificar si la licencia está por vencer (30 días o menos)
  const isLicenseExpiringSoon = () => {
    if (!operador.licenciaVencimiento) return false
    const today = new Date()
    const expirationDate = new Date(operador.licenciaVencimiento)
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0
  }

  const isLicenseExpired = () => {
    if (!operador.licenciaVencimiento) return false
    const today = new Date()
    const expirationDate = new Date(operador.licenciaVencimiento)
    return expirationDate < today
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              operador.activo 
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' 
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{operador.nombre}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                  operador.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {operador.activo ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactivo
                    </>
                  )}
                </span>
                {isLicenseExpired() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Licencia vencida
                  </span>
                )}
                {!isLicenseExpired() && isLicenseExpiringSoon() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Por vencer
                  </span>
                )}
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
                    onViewDetails(operador)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(operador)
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
                    onDelete(operador)
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

        <div className="space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400" />
            {operador.telefono}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
            Licencia: {operador.licenciaNumero} - Tipo {operador.licenciaTipo}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            Vence: {operador.licenciaVencimiento ? new Date(operador.licenciaVencimiento).toLocaleDateString('es-MX') : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

const CreateOperadorModal = ({ isOpen, onClose, onSave, users }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    licenciaNumero: '',
    licenciaTipo: 'A',
    licenciaVencimiento: '',
    usuarioId: '',
    activo: true
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Limpiar errores al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setErrors({})
    }
  }, [isOpen])

  // Función de validación
  const validateForm = () => {
    const newErrors = {}

    // Validar nombre (mínimo 3 caracteres, no números)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (/\d/.test(formData.nombre)) {
      newErrors.nombre = 'El nombre no puede contener números'
    }

    // Validar teléfono (exactamente 10 dígitos)
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener exactamente 10 dígitos'
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = 'La dirección debe tener al menos 10 caracteres'
    }

    // Validar número de licencia (formato típico mexicano: 8-16 caracteres alfanuméricos)
    if (!formData.licenciaNumero.trim()) {
      newErrors.licenciaNumero = 'El número de licencia es obligatorio'
    } else if (formData.licenciaNumero.trim().length < 8) {
      newErrors.licenciaNumero = 'El número de licencia debe tener al menos 8 caracteres'
    } else if (formData.licenciaNumero.trim().length > 16) {
      newErrors.licenciaNumero = 'El número de licencia no puede tener más de 16 caracteres'
    } else if (!/^[A-Z0-9]+$/.test(formData.licenciaNumero.trim())) {
      newErrors.licenciaNumero = 'El número de licencia solo puede contener letras mayúsculas y números'
    }

    // Validar tipo de licencia
    if (!formData.licenciaTipo) {
      newErrors.licenciaTipo = 'Debes seleccionar un tipo de licencia'
    }

    // Validar fecha de vencimiento
    if (!formData.licenciaVencimiento) {
      newErrors.licenciaVencimiento = 'La fecha de vencimiento es obligatoria'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const vencimiento = new Date(formData.licenciaVencimiento)
      
      if (vencimiento < today) {
        newErrors.licenciaVencimiento = 'La licencia no puede estar vencida'
      }
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
      const dataToSend = {
        ...formData,
        usuarioId: formData.usuarioId ? parseInt(formData.usuarioId) : null
      }
      await onSave(dataToSend)
      setFormData({
        nombre: '',
        telefono: '',
        direccion: '',
        licenciaNumero: '',
        licenciaTipo: 'A',
        licenciaVencimiento: '',
        usuarioId: '',
        activo: true
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving operador:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo operador</h2>
          <p className="text-sm text-slate-600 mt-1">Completa la información del operador</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Información personal
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData({ ...formData, nombre: e.target.value })
                  if (errors.nombre) setErrors({ ...errors, nombre: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.nombre 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="Juan Pérez García"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => {
                  setFormData({ ...formData, telefono: e.target.value })
                  if (errors.telefono) setErrors({ ...errors, telefono: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.telefono 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="5551234567"
                maxLength={10}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.telefono}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario asociado
              </label>
              <select
                value={formData.usuarioId}
                onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              >
                <option value="">Sin usuario asociado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección *
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => {
                  setFormData({ ...formData, direccion: e.target.value })
                  if (errors.direccion) setErrors({ ...errors, direccion: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.direccion 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                rows={2}
                placeholder="Calle, número, colonia, ciudad, estado"
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.direccion}
                </p>
              )}
            </div>

            {/* Información de Licencia */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Información de licencia
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de licencia *
              </label>
              <input
                type="text"
                value={formData.licenciaNumero}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  setFormData({ ...formData, licenciaNumero: value })
                  if (errors.licenciaNumero) setErrors({ ...errors, licenciaNumero: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.licenciaNumero 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                maxLength={16}
                placeholder="ABC123456789"
              />
              {errors.licenciaNumero && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.licenciaNumero}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de licencia *
              </label>
              <select
                value={formData.licenciaTipo}
                onChange={(e) => {
                  setFormData({ ...formData, licenciaTipo: e.target.value })
                  if (errors.licenciaTipo) setErrors({ ...errors, licenciaTipo: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.licenciaTipo 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="A">A - Motocicletas</option>
                <option value="B">B - Automóviles</option>
                <option value="C">C - Camiones ligeros</option>
                <option value="D">D - Camiones pesados</option>
                <option value="E">E - Transporte de pasajeros</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={formData.licenciaVencimiento}
                onChange={(e) => {
                  setFormData({ ...formData, licenciaVencimiento: e.target.value })
                  if (errors.licenciaVencimiento) setErrors({ ...errors, licenciaVencimiento: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.licenciaVencimiento 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {errors.licenciaVencimiento && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.licenciaVencimiento}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Operador activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              {isLoading ? 'Guardando...' : 'Guardar operador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditOperadorModal = ({ isOpen, onClose, onSave, operador, users }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    licenciaNumero: '',
    licenciaTipo: 'A',
    licenciaVencimiento: '',
    usuarioId: '',
    activo: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (operador) {
      setFormData({
        nombre: operador.nombre || '',
        telefono: operador.telefono || '',
        direccion: operador.direccion || '',
        licenciaNumero: operador.licenciaNumero || '',
        licenciaTipo: operador.licenciaTipo || 'A',
        licenciaVencimiento: operador.licenciaVencimiento || '',
        usuarioId: operador.usuarioId || '',
        activo: operador.activo ?? true
      })
    }
  }, [operador])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        usuarioId: formData.usuarioId ? parseInt(formData.usuarioId) : null
      }
      await onSave(operador.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving operador:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar operador</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del operador</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Información personal
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario asociado
              </label>
              <select
                value={formData.usuarioId}
                onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              >
                <option value="">Sin usuario asociado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección *
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                rows={2}
                required
              />
            </div>

            {/* Información de Licencia */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Información de licencia
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de licencia *
              </label>
              <input
                type="text"
                value={formData.licenciaNumero}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  setFormData({ ...formData, licenciaNumero: value })
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                maxLength={16}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de licencia *
              </label>
              <select
                value={formData.licenciaTipo}
                onChange={(e) => setFormData({ ...formData, licenciaTipo: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              >
                <option value="A">A - Motocicletas</option>
                <option value="B">B - Automóviles</option>
                <option value="C">C - Camiones ligeros</option>
                <option value="D">D - Camiones pesados</option>
                <option value="E">E - Transporte de pasajeros</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={formData.licenciaVencimiento}
                onChange={(e) => setFormData({ ...formData, licenciaVencimiento: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Operador activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              {isLoading ? 'Actualizando...' : 'Actualizar operador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewOperadorModal = ({ isOpen, onClose, operador }) => {
  if (!isOpen || !operador) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del operador</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del operador</p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              operador.activo 
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700' 
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <User className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Información personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre completo</label>
                <p className="text-sm text-slate-900 mt-1">{operador.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Teléfono</label>
                <p className="text-sm text-slate-900 mt-1">{operador.telefono}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500">Dirección</label>
                <p className="text-sm text-slate-900 mt-1">{operador.direccion}</p>
              </div>
            </div>
          </div>

          {/* Información de Licencia */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Información de licencia
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Número de licencia</label>
                <p className="text-sm text-slate-900 mt-1">{operador.licenciaNumero}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Tipo</label>
                <p className="text-sm text-slate-900 mt-1">Tipo {operador.licenciaTipo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de vencimiento</label>
                <p className="text-sm text-slate-900 mt-1">
                  {operador.licenciaVencimiento ? new Date(operador.licenciaVencimiento).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                    operador.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {operador.activo ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          {operador.id && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Información del sistema
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">ID de Operador</label>
                  <p className="text-sm text-slate-900 mt-1">#{operador.id}</p>
                </div>
                {operador.usuarioId && (
                  <div>
                    <label className="text-xs font-medium text-slate-500">Usuario asociado</label>
                    <p className="text-sm text-slate-900 mt-1">ID: {operador.usuarioId}</p>
                  </div>
                )}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, operadorName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar operador</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{operadorName}</span>? 
            Esta acción no se puede deshacer.
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

const OperadoresPage = () => {
  const [operadores, setOperadores] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOperador, setSelectedOperador] = useState(null)
  const [operadorToDelete, setOperadorToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    licenciasVencidas: 0
  })

  const loadOperadores = async () => {
    try {
      const response = await operadoresService.getOperadores(0, 100)
      const operadoresData = response.content || []
      setOperadores(operadoresData)
      
      // Calcular licencias vencidas
      const today = new Date()
      const licenciasVencidas = operadoresData.filter(op => {
        if (!op.licenciaVencimiento) return false
        const expirationDate = new Date(op.licenciaVencimiento)
        return expirationDate < today
      }).length

      setStats({
        total: response.totalElements || operadoresData.length,
        activos: operadoresData.filter(op => op.activo).length,
        inactivos: operadoresData.filter(op => !op.activo).length,
        licenciasVencidas
      })
    } catch (error) {
      console.error('Error loading operadores:', error)
      toast.error('Error al cargar operadores')
    }
  }

  const loadUsers = async () => {
    try {
      const response = await usersService.getUsers(0, 100)
      setUsers(response.content || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([loadOperadores(), loadUsers()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  const handleCreateOperador = async (operadorData) => {
    try {
      await operadoresService.createOperador(operadorData)
      toast.success('Operador creado exitosamente')
      loadOperadores()
    } catch (error) {
      toast.error(error.message || 'Error al crear operador')
      throw error
    }
  }

  const handleEditOperador = async (operador) => {
    try {
      const fullOperador = await operadoresService.getOperadorById(operador.id)
      setSelectedOperador(fullOperador)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del operador')
    }
  }

  const handleUpdateOperador = async (operadorId, operadorData) => {
    try {
      await operadoresService.updateOperador(operadorId, operadorData)
      toast.success('Operador actualizado exitosamente')
      setShowEditModal(false)
      setSelectedOperador(null)
      loadOperadores()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar operador')
      throw error
    }
  }

  const handleDeleteOperador = async (operador) => {
    setOperadorToDelete(operador)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!operadorToDelete) return

    try {
      await operadoresService.deleteOperador(operadorToDelete.id)
      toast.success(`Operador ${operadorToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setOperadorToDelete(null)
      loadOperadores()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar operador')
    }
  }

  const handleViewDetails = async (operador) => {
    try {
      const fullOperador = await operadoresService.getOperadorById(operador.id)
      setSelectedOperador(fullOperador)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del operador')
    }
  }

  const filteredOperadores = operadores.filter(operador => {
    const matchesSearch = operador.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operador.telefono.includes(searchTerm) ||
                         operador.licenciaNumero.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'activo') {
      matchesStatus = operador.activo === true
    } else if (filterStatus === 'inactivo') {
      matchesStatus = operador.activo === false
    }
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de operadores</h1>
            <p className="text-slate-600 mt-2">Administra los operadores y sus licencias</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo operador</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total operadores"
          value={stats.total}
          icon={UsersIcon}
          color="bg-blue-600"
          description="Operadores registrados"
        />
        <StatCard
          title="Operadores activos"
          value={stats.activos}
          icon={CheckCircle}
          color="bg-emerald-600"
          description="Disponibles"
        />
        <StatCard
          title="Operadores inactivos"
          value={stats.inactivos}
          icon={XCircle}
          color="bg-slate-600"
          description="No disponibles"
        />
        <StatCard
          title="Licencias vencidas"
          value={stats.licenciasVencidas}
          icon={AlertCircle}
          color="bg-red-600"
          description="Requieren renovación"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o licencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operadores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOperadores.map((operador) => (
          <OperadorCard
            key={operador.id}
            operador={operador}
            onEdit={handleEditOperador}
            onDelete={handleDeleteOperador}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredOperadores.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron operadores</p>
        </div>
      )}

      {/* Modals */}
      <CreateOperadorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateOperador}
        users={users}
      />

      <EditOperadorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedOperador(null)
        }}
        onSave={handleUpdateOperador}
        operador={selectedOperador}
        users={users}
      />

      <ViewOperadorModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedOperador(null)
        }}
        operador={selectedOperador}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setOperadorToDelete(null)
        }}
        onConfirm={confirmDelete}
        operadorName={operadorToDelete?.nombre}
      />
    </div>
  )
}

export default OperadoresPage;