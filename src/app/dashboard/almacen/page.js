'use client'

import { useState, useEffect } from 'react'
import {
  Warehouse,
  Plus,
  Search,
  Package,
  MapPin,
  User,
  FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { almacenService } from '@/app/services/almacenService'
import { usersService } from '@/app/services/usersService'
import { AlmacenCard, StatCard, CreateAlmacenModal, EditAlmacenModal, ViewAlmacenModal, ConfirmDeleteModal } from './components'
import { exportAlmacenesPDF } from '@/utils/pdfExport'


const AlmacenPage = () => {
  const [almacenes, setAlmacenes] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAlmacen, setSelectedAlmacen] = useState(null)
  const [almacenToDelete, setAlmacenToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    conEncargado: 0,
    sinEncargado: 0
  })

  const loadAlmacenes = async () => {
    try {
      const response = await almacenService.getAlmacenes(0, 100)
      const almacenesData = response.content || []
      setAlmacenes(almacenesData)

      // Calcular estadísticas - el backend devuelve 'encargado' como objeto
      const conEncargado = almacenesData.filter(a => a.encargado).length
      setStats({
        total: response.totalElements || almacenesData.length,
        conEncargado,
        sinEncargado: almacenesData.length - conEncargado
      })
    } catch (error) {
      console.error('Error loading almacenes:', error)
      toast.error('Error al cargar almacenes')
    }
  }

  const loadUsuarios = async () => {
    try {
      const response = await usersService.getUsers(0, 1000)
      const usuariosData = response.content || []
      setUsuarios(usuariosData)
    } catch (error) {
      console.error('Error loading usuarios:', error)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([loadAlmacenes(), loadUsuarios()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleCreateAlmacen = async (almacenData) => {
    try {
      await almacenService.createAlmacen(almacenData)
      toast.success('Almacén creado exitosamente')
      loadAlmacenes()
    } catch (error) {
      toast.error(error.message || 'Error al crear almacén')
      throw error
    }
  }

  const handleEditAlmacen = (almacen) => {
    // Usar directamente el almacén de la lista que ya incluye el objeto encargado
    setSelectedAlmacen(almacen)
    setShowEditModal(true)
  }

  const handleUpdateAlmacen = async (almacenId, almacenData) => {
    try {
      await almacenService.updateAlmacen(almacenId, almacenData)
      toast.success('Almacén actualizado exitosamente')
      setShowEditModal(false)
      setSelectedAlmacen(null)
      loadAlmacenes()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar almacén')
      throw error
    }
  }

  const handleDeleteAlmacen = async (almacen) => {
    setAlmacenToDelete(almacen)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!almacenToDelete) return

    try {
      await almacenService.deleteAlmacen(almacenToDelete.id)
      toast.success(`Almacén ${almacenToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setAlmacenToDelete(null)
      loadAlmacenes()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar almacén')
    }
  }

  const handleViewDetails = (almacen) => {
    // Usar directamente el almacén de la lista que ya incluye el objeto encargado
    setSelectedAlmacen(almacen)
    setShowViewModal(true)
  }

  const filteredAlmacenes = almacenes.filter(almacen => {
    const matchesSearch = almacen.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      almacen.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de almacenes</h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Administra tus centros de almacenamiento</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportAlmacenesPDF(filteredAlmacenes, stats)}
              className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <FileDown className="h-5 w-5" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo almacén</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total almacenes"
          value={stats.total}
          icon={Warehouse}
          color="bg-blue-600"
          description="Registrados en el sistema"
        />
        <StatCard
          title="Con encargado"
          value={stats.conEncargado}
          icon={User}
          color="bg-emerald-600"
          description="Tienen responsable asignado"
        />
        <StatCard
          title="Sin encargado"
          value={stats.sinEncargado}
          icon={Package}
          color="bg-orange-600"
          description="Requieren asignación"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Almacenes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredAlmacenes.map((almacen) => (
          <AlmacenCard
            key={almacen.id}
            almacen={almacen}
            usuarios={usuarios}
            onEdit={handleEditAlmacen}
            onDelete={handleDeleteAlmacen}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredAlmacenes.length === 0 && (
        <div className="text-center py-12">
          <Warehouse className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron almacenes</p>
        </div>
      )}

      {/* Modals */}
      <CreateAlmacenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAlmacen}
        usuarios={usuarios}
      />

      <EditAlmacenModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAlmacen(null)
        }}
        onSave={handleUpdateAlmacen}
        almacen={selectedAlmacen}
        usuarios={usuarios}
      />

      <ViewAlmacenModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedAlmacen(null)
        }}
        almacen={selectedAlmacen}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setAlmacenToDelete(null)
        }}
        onConfirm={confirmDelete}
        almacen={almacenToDelete}
      />
    </div>
  )
}

export default AlmacenPage
