'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Gauge,
  AlertCircle,
  CheckCircle,
  Settings,
  Wrench,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { unidadesService } from '@/app/services/unidadesService'
import { usersService } from '@/app/services/usersService'
import { authService } from '@/app/services/authService'

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

const UnidadCard = ({ unidad, onEdit, onDelete, onViewDetails }) => {
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

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVA':
        return 'bg-emerald-100 text-emerald-800'
      case 'MANTENIMIENTO':
        return 'bg-amber-100 text-amber-800'
      case 'INACTIVA':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{unidad.placas}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getEstadoColor(unidad.estado)}`}>
                  {unidad.estado}
                </span>
              </div>
              <p className="text-sm text-slate-500">{unidad.marca} {unidad.modelo} {unidad.anio}</p>
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
                    onViewDetails(unidad)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(unidad)
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
                    onDelete(unidad)
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
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Tipo
            </span>
            <span className="font-medium text-slate-900">{unidad.tipo}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Gauge className="h-3.5 w-3.5 mr-1.5" />
              Kilometraje
            </span>
            <span className="font-medium text-slate-900">{unidad.kilometrajeActual?.toLocaleString('es-MX')} km</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Wrench className="h-3.5 w-3.5 mr-1.5" />
              Último Mto.
            </span>
            <span className="font-medium text-slate-900">{formatDate(unidad.fechaUltimoMto)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            ID: {unidad.id}
          </div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            {unidad.estado === 'ACTIVA' ? (
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
            )}
            {unidad.estado === 'ACTIVA' ? 'Disponible' : 'No disponible'}
          </div>
        </div>
      </div>
    </div>
  )
}

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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Obtener usuario autenticado al montar el componente
    const user = authService.getUser()
    setCurrentUser(user)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

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
                    Placas *
                  </label>
                  <input
                    type="text"
                    value={formData.placas}
                    onChange={(e) => setFormData({ ...formData, placas: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="TX-9021-B"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="Freightliner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="Cascadia"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
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
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="TRACTOCAMION">Tractocamión</option>
                    <option value="CAMION">Camión</option>
                    <option value="CAMIONETA">Camioneta</option>
                    <option value="REMOLQUE">Remolque</option>
                    <option value="SEMIREMOLQUE">Semiremolque</option>
                  </select>
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
                    <option value="ACTIVA">Activa</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVA">Inactiva</option>
                  </select>
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
                    value={formData.kilometrajeActual}
                    onChange={(e) => setFormData({ ...formData, kilometrajeActual: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="158000.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha último mantenimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaUltimoMto}
                    onChange={(e) => setFormData({ ...formData, fechaUltimoMto: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
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

const EditUnidadModal = ({ isOpen, onClose, onSave, unidad }) => {
  const [formData, setFormData] = useState({
    placas: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    tipo: 'TRACTOCAMION',
    kilometrajeActual: '',
    fechaUltimoMto: '',
    estado: 'ACTIVA',
    creadoPorId: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (unidad) {
      setFormData({
        placas: unidad.placas || '',
        marca: unidad.marca || '',
        modelo: unidad.modelo || '',
        anio: unidad.anio || new Date().getFullYear(),
        tipo: unidad.tipo || 'TRACTOCAMION',
        kilometrajeActual: unidad.kilometrajeActual || '',
        fechaUltimoMto: unidad.fechaUltimoMto || '',
        estado: unidad.estado || 'ACTIVA',
        creadoPorId: unidad.creadoPorId || 1
      })
    }
  }, [unidad])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        anio: parseInt(formData.anio),
        kilometrajeActual: parseFloat(formData.kilometrajeActual) || 0,
        creadoPorId: parseInt(formData.creadoPorId)
      }
      await onSave(unidad.id, dataToSend)
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
          <h2 className="text-2xl font-bold text-slate-900">Editar unidad</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información de la unidad</p>
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
                    Placas *
                  </label>
                  <input
                    type="text"
                    value={formData.placas}
                    onChange={(e) => setFormData({ ...formData, placas: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
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
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="TRACTOCAMION">Tractocamión</option>
                    <option value="CAMION">Camión</option>
                    <option value="CAMIONETA">Camioneta</option>
                    <option value="REMOLQUE">Remolque</option>
                    <option value="SEMIREMOLQUE">Semiremolque</option>
                  </select>
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
                    <option value="ACTIVA">Activa</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVA">Inactiva</option>
                  </select>
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
                    value={formData.kilometrajeActual}
                    onChange={(e) => setFormData({ ...formData, kilometrajeActual: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha último mantenimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaUltimoMto}
                    onChange={(e) => setFormData({ ...formData, fechaUltimoMto: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Usuario */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Información de registro
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Creado por (ID Usuario) *
                  </label>
                  <input
                    type="number"
                    value={formData.creadoPorId}
                    onChange={(e) => setFormData({ ...formData, creadoPorId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
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
              disabled={isLoading}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewUnidadModal = ({ isOpen, onClose, unidad }) => {
  const [creadorNombre, setCreadorNombre] = useState('Cargando...')

  useEffect(() => {
    const fetchCreador = async () => {
      if (unidad?.creadoPorId) {
        try {
          const usuario = await usersService.getUserById(unidad.creadoPorId)
          setCreadorNombre(usuario.nombre || 'Usuario desconocido')
        } catch (error) {
          console.error('Error al cargar usuario:', error)
          setCreadorNombre('Usuario no encontrado')
        }
      }
    }

    if (isOpen && unidad) {
      fetchCreador()
    }
  }, [isOpen, unidad])

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstadoBadge = (estado) => {
    const styles = {
      ACTIVA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      MANTENIMIENTO: 'bg-amber-100 text-amber-800 border-amber-200',
      INACTIVA: 'bg-red-100 text-red-800 border-red-200'
    }
    return styles[estado] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  if (!isOpen || !unidad) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles de la unidad</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa de la unidad</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Información General
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Placas</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{unidad.placas}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Marca</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.marca}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Modelo</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.modelo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Año</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.anio}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Tipo</label>
                <p className="text-sm text-slate-900 mt-1">{unidad.tipo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <p className="text-sm mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getEstadoBadge(unidad.estado)}`}>
                    {unidad.estado}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Información de Mantenimiento */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Mantenimiento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500 flex items-center">
                  <Gauge className="h-3 w-3 mr-1" />
                  Kilometraje Actual
                </label>
                <p className="text-lg text-slate-900 mt-1 font-bold">{unidad.kilometrajeActual?.toLocaleString('es-MX')} km</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="text-xs font-medium text-slate-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Último Mantenimiento
                </label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatDate(unidad.fechaUltimoMto)}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Información del Sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-xs font-medium text-slate-500">Creado por</label>
                <p className="text-sm text-slate-900 mt-1">{creadorNombre}</p>
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, unidadPlacas }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar unidad</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar la unidad con placas <span className="font-semibold">{unidadPlacas}</span>?
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

