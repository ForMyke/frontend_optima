'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Truck,
  MapPin,
  Calendar,
  Clock,
  User,
  Package,
  Fuel,
  AlertCircle,
  Receipt
} from 'lucide-react'
import toast from 'react-hot-toast'
import { bitacoraService } from '@/app/services/bitacoraService'
import { viajesService } from '@/app/services/viajesService'
import { operadoresService } from '@/app/services/operadoresService'
import { clientsService } from '@/app/services/clientsService'
import { unidadesService } from '@/app/services/unidadesService'
import { authService } from '@/app/services/authService'
import { usersService } from '@/app/services/usersService'
import { StatCard, BitacoraCard, ConfirmDeleteModal, EditBitacoraModal, CreateBitacoraModal, ViewBitacoraModal } from './components'


export default function BitacoraPage() {
  const [bitacoras, setBitacoras] = useState([])
  const [filteredBitacoras, setFilteredBitacoras] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBitacora, setSelectedBitacora] = useState(null)

  // Estados para catálogos
  const [viajes, setViajes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [clientes, setClientes] = useState([])
  const [unidades, setUnidades] = useState([])

  useEffect(() => {
    loadAllData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBitacoras(bitacoras)
    } else {
      const filtered = bitacoras.filter(bitacora =>
        bitacora.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bitacora.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBitacoras(filtered)
    }
  }, [searchTerm, bitacoras])

  const loadAllData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        fetchBitacoras(),
        fetchViajes(),
        fetchOperadores(),
        fetchClientes(),
        fetchUnidades()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBitacoras = async () => {
    try {
      const response = await bitacoraService.getAll()
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setBitacoras(data)
      setFilteredBitacoras(data)
    } catch (error) {
      console.error('Error fetching bitácoras:', error)
      toast.error('Error al cargar las bitácoras')
      setBitacoras([])
      setFilteredBitacoras([])
    }
  }

  const fetchViajes = async () => {
    try {
      const response = await viajesService.getViajes(0, 100)
      setViajes(response.content || [])
    } catch (error) {
      console.error('Error fetching viajes:', error)
      setViajes([])
    }
  }

  const fetchOperadores = async () => {
    try {
      const response = await operadoresService.getOperadores(0, 100)
      setOperadores(response.content || [])
    } catch (error) {
      console.error('Error fetching operadores:', error)
      setOperadores([])
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      setClientes(response.content || [])
    } catch (error) {
      console.error('Error fetching clientes:', error)
      setClientes([])
    }
  }

  const fetchUnidades = async () => {
    try {
      const response = await unidadesService.getAll()
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setUnidades(data)
    } catch (error) {
      console.error('Error fetching unidades:', error)
      setUnidades([])
    }
  }

  const handleCreate = async (data) => {
    try {
      await bitacoraService.create(data)
      toast.success('Bitácora creada exitosamente')
      fetchBitacoras()
    } catch (error) {
      console.error('Error creating bitácora:', error)
      toast.error('Error al crear la bitácora')
      throw error
    }
  }

  const handleEdit = async (id, data) => {
    try {
      await bitacoraService.update(id, data)
      toast.success('Bitácora actualizada exitosamente')
      fetchBitacoras()
    } catch (error) {
      console.error('Error updating bitácora:', error)
      toast.error('Error al actualizar la bitácora')
      throw error
    }
  }

  const handleDelete = async () => {
    try {
      await bitacoraService.delete(selectedBitacora.id)
      toast.success('Bitácora eliminada exitosamente')
      setShowDeleteModal(false)
      setSelectedBitacora(null)
      fetchBitacoras()
    } catch (error) {
      console.error('Error deleting bitácora:', error)
      toast.error('Error al eliminar la bitácora')
    }
  }

  const calculateStats = () => {
    // Asegurarse de que bitacoras sea un array
    const bitacorasArray = Array.isArray(bitacoras) ? bitacoras : []
    const totalBitacoras = bitacorasArray.length
    const totalCosto = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.costoTotal) || 0), 0)
    const totalDiesel = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.dieselLitros) || 0), 0)
    const totalCasetas = bitacorasArray.reduce((sum, b) => sum + (parseFloat(b.casetas) || 0), 0)

    return {
      totalBitacoras,
      totalCosto,
      totalDiesel,
      totalCasetas
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando bitácoras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Bitácora de Viajes
            </h1>
            <p className="text-slate-600 mt-1">Gestiona y monitorea todos los viajes registrados</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl cursor-pointer font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva bitácora
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Viajes"
            value={stats.totalBitacoras}
            icon={FileText}
            color="bg-blue-600"
            description="Bitácoras registradas"
          />
          <StatCard
            title="Costo Total"
            value={new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0
            }).format(stats.totalCosto)}
            icon={DollarSign}
            color="bg-emerald-600"
            description="Suma de todos los viajes"
          />
          <StatCard
            title="Costo de diesel"
            value={`$${stats.totalDiesel.toFixed(1)}`}
            icon={Fuel}
            color="bg-amber-600"
            description="Costo total de diesel consumido"
          />
          <StatCard
            title="Casetas Total"
            value={new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0
            }).format(stats.totalCasetas)}
            icon={Receipt}
            color="bg-purple-600"
            description="Gastos en casetas"
          />
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por folio, origen, destino o número de factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Bitácoras List */}
        {filteredBitacoras.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No se encontraron bitácoras' : 'No hay bitácoras registradas'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera bitácora de viaje'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear bitácora
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBitacoras.map((bitacora) => (
              <BitacoraCard
                key={bitacora.id}
                bitacora={bitacora}
                onEdit={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowEditModal(true)
                }}
                onDelete={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowDeleteModal(true)
                }}
                onViewDetails={(bitacora) => {
                  setSelectedBitacora(bitacora)
                  setShowViewModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateBitacoraModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <EditBitacoraModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedBitacora(null)
        }}
        onSave={handleEdit}
        bitacora={selectedBitacora}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ViewBitacoraModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedBitacora(null)
        }}
        bitacora={selectedBitacora}
        viajes={viajes}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedBitacora(null)
        }}
        onConfirm={handleDelete}
        bitacoraFolio={selectedBitacora?.folio}
      />
    </div>
  )
}