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
import { StatCard, UnidadCard, CreateUnidadModal, EditUnidadModal, ViewUnidadModal, ConfirmDeleteModal } from './components'

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