const UnidadesPage = () => {
  const [unidades, setUnidades] = useState([])
  const [filteredUnidades, setFilteredUnidades] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUnidad, setSelectedUnidad] = useState(null)

  useEffect(() => {
    fetchUnidades()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUnidades(unidades)
    } else {
      const filtered = unidades.filter(unidad =>
        unidad.placas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidad.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidad.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unidad.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUnidades(filtered)
    }
  }, [searchTerm, unidades])

  const fetchUnidades = async () => {
    try {
      setIsLoading(true)
      const response = await unidadesService.getAll()
      // Manejar diferentes formatos de respuesta de la API
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setUnidades(data)
      setFilteredUnidades(data)
    } catch (error) {
      console.error('Error fetching unidades:', error)
      toast.error('Error al cargar las unidades')
      setUnidades([])
      setFilteredUnidades([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (data) => {
    try {
      await unidadesService.create(data)
      toast.success('Unidad creada exitosamente')
      fetchUnidades()
    } catch (error) {
      console.error('Error creating unidad:', error)
      toast.error('Error al crear la unidad')
      throw error
    }
  }

  const handleEdit = async (id, data) => {
    try {
      await unidadesService.update(id, data)
      toast.success('Unidad actualizada exitosamente')
      fetchUnidades()
    } catch (error) {
      console.error('Error updating unidad:', error)
      toast.error('Error al actualizar la unidad')
      throw error
    }
  }

  const handleDelete = async () => {
    try {
      await unidadesService.delete(selectedUnidad.id)
      toast.success('Unidad eliminada exitosamente')
      setShowDeleteModal(false)
      setSelectedUnidad(null)
      fetchUnidades()
    } catch (error) {
      console.error('Error deleting unidad:', error)
      toast.error('Error al eliminar la unidad')
    }
  }

  const calculateStats = () => {
    // Asegurarse de que unidades sea un array
    const unidadesArray = Array.isArray(unidades) ? unidades : []
    const totalUnidades = unidadesArray.length
    const activas = unidadesArray.filter(u => u.estado === 'ACTIVA').length
    const enMantenimiento = unidadesArray.filter(u => u.estado === 'MANTENIMIENTO').length
    const inactivas = unidadesArray.filter(u => u.estado === 'INACTIVA').length

    return {
      totalUnidades,
      activas,
      enMantenimiento,
      inactivas
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando unidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <Truck className="h-8 w-8 mr-3 text-blue-600" />
              Gestión de Unidades
            </h1>
            <p className="text-slate-600 mt-1">Administra el inventario de vehículos y su estado</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl cursor-pointer font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva unidad
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Unidades"
            value={stats.totalUnidades}
            icon={Truck}
            color="bg-blue-600"
            description="Registradas en el sistema"
          />
          <StatCard
            title="Unidades Activas"
            value={stats.activas}
            icon={CheckCircle}
            color="bg-emerald-600"
            description="Disponibles para uso"
          />
          <StatCard
            title="En Mantenimiento"
            value={stats.enMantenimiento}
            icon={Wrench}
            color="bg-amber-600"
            description="En reparación"
          />
          <StatCard
            title="Inactivas"
            value={stats.inactivas}
            icon={AlertCircle}
            color="bg-red-600"
            description="Fuera de servicio"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por placas, marca, modelo o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Unidades List */}
        {filteredUnidades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No se encontraron unidades' : 'No hay unidades registradas'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza registrando tu primera unidad'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear unidad
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnidades.map((unidad) => (
              <UnidadCard
                key={unidad.id}
                unidad={unidad}
                onEdit={(unidad) => {
                  setSelectedUnidad(unidad)
                  setShowEditModal(true)
                }}
                onDelete={(unidad) => {
                  setSelectedUnidad(unidad)
                  setShowDeleteModal(true)
                }}
                onViewDetails={(unidad) => {
                  setSelectedUnidad(unidad)
                  setShowViewModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUnidadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
      />

      <EditUnidadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUnidad(null)
        }}
        onSave={handleEdit}
        unidad={selectedUnidad}
      />

      <ViewUnidadModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedUnidad(null)
        }}
        unidad={selectedUnidad}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUnidad(null)
        }}
        onConfirm={handleDelete}
        unidadPlacas={selectedUnidad?.placas}
      />
    </div>
  )
}
export default UnidadesPage;