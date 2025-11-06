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
  Eye,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { usersService } from '@/app/services/usersService'
import { StatCard, UserCard, CreateUserModal, EditUserModal, ViewUserModal, ConfirmDeleteModal } from './components'


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