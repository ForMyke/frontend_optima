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
  Lock,
  Unlock,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
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

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Cerrar el menú al hacer clic fuera
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
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              user.rolNombre === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
              user.rolNombre === 'MANAGER' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <span className="text-white font-bold text-lg">
                {user.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{user.nombre}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {user.rolesArray && user.rolesArray.length > 0 ? (
                  user.rolesArray.map((rol, index) => (
                    <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      rol === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {rol}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                    <Shield className="h-3 w-3 mr-1" />
                    USER
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                  user.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.activo ? (
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
                    onViewDetails(user)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(user)
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
                    onDelete(user)
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
            <Mail className="h-4 w-4 mr-2 text-slate-400" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            Creado: {user.creadoEn ? new Date(user.creadoEn).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

const CreateUserModal = ({ isOpen, onClose, onSave, roles }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rolId: '',
    activo: true
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(formData)
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rolId: '',
        activo: true
      })
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo usuario</h2>
          <p className="text-sm text-slate-600 mt-1">Completa la información del usuario</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
                minLength={6}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.rolId}
                onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Usuario activo</span>
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
              {isLoading ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditUserModal = ({ isOpen, onClose, onSave, user, roles }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rolId: '',
    activo: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Buscar el ID del primer rol del usuario en la lista de roles disponibles
      const userRolId = user.rolesArray && user.rolesArray.length > 0
        ? roles.find(r => r.nombre === user.rolesArray[0])?.id || ''
        : ''
      
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        password: '', // No mostrar la contraseña existente
        rolId: userRolId,
        activo: user.activo ?? true
      })
    }
  }, [user, roles])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave(user.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar usuario</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del usuario</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Dejar vacío para mantener actual"
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-1">Dejar vacío si no deseas cambiar la contraseña</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.rolId}
                onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Usuario Activo</span>
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
              {isLoading ? 'Actualizando...' : 'Actualizar usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del usuario</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del usuario</p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              user.rolNombre === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
              user.rolNombre === 'MANAGER' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <span className="text-white font-bold text-2xl">
                {user.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              Información personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre completo</label>
                <p className="text-sm text-slate-900 mt-1">{user.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Email</label>
                <p className="text-sm text-slate-900 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Información del Rol */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Roles y permisos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Roles Asignados</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.rolesArray && user.rolesArray.length > 0 ? (
                    user.rolesArray.map((rol, index) => (
                      <span key={index} className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                        rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        rol === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {rol}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Sin roles asignados
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                    user.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.activo ? (
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
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Información del sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">ID de Usuario</label>
                <p className="text-sm text-slate-900 mt-1">#{user.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de Creación</label>
                <p className="text-sm text-slate-900 mt-1">
                  {user.creadoEn ? new Date(user.creadoEn).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar usuario</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{userName}</span>? 
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
const UsuariosPage = () => {

  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    admins: 0
  })

  const loadUsers = async () => {
    try {
      const response = await usersService.getUsers(0, 100)
      const usersData = response.content || []
      
      // Obtener roles para cada usuario
      const usersWithRoles = await Promise.all(
        usersData.map(async (user) => {
          try {
            const rolesData = await usersService.getUserRoles(user.id)
            return {
              ...user,
              rolesArray: rolesData.roles || [],
              rolNombre: rolesData.roles?.[0] || 'USER' // Tomamos el primer rol como principal
            }
          } catch (error) {
            console.error(`Error al obtener roles del usuario ${user.id}:`, error)
            return {
              ...user,
              rolesArray: [],
              rolNombre: 'USER'
            }
          }
        })
      )
      
      setUsers(usersWithRoles)
      
      // Calcular estadísticas
      setStats({
        total: response.totalElements || usersWithRoles.length,
        activos: usersWithRoles.filter(u => u.activo).length,
        inactivos: usersWithRoles.filter(u => !u.activo).length,
        admins: usersWithRoles.filter(u => u.rolesArray?.includes('ADMIN')).length
      })
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar usuarios')
    }
  }

  const loadRoles = async () => {
    try {
      const response = await usersService.getRoles(0, 100)
      setRoles(response.content || [])
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Error al cargar roles')
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([loadUsers(), loadRoles()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateUser = async (userData) => {
    try {
      // 1. Crear el usuario (sin el rolId)
      const { rolId, ...userDataWithoutRole } = userData
      const createdUser = await usersService.createUser(userDataWithoutRole)
      
      // 2. Asignar el rol al usuario recién creado
      if (rolId && createdUser.id) {
        await usersService.assignRole(createdUser.id, rolId)
      }
      
      toast.success('Usuario creado exitosamente')
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Error al crear usuario')
      throw error
    }
  }

  const handleEditUser = async (user) => {
    try {
      // Obtener información completa del usuario con sus roles
      const [fullUser, rolesData] = await Promise.all([
        usersService.getUserById(user.id),
        usersService.getUserRoles(user.id)
      ])
      
      // Combinar la información del usuario con sus roles
      const userWithRoles = {
        ...fullUser,
        rolesArray: rolesData.roles || [],
        rolNombre: rolesData.roles?.[0] || 'USER'
      }
      
      setSelectedUser(userWithRoles)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del usuario')
    }
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      // Si no se proporciona contraseña, no la enviamos
      const dataToSend = { ...userData }
      if (!dataToSend.password) {
        delete dataToSend.password
      }

      // 1. Actualizar el usuario
      const { rolId, ...userDataWithoutRole } = dataToSend
      await usersService.updateUser(userId, userDataWithoutRole)
      
      // 2. Si se proporcionó un nuevo rol, actualizar
      if (rolId) {
        // 2.1 Primero eliminar todos los roles existentes del usuario
        if (selectedUser.rolesArray && selectedUser.rolesArray.length > 0) {
          await usersService.removeAllRoles(userId, selectedUser.rolesArray)
        }
        
        // 2.2 Asignar el nuevo rol
        await usersService.assignRole(userId, rolId)
      }
      
      toast.success('Usuario actualizado exitosamente')
      setShowEditModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar usuario')
      throw error
    }
  }

  const handleDeleteUser = async (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      await usersService.deleteUser(userToDelete.id)
      toast.success(`Usuario ${userToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setUserToDelete(null)
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar usuario')
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await usersService.toggleUserStatus(user.id, !user.activo)
      toast.success(`Usuario ${user.activo ? 'desactivado' : 'activado'}`)
      loadUsers()
    } catch (error) {
      toast.error(error.message || 'Error al cambiar estado del usuario')
    }
  }

  const handleViewDetails = async (user) => {
    try {
      // Obtener información completa del usuario con sus roles
      const [fullUser, rolesData] = await Promise.all([
        usersService.getUserById(user.id),
        usersService.getUserRoles(user.id)
      ])
      
      // Combinar la información del usuario con sus roles
      const userWithRoles = {
        ...fullUser,
        rolesArray: rolesData.roles || [],
        rolNombre: rolesData.roles?.[0] || 'USER'
      }
      
      setSelectedUser(userWithRoles)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del usuario')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro de rol mejorado usando rolesArray
    let matchesRole = true
    if (filterRole !== 'all') {
      const selectedRole = filterRole.toUpperCase()
      matchesRole = user.rolesArray?.some(rol => rol === selectedRole) || false
    }
    
    return matchesSearch && matchesRole
  })

  // Debug: ver estructura de usuarios
  useEffect(() => {
    if (users.length > 0) {
      console.log('Usuarios cargados:', users)
      console.log('Ejemplo de usuario:', users[0])
      console.log('Roles disponibles:', roles)
    }
  }, [users, roles])

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
            <h1 className="text-3xl font-bold text-slate-900">Gestión de usuarios</h1>
            <p className="text-slate-600 mt-2">Administra los usuarios del sistema</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo usuario</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total usuarios"
          value={stats.total}
          icon={UsersIcon}
          color="bg-slate-600"
          description="Usuarios registrados"
        />
        <StatCard
          title="Usuarios activos"
          value={stats.activos}
          icon={CheckCircle}
          color="bg-emerald-600"
          description="En el sistema"
        />
        <StatCard
          title="Usuarios inactivos"
          value={stats.inactivos}
          icon={XCircle}
          color="bg-red-600"
          description="Desactivados"
        />
        <StatCard
          title="Administradores"
          value={stats.admins}
          icon={Shield}
          color="bg-purple-600"
          description="Con permisos admin"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron usuarios</p>
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateUser}
        roles={roles}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedUser(null)
        }}
        onSave={handleUpdateUser}
        user={selectedUser}
        roles={roles}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setUserToDelete(null)
        }}
        onConfirm={confirmDelete}
        userName={userToDelete?.nombre}
      />
    </div>
  )
}

export default UsuariosPage;