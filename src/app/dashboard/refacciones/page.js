'use client'

import { useState, useEffect } from 'react'
import {
  Wrench,
  Plus,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  Warehouse
} from 'lucide-react'
import toast from 'react-hot-toast'
import { refaccionesService } from '@/app/services/refaccionesService'
import { almacenService } from '@/app/services/almacenService'
import { RefaccionCard, StatCard, CreateRefaccionModal, EditRefaccionModal, ViewRefaccionModal, ConfirmDeleteModal } from './components'

const RefaccionesPage = () => {
  const [refacciones, setRefacciones] = useState([])
  const [almacenes, setAlmacenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRefaccion, setSelectedRefaccion] = useState(null)
  const [refaccionToDelete, setRefaccionToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    stockTotal: 0,
    valorInventario: 0,
    bajosStock: 0
  })

  const loadRefacciones = async () => {
    try {
      const response = await refaccionesService.getRefacciones(0, 100)
      const refaccionesData = response.content || []
      setRefacciones(refaccionesData)

      // Calcular estadísticas
      const stockTotal = refaccionesData.reduce((sum, r) => sum + (r.stockActual || 0), 0)
      const valorInventario = refaccionesData.reduce((sum, r) => 
        sum + ((r.stockActual || 0) * (r.costoUnitario || 0)), 0
      )
      const bajosStock = refaccionesData.filter(r => (r.stockActual || 0) < 10).length

      setStats({
        total: response.totalElements || refaccionesData.length,
        stockTotal,
        valorInventario,
        bajosStock
      })
    } catch (error) {
      console.error('Error loading refacciones:', error)
      toast.error('Error al cargar refacciones')
    }
  }

  const loadAlmacenes = async () => {
    try {
      const response = await almacenService.getAllAlmacenes()
      const almacenesData = response.content || []
      setAlmacenes(almacenesData)
    } catch (error) {
      console.error('Error loading almacenes:', error)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([loadRefacciones(), loadAlmacenes()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleCreateRefaccion = async (refaccionData) => {
    try {
      await refaccionesService.createRefaccion(refaccionData)
      toast.success('Refacción creada exitosamente')
      loadRefacciones()
    } catch (error) {
      toast.error(error.message || 'Error al crear refacción')
      throw error
    }
  }

  const handleEditRefaccion = (refaccion) => {
    setSelectedRefaccion(refaccion)
    setShowEditModal(true)
  }

  const handleUpdateRefaccion = async (refaccionId, refaccionData) => {
    try {
      await refaccionesService.updateRefaccion(refaccionId, refaccionData)
      toast.success('Refacción actualizada exitosamente')
      setShowEditModal(false)
      setSelectedRefaccion(null)
      loadRefacciones()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar refacción')
      throw error
    }
  }

  const handleDeleteRefaccion = (refaccion) => {
    setRefaccionToDelete(refaccion)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!refaccionToDelete) return

    try {
      await refaccionesService.deleteRefaccion(refaccionToDelete.id)
      toast.success(`Refacción ${refaccionToDelete.nombre} eliminada`)
      setShowDeleteModal(false)
      setRefaccionToDelete(null)
      loadRefacciones()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar refacción')
    }
  }

  const handleViewDetails = (refaccion) => {
    setSelectedRefaccion(refaccion)
    setShowViewModal(true)
  }

  const filteredRefacciones = refacciones.filter(refaccion => {
    const matchesSearch = 
      refaccion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refaccion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refaccion.unidadMedida?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de refacciones</h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Administra el inventario de refacciones</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Nueva refacción</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total refacciones"
          value={stats.total}
          icon={Wrench}
          color="bg-blue-600"
          description="Registradas en el sistema"
        />
        <StatCard
          title="Stock total"
          value={stats.stockTotal}
          icon={Package}
          color="bg-emerald-600"
          description="Unidades en inventario"
        />
        <StatCard
          title="Valor inventario"
          value={`$${stats.valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-purple-600"
          description="Valor total en stock"
        />
        <StatCard
          title="Bajos en stock"
          value={stats.bajosStock}
          icon={TrendingUp}
          color="bg-orange-600"
          description="Requieren reabastecimiento"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o unidad de medida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Refacciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredRefacciones.map((refaccion) => (
          <RefaccionCard
            key={refaccion.id}
            refaccion={refaccion}
            almacenes={almacenes}
            onEdit={handleEditRefaccion}
            onDelete={handleDeleteRefaccion}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredRefacciones.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron refacciones</p>
        </div>
      )}

      {/* Modals */}
      <CreateRefaccionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRefaccion}
        almacenes={almacenes}
      />

      <EditRefaccionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRefaccion(null)
        }}
        onSave={handleUpdateRefaccion}
        refaccion={selectedRefaccion}
        almacenes={almacenes}
      />

      <ViewRefaccionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedRefaccion(null)
        }}
        refaccion={selectedRefaccion}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setRefaccionToDelete(null)
        }}
        onConfirm={confirmDelete}
        refaccion={refaccionToDelete}
      />
    </div>
  )
}

export default RefaccionesPage
