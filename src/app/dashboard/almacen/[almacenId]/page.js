'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Wrench,
  Plus,
  Search,
  Package,
  DollarSign,
  TrendingUp,
  Warehouse,
  ArrowLeft,
  MapPin,
  User,
  Edit2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { refaccionesService } from '@/app/services/refaccionesService'
import { almacenService } from '@/app/services/almacenService'
import { usersService } from '@/app/services/usersService'
import { 
  RefaccionCard, 
  StatCard, 
  CreateRefaccionModal, 
  EditRefaccionModal, 
  ViewRefaccionModal, 
  ConfirmDeleteModal 
} from '@/app/dashboard/refacciones/components'
import EditAlmacenModal from '@/app/dashboard/almacen/components/EditAlmacenModal'

const AlmacenDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const almacenId = params.almacenId
  
  const [almacen, setAlmacen] = useState(null)
  const [refacciones, setRefacciones] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditAlmacenModal, setShowEditAlmacenModal] = useState(false)
  const [selectedRefaccion, setSelectedRefaccion] = useState(null)
  const [refaccionToDelete, setRefaccionToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    stockTotal: 0,
    valorInventario: 0,
    bajosStock: 0
  })

  const loadAlmacen = async () => {
    try {
      const almacenData = await almacenService.getAlmacenById(almacenId)
      setAlmacen(almacenData)
    } catch (error) {
      console.error('Error loading almacen:', error)
      toast.error('Error al cargar almacén')
    }
  }

  const loadRefacciones = async () => {
    try {
      console.log('🔍 Cargando refacciones para almacén ID:', almacenId, 'Tipo:', typeof almacenId)
      const response = await refaccionesService.getRefaccionesByAlmacen(almacenId)
      console.log('📦 Respuesta de refacciones:', response)
      const refaccionesData = response.content || []
      console.log('✅ Refacciones filtradas:', refaccionesData.length, 'encontradas')
      setRefacciones(refaccionesData)

      // Calcular estadísticas
      const stockTotal = refaccionesData.reduce((sum, r) => sum + (r.stockActual || 0), 0)
      const valorInventario = refaccionesData.reduce((sum, r) => 
        sum + ((r.stockActual || 0) * (r.costoUnitario || 0)), 0
      )
      const bajosStock = refaccionesData.filter(r => (r.stockActual || 0) < 10).length

      setStats({
        total: refaccionesData.length,
        stockTotal,
        valorInventario,
        bajosStock
      })
    } catch (error) {
      console.error('Error loading refacciones:', error)
      toast.error('Error al cargar refacciones del almacén')
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
        await Promise.all([loadAlmacen(), loadRefacciones(), loadUsuarios()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [almacenId])

  const handleCreateRefaccion = async (refaccionData) => {
    try {
      // Asegurarse de que el almacenId esté incluido
      const dataWithAlmacen = {
        ...refaccionData,
        almacenId: parseInt(almacenId)
      }
      await refaccionesService.createRefaccion(dataWithAlmacen)
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

  const handleEditAlmacen = () => {
    setShowEditAlmacenModal(true)
  }

  const handleUpdateAlmacen = async (almacenData) => {
    try {
      await almacenService.updateAlmacen(params.almacenId, almacenData)
      toast.success('Almacén actualizado exitosamente')
      setShowEditAlmacenModal(false)
      await loadAlmacen()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar almacén')
      throw error
    }
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
          <div className="bg-slate-200 h-32 rounded-xl mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-28 lg:h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!almacen) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
        <div className="text-center py-12">
          <Warehouse className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Almacén no encontrado</p>
          <button
            onClick={() => router.push('/dashboard/almacen')}
            className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a almacenes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Back Button & Almacén Info */}
      <div className="mb-6 lg:mb-8">
        <button
          onClick={() => router.push('/dashboard/almacen')}
          className="flex cursor-pointer items-center text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Volver a almacenes</span>
        </button>

        {/* Almacén Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700">
                <Warehouse className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{almacen.nombre}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{almacen.ubicacion || 'Sin ubicación'}</span>
                  </div>
                  {almacen.encargado && (
                    <div className="flex items-center text-slate-600">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm">{almacen.encargado.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleEditAlmacen}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar almacén</span>
            </button>
          </div>
          {almacen.descripcion && (
            <p className="text-slate-600 mt-4 pt-4 border-t border-slate-100">{almacen.descripcion}</p>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Refacciones del almacén</h2>
            <p className="text-sm lg:text-base text-slate-600 mt-1">Administra el inventario de este almacén</p>
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
          description="En este almacén"
        />
        <StatCard
          title="Stock total"
          value={stats.stockTotal}
          icon={Package}
          color="bg-emerald-600"
          description="Unidades disponibles"
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
            almacenes={[almacen]}
            onEdit={handleEditRefaccion}
            onDelete={handleDeleteRefaccion}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredRefacciones.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">
            {searchTerm 
              ? 'No se encontraron refacciones con ese criterio de búsqueda'
              : 'No hay refacciones registradas en este almacén'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar primera refacción
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateRefaccionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRefaccion}
        almacenes={[almacen]}
        defaultAlmacenId={parseInt(almacenId)}
      />

      <EditRefaccionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRefaccion(null)
        }}
        onSave={handleUpdateRefaccion}
        refaccion={selectedRefaccion}
        almacenes={[almacen]}
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

      <EditAlmacenModal
        isOpen={showEditAlmacenModal}
        onClose={() => setShowEditAlmacenModal(false)}
        onSave={handleUpdateAlmacen}
        almacen={almacen}
        usuarios={usuarios}
      />
    </div>
  )
}

export default AlmacenDetailPage
