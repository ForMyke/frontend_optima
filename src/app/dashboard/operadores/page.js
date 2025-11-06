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
import { StatCard, OperadorCard, CreateOperadorModal, EditOperadorModal, ViewOperadorModal, ConfirmDeleteModal } from './components'

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