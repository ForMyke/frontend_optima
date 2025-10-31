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
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Eye,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsService } from '@/app/services/clientsService'

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <p className="text-xs lg:text-sm font-medium text-slate-600">{title}</p>
          <div className={`p-1.5 lg:p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
          </div>
        </div>
        <p className="text-xl lg:text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
)

const ClientCard = ({ client, onEdit, onDelete, onViewDetails }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-4 lg:p-6">
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700 shrink-0">
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">{client.nombre}</h3>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">RFC: {client.rfc}</p>
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
                    onViewDetails(client)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(client)
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
                    onDelete(client)
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
          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Mail className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            <span className="truncate">{client.correo}</span>
          </div>
          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            {client.telefono}
          </div>
          <div className="flex items-start text-xs lg:text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{client.direccion}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const CreateClientModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    correo: ''
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

    // Validar nombre (no debe contener números)
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (/\d/.test(formData.nombre)) {
      newErrors.nombre = 'El nombre no puede contener números'
    }

    // Validar RFC (exactamente 13 caracteres)
    if (!formData.rfc.trim()) {
      newErrors.rfc = 'El RFC es obligatorio'
    } else if (formData.rfc.trim().length !== 13) {
      newErrors.rfc = 'El RFC debe tener exactamente 13 caracteres'
    } else if (!/^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/.test(formData.rfc.trim().toUpperCase())) {
      newErrors.rfc = 'El formato del RFC no es válido (4 letras + 6 dígitos + 3 alfanuméricos)'
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }

    // Validar correo (mejorada para evitar puntos antes del @)
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo electrónico es obligatorio'
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9]@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.correo.trim())) {
      newErrors.correo = 'El formato del correo no es válido (no puede empezar o terminar con punto antes del @)'
    }

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    } else if (formData.direccion.trim().length < 10) {
      newErrors.direccion = 'La dirección debe tener al menos 10 caracteres'
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
      await onSave(formData)
      setFormData({
        nombre: '',
        rfc: '',
        direccion: '',
        telefono: '',
        correo: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo cliente</h2>
          <p className="text-sm text-slate-600 mt-1">Completa la información del cliente</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre / Razón social *
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
                placeholder="Empresa S.A. de C.V."
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
                RFC *
              </label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => {
                  setFormData({ ...formData, rfc: e.target.value.toUpperCase() })
                  if (errors.rfc) setErrors({ ...errors, rfc: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.rfc 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                maxLength={13}
                placeholder="ABC123456XYZ"
              />
              {errors.rfc && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.rfc}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => {
                  setFormData({ ...formData, correo: e.target.value })
                  if (errors.correo) setErrors({ ...errors, correo: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.correo 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="contacto@empresa.com"
              />
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.correo}
                </p>
              )}
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
                rows={3}
                placeholder="Calle, número, colonia, ciudad, estado"
              />
              {errors.direccion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.direccion}
                </p>
              )}
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
              {isLoading ? 'Guardando...' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditClientModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    correo: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({
        nombre: client.nombre || '',
        rfc: client.rfc || '',
        direccion: client.direccion || '',
        telefono: client.telefono || '',
        correo: client.correo || ''
      })
    }
  }, [client])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(client.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar cliente</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del cliente</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre / Razón social *
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
                RFC *
              </label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
                maxLength={13}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dirección *
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                rows={3}
                required
              />
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
              {isLoading ? 'Actualizando...' : 'Actualizar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewClientModal = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del cliente</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del cliente</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Información general
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre / Razón social</label>
                <p className="text-sm text-slate-900 mt-1">{client.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">RFC</label>
                <p className="text-sm text-slate-900 mt-1">{client.rfc}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Información de contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Correo electrónico</label>
                <p className="text-sm text-slate-900 mt-1">{client.correo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Teléfono</label>
                <p className="text-sm text-slate-900 mt-1">{client.telefono}</p>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Ubicación
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-500">Dirección</label>
              <p className="text-sm text-slate-900 mt-1">{client.direccion}</p>
            </div>
          </div>

          {/* Información del Sistema */}
          {client.id && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Información del sistema
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">ID de Cliente</label>
                  <p className="text-sm text-slate-900 mt-1">#{client.id}</p>
                </div>
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, clientName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar cliente</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{clientName}</span>? 
            Esta acción no se puede deshacer.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
const ClientesPage = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0
  })

  const loadClients = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      const clientsData = response.content || []
      setClients(clientsData)
      
      setStats({
        total: response.totalElements || clientsData.length
      })
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Error al cargar clientes')
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await loadClients()
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  const handleCreateClient = async (clientData) => {
    try {
      await clientsService.createClient(clientData)
      toast.success('Cliente creado exitosamente')
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al crear cliente')
      throw error
    }
  }

  const handleEditClient = async (client) => {
    try {
      const fullClient = await clientsService.getClientById(client.id)
      setSelectedClient(fullClient)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del cliente')
    }
  }

  const handleUpdateClient = async (clientId, clientData) => {
    try {
      await clientsService.updateClient(clientId, clientData)
      toast.success('Cliente actualizado exitosamente')
      setShowEditModal(false)
      setSelectedClient(null)
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar cliente')
      throw error
    }
  }

  const handleDeleteClient = async (client) => {
    setClientToDelete(client)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return

    try {
      await clientsService.deleteClient(clientToDelete.id)
      toast.success(`Cliente ${clientToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setClientToDelete(null)
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar cliente')
    }
  }

  const handleViewDetails = async (client) => {
    try {
      const fullClient = await clientsService.getClientById(client.id)
      setSelectedClient(fullClient)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del cliente')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.correo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-28 lg:h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de clientes</h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Administra la cartera de clientes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo cliente</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total clientes"
          value={stats.total}
          icon={UsersIcon}
          color="bg-blue-600"
          description="Clientes registrados"
        />
        <StatCard
          title="Activos este mes"
          value={stats.total}
          icon={Building2}
          color="bg-emerald-600"
          description="Con operaciones"
        />
        <StatCard
          title="Nuevos este mes"
          value="0"
          icon={UserPlus}
          color="bg-purple-600"
          description="Registros recientes"
        />
        <StatCard
          title="Por contactar"
          value="0"
          icon={Phone}
          color="bg-orange-600"
          description="Pendientes"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron clientes</p>
        </div>
      )}

      {/* Modals */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateClient}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedClient(null)
        }}
        onSave={handleUpdateClient}
        client={selectedClient}
      />

      <ViewClientModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedClient(null)
        }}
        client={selectedClient}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setClientToDelete(null)
        }}
        onConfirm={confirmDelete}
        clientName={clientToDelete?.nombre}
      />
    </div>
  )
}
export default ClientesPage;