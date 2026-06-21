'use client'

import { useState, useEffect } from 'react'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import { administrativosService } from '@/app/services/administrativosService'
import {
  StatCard,
  AdministrativoCard,
  CreateAdministrativoModal,
  EditAdministrativoModal,
  ViewAdministrativoModal,
  ConfirmDeleteModal
} from './components'

const AdministrativosPage = () => {
  const [administrativos, setAdministrativos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdministrativo, setSelectedAdministrativo] = useState(null)
  const [administrativoToDelete, setAdministrativoToDelete] = useState(null)

  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    totalSueldoBase: 0
  })

  const loadAdministrativos = async () => {
    try {
      const response = await administrativosService.getAdministrativos(0, 100)
      const administrativosData = response.content || []

      setAdministrativos(administrativosData)

      const totalSueldoBase = administrativosData.reduce((acc, admin) => {
        return acc + Number(admin.sueldoBase || 0)
      }, 0)

      setStats({
        total: response.totalElements || administrativosData.length,
        activos: administrativosData.filter(admin => admin.activo).length,
        inactivos: administrativosData.filter(admin => !admin.activo).length,
        totalSueldoBase
      })
    } catch (error) {
      console.error('Error loading administrativos:', error)
      toast.error('Error al cargar administrativos')
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await loadAdministrativos()
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleCreateAdministrativo = async (administrativoData) => {
    try {
      await administrativosService.createAdministrativo(administrativoData)
      toast.success('Administrativo creado exitosamente')
      loadAdministrativos()
    } catch (error) {
      toast.error(error.message || 'Error al crear administrativo')
      throw error
    }
  }

  const handleEditAdministrativo = async (administrativo) => {
    try {
      const fullAdministrativo = await administrativosService.getAdministrativoById(administrativo.id)
      setSelectedAdministrativo(fullAdministrativo)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del administrativo')
    }
  }

  const handleUpdateAdministrativo = async (administrativoId, administrativoData) => {
    try {
      await administrativosService.updateAdministrativo(administrativoId, administrativoData)
      toast.success('Administrativo actualizado exitosamente')
      setShowEditModal(false)
      setSelectedAdministrativo(null)
      loadAdministrativos()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar administrativo')
      throw error
    }
  }

  const handleDeleteAdministrativo = async (administrativo) => {
    setAdministrativoToDelete(administrativo)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!administrativoToDelete) return

    try {
      await administrativosService.deleteAdministrativo(administrativoToDelete.id)
      toast.success(`Administrativo ${administrativoToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setAdministrativoToDelete(null)
      loadAdministrativos()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar administrativo')
    }
  }

  const handleViewDetails = async (administrativo) => {
    try {
      const fullAdministrativo = await administrativosService.getAdministrativoById(administrativo.id)
      setSelectedAdministrativo(fullAdministrativo)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del administrativo')
    }
  }

  const filteredAdministrativos = administrativos.filter((administrativo) => {
    const term = searchTerm.toLowerCase()

    const matchesSearch =
      (administrativo.nombre || '').toLowerCase().includes(term) ||
      (administrativo.puesto || '').toLowerCase().includes(term) ||
      (administrativo.telefono || '').includes(searchTerm) ||
      (administrativo.email || '').toLowerCase().includes(term) ||
      (administrativo.alias || '').toLowerCase().includes(term) ||
      (administrativo.cuenta || '').toLowerCase().includes(term)

    let matchesStatus = true

    if (filterStatus === 'activo') {
      matchesStatus = administrativo.activo === true
    } else if (filterStatus === 'inactivo') {
      matchesStatus = administrativo.activo === false
    }

    return matchesSearch && matchesStatus
  })

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(Number(value || 0))
  }

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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de administrativos</h1>
            <p className="text-slate-600 mt-2">
              Administra el personal administrativo, sus sueldos y datos de pago
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo administrativo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total administrativos"
          value={stats.total}
          icon={UsersIcon}
          color="bg-blue-600"
          description="Administrativos registrados"
        />

        <StatCard
          title="Activos"
          value={stats.activos}
          icon={CheckCircle}
          color="bg-emerald-600"
          description="Disponibles"
        />

        <StatCard
          title="Inactivos"
          value={stats.inactivos}
          icon={XCircle}
          color="bg-slate-600"
          description="No disponibles"
        />

        <StatCard
          title="Sueldo base total"
          value={formatMoney(stats.totalSueldoBase)}
          icon={DollarSign}
          color="bg-purple-600"
          description="Suma de sueldos base"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, puesto, teléfono, correo, alias o cuenta..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdministrativos.map((administrativo) => (
          <AdministrativoCard
            key={administrativo.id}
            administrativo={administrativo}
            onEdit={handleEditAdministrativo}
            onDelete={handleDeleteAdministrativo}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredAdministrativos.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron administrativos</p>
        </div>
      )}

      <CreateAdministrativoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAdministrativo}
      />

      <EditAdministrativoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAdministrativo(null)
        }}
        onSave={handleUpdateAdministrativo}
        administrativo={selectedAdministrativo}
      />

      <ViewAdministrativoModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedAdministrativo(null)
        }}
        administrativo={selectedAdministrativo}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setAdministrativoToDelete(null)
        }}
        onConfirm={confirmDelete}
        administrativoName={administrativoToDelete?.nombre}
      />
    </div>
  )
}

export default AdministrativosPage