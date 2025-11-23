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
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Eye,
  FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsService } from '@/app/services/clientsService'
import { ClientCard, StatCard, CreateClientModal, EditClientModal, ViewClientModal, ConfirmDeleteModal } from './components'
import { exportClientesPDF } from '@/utils/pdfExport'


const ClientesPage = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0
  })

  const loadClients = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      const clientsData = response.content || []
      setClients(clientsData)

      setStats({
        total: response.totalElements || clientsData.length
      })
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Error al cargar clientes')
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await loadClients()
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

  const handleCreateClient = async (clientData) => {
    try {
      await clientsService.createClient(clientData)
      toast.success('Cliente creado exitosamente')
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al crear cliente')
      throw error
    }
  }

  const handleEditClient = async (client) => {
    try {
      const fullClient = await clientsService.getClientById(client.id)
      setSelectedClient(fullClient)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del cliente')
    }
  }

  const handleUpdateClient = async (clientId, clientData) => {
    try {
      await clientsService.updateClient(clientId, clientData)
      toast.success('Cliente actualizado exitosamente')
      setShowEditModal(false)
      setSelectedClient(null)
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar cliente')
      throw error
    }
  }

  const handleDeleteClient = async (client) => {
    setClientToDelete(client)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return

    try {
      await clientsService.deleteClient(clientToDelete.id)
      toast.success(`Cliente ${clientToDelete.nombre} eliminado`)
      setShowDeleteModal(false)
      setClientToDelete(null)
      loadClients()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar cliente')
    }
  }

  const handleViewDetails = async (client) => {
    try {
      const fullClient = await clientsService.getClientById(client.id)
      setSelectedClient(fullClient)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del cliente')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.correo.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de clientes</h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Administra la cartera de clientes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportClientesPDF(filteredClients, stats)}
              className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <FileDown className="h-5 w-5" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <UserPlus className="h-5 w-5" />
              <span>Nuevo cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total clientes"
          value={stats.total}
          icon={UsersIcon}
          color="bg-blue-600"
          description="Clientes registrados"
        />
        <StatCard
          title="Activos este mes"
          value={stats.total}
          icon={Building2}
          color="bg-emerald-600"
          description="Con operaciones"
        />
        <StatCard
          title="Nuevos este mes"
          value="0"
          icon={UserPlus}
          color="bg-purple-600"
          description="Registros recientes"
        />
        <StatCard
          title="Por contactar"
          value="0"
          icon={Phone}
          color="bg-orange-600"
          description="Pendientes"
        />
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron clientes</p>
        </div>
      )}

      {/* Modals */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateClient}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedClient(null)
        }}
        onSave={handleUpdateClient}
        client={selectedClient}
      />

      <ViewClientModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedClient(null)
        }}
        client={selectedClient}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setClientToDelete(null)
        }}
        onConfirm={confirmDelete}
        clientName={clientToDelete?.nombre}
      />
    </div>
  )
}

export default ClientesPage;