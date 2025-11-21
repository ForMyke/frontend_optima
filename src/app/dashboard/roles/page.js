'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Shield,
  ShieldPlus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Users,
  FileText,
  Lock,
  Award,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { rolesService } from '@/app/services/rolesService'

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

const RoleCard = ({ role, onEdit, onDelete, onViewDetails }) => {
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
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-700">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900">{role.nombre}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{role.descripcion}</p>
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
                    onViewDetails(role)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(role)
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
                    onDelete(role)
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

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            ID: {role.id}
          </div>
          <div className="flex items-center text-xs text-indigo-600 font-medium">
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Rol de sistema
          </div>
        </div>
      </div>
    </div>
  )
}

const CreateRoleModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
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

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del rol es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres'
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria'
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres'
    } else if (formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres'
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
      // Limpiar espacios al inicio y final antes de enviar
      const cleanedData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim()
      }
      await onSave(cleanedData)
      setFormData({
        nombre: '',
        descripcion: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error saving role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo rol</h2>
          <p className="text-sm text-slate-600 mt-1">Define un nuevo rol con sus permisos</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del rol *
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
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-transparent'
                }`}
                placeholder="Ej: Administrador, Operador, Supervisor"
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
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => {
                  setFormData({ ...formData, descripcion: e.target.value })
                  if (errors.descripcion) setErrors({ ...errors, descripcion: '' })
                }}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                  errors.descripcion 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-indigo-500 focus:border-transparent'
                }`}
                rows={4}
                placeholder="Describe las responsabilidades y alcance de este rol"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.descripcion}
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
              className="px-6 cursor-pointer py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditRoleModal = ({ isOpen, onClose, onSave, role }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre || '',
        descripcion: role.descripcion || ''
      })
    }
  }, [role])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Limpiar espacios al inicio y final antes de enviar
      const cleanedData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim()
      }
      await onSave(role.id, cleanedData)
      onClose()
    } catch (error) {
      console.error('Error saving role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar rol</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del rol</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del rol *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Ej: Administrador, Operador, Supervisor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                rows={4}
                placeholder="Describe las responsabilidades y alcance de este rol"
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
              className="px-6 cursor-pointer py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewRoleModal = ({ isOpen, onClose, role }) => {
  if (!isOpen || !role) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del rol</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del rol</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-700">
              <Shield className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información del Rol */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Información del rol
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre del rol</label>
                <p className="text-sm text-slate-900 mt-1 font-semibold">{role.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Descripción</label>
                <p className="text-sm text-slate-900 mt-1 leading-relaxed">{role.descripcion}</p>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          {role.id && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Información del sistema
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">ID del rol</label>
                  <p className="text-sm text-slate-900 mt-1">#{role.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Tipo</label>
                  <p className="text-sm text-slate-900 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Rol de sistema
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permisos (Placeholder para futuras implementaciones) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Permisos asignados
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 text-center">
                Los permisos específicos se configurarán en una futura actualización
              </p>
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, roleName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar rol</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar el rol <span className="font-semibold">{roleName}</span>? 
            Esta acción no se puede deshacer y puede afectar a los usuarios que tienen este rol asignado.
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

 
const RolesPage = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0
  })

  const loadRoles = async () => {
    try {
      const response = await rolesService.getRoles(0, 100)
      const rolesData = response.content || []
      setRoles(rolesData)
      
      setStats({
        total: response.totalElements || rolesData.length
      })
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Error al cargar roles')
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await loadRoles()
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  const handleCreateRole = async (roleData) => {
    try {
      await rolesService.createRole(roleData)
      toast.success('Rol creado exitosamente')
      loadRoles()
    } catch (error) {
      toast.error(error.message || 'Error al crear rol')
      throw error
    }
  }

  const handleEditRole = async (role) => {
    try {
      const fullRole = await rolesService.getRoleById(role.id)
      setSelectedRole(fullRole)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del rol')
    }
  }

  const handleUpdateRole = async (roleId, roleData) => {
    try {
      await rolesService.updateRole(roleId, roleData)
      toast.success('Rol actualizado exitosamente')
      setShowEditModal(false)
      setSelectedRole(null)
      loadRoles()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar rol')
      throw error
    }
  }

  const handleDeleteRole = async (role) => {
    setRoleToDelete(role)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      await rolesService.deleteRole(roleToDelete.id)
      toast.success(`Rol ${roleToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setRoleToDelete(null)
      loadRoles()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar rol')
    }
  }

  const handleViewDetails = async (role) => {
    try {
      const fullRole = await rolesService.getRoleById(role.id)
      setSelectedRole(fullRole)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del rol')
    }
  }

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de roles</h1>
            <p className="text-slate-600 mt-2">Administra los roles y permisos del sistema</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <ShieldPlus className="h-5 w-5" />
            <span>Nuevo rol</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de roles"
          value={stats.total}
          icon={Shield}
          color="bg-indigo-600"
          description="Roles configurados"
        />
        <StatCard
          title="Roles activos"
          value={stats.total}
          icon={Award}
          color="bg-emerald-600"
          description="En uso"
        />
        <StatCard
          title="Usuarios asignados"
          value="0"
          icon={Users}
          color="bg-blue-600"
          description="Con roles"
        />
        <StatCard
          title="Permisos únicos"
          value="0"
          icon={Lock}
          color="bg-purple-600"
          description="Configurados"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron roles</p>
        </div>
      )}

      {/* Modals */}
      <CreateRoleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRole}
      />

      <EditRoleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRole(null)
        }}
        onSave={handleUpdateRole}
        role={selectedRole}
      />

      <ViewRoleModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedRole(null)
        }}
        role={selectedRole}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setRoleToDelete(null)
        }}
        onConfirm={confirmDelete}
        roleName={roleToDelete?.nombre}
      />
    </div>
  )
}
export default RolesPage;