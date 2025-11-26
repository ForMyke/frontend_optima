'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, DollarSign, MapPin, Users, TrendingUp } from 'lucide-react'
import tarifasComisionesService from '@/app/services/tarifasComisionesService'
import { clientsService } from '@/app/services/clientsService'
import toast from 'react-hot-toast'
import {
  StatCard,
  RutaComisionCard,
  CreateRutaComisionModal,
  EditRutaComisionModal,
  ViewRutaComisionModal,
  ConfirmDeleteModal
} from './components'

export default function TarifasComisionesPage() {
  const [rutasComisiones, setRutasComisiones] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [clienteFilter, setClienteFilter] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRuta, setSelectedRuta] = useState(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadRutasComisiones(),
        loadClientes()
      ])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error al cargar datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadRutasComisiones = async () => {
    try {
      const data = await tarifasComisionesService.getRutasComisiones(0, 100)
      setRutasComisiones(data.content || data || [])
    } catch (error) {
      console.error('Error loading rutas comisiones:', error)
      toast.error('Error al cargar rutas comisiones')
    }
  }

  const loadClientes = async () => {
    try {
      const data = await clientsService.getClients(0, 1000)
      setClientes(data.content || data || [])
    } catch (error) {
      console.error('Error loading clientes:', error)
    }
  }

  const handleCreateRuta = async (rutaData) => {
    try {
      await tarifasComisionesService.createRutaComision(rutaData)
      toast.success('Ruta comisión creada exitosamente')
      setShowCreateModal(false)
      loadRutasComisiones()
    } catch (error) {
      toast.error(error.message || 'Error al crear ruta comisión')
      throw error
    }
  }

  const handleEditRuta = (ruta) => {
    setSelectedRuta(ruta)
    setShowEditModal(true)
  }

  const handleUpdateRuta = async (rutaId, rutaData) => {
    try {
      await tarifasComisionesService.updateRutaComision(rutaId, rutaData)
      toast.success('Ruta comisión actualizada exitosamente')
      setShowEditModal(false)
      setSelectedRuta(null)
      loadRutasComisiones()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar ruta comisión')
      throw error
    }
  }

  const handleViewRuta = (ruta) => {
    setSelectedRuta(ruta)
    setShowViewModal(true)
  }

  const handleDeleteRuta = (ruta) => {
    setSelectedRuta(ruta)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async (rutaId) => {
    try {
      await tarifasComisionesService.deleteRutaComision(rutaId)
      toast.success('Ruta comisión eliminada exitosamente')
      setShowDeleteModal(false)
      setSelectedRuta(null)
      loadRutasComisiones()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar ruta comisión')
    }
  }

  // Calcular estadísticas
  const stats = {
    total: rutasComisiones.length,
    clientes: new Set(rutasComisiones.map(r => r.clienteId)).size,
    comisionTotal: rutasComisiones.reduce((sum, r) => sum + parseFloat(r.comision || 0), 0),
    comisionPromedio: rutasComisiones.length > 0
      ? rutasComisiones.reduce((sum, r) => sum + parseFloat(r.comision || 0), 0) / rutasComisiones.length
      : 0
  }

  // Filtrar rutas con búsqueda global
  const filteredRutas = rutasComisiones.filter(ruta => {
    // Obtener el nombre del cliente desde el objeto o buscar en la lista
    const clienteNombre = ruta.cliente?.nombre ||
      clientes.find(c => c.id === ruta.clienteId)?.nombre ||
      ''

    // Búsqueda global: origen, destino, ID, cliente, tarifa, comisión
    const matchesSearch = searchTerm === '' ||
      ruta.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.id?.toString().includes(searchTerm) ||
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ruta.tarifa?.toString().includes(searchTerm) ||
      ruta.comision?.toString().includes(searchTerm) ||
      ruta.kms?.toString().includes(searchTerm)

    // Filtro de cliente: comparar con el ID del cliente
    const rutaClienteId = ruta.cliente?.id || ruta.clienteId
    const matchesCliente = clienteFilter === '' || rutaClienteId?.toString() === clienteFilter

    return matchesSearch && matchesCliente
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tarifas y Comisiones</h1>
          <p className="text-slate-600 mt-1">Gestión de comisiones por ruta y cliente</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Comisión</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Rutas"
          value={stats.total}
          icon={MapPin}
          color="blue"
          description="Rutas configuradas"
        />
        <StatCard
          title="Clientes"
          value={stats.clientes}
          icon={Users}
          color="purple"
          description="Con comisiones asignadas"
        />
        <StatCard
          title="Comisión Total"
          value={`$${stats.comisionTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
          description="Suma de todas las comisiones"
        />
        <StatCard
          title="Comisión Promedio"
          value={`$${stats.comisionPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="orange"
          description="Promedio por ruta"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por origen, destino, cliente, tarifa, kms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Cliente Filter */}
          <div>
            <select
              value={clienteFilter}
              onChange={(e) => setClienteFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredRutas.length}</span> de{' '}
          <span className="font-semibold text-slate-900">{rutasComisiones.length}</span> rutas
        </p>
      </div>

      {/* Rutas Grid */}
      {filteredRutas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron rutas</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || clienteFilter
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando una nueva comisión por ruta'}
          </p>
          {!searchTerm && !clienteFilter && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear primera comisión
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRutas.map((ruta) => (
            <RutaComisionCard
              key={ruta.id}
              ruta={ruta}
              clientes={clientes}
              onEdit={handleEditRuta}
              onDelete={handleDeleteRuta}
              onViewDetails={handleViewRuta}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateRutaComisionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRuta}
        clientes={clientes}
      />

      <EditRutaComisionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRuta(null)
        }}
        onSubmit={handleUpdateRuta}
        ruta={selectedRuta}
        clientes={clientes}
      />

      <ViewRutaComisionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedRuta(null)
        }}
        ruta={selectedRuta}
        clientes={clientes}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedRuta(null)
        }}
        onConfirm={handleConfirmDelete}
        ruta={selectedRuta}
      />
    </div>
  )
}
