'use client'

import { useState, useEffect } from 'react'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Building2,
  FileDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clientsService } from '@/app/services/clientsService'
import { ClientCard, StatCard, CreateClientModal, EditClientModal, ViewClientModal, ConfirmDeleteModal } from './components'
import { exportClientesPDF } from '@/utils/pdfExport'


const ClientesPage = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(20)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [clientToDelete, setClientToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0
  })

  useEffect(() => {
    loadClients(currentPage)
  }, [currentPage])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter(client => {
  const atrasos = Number(client.atrasosCobranza ?? client.atrasos_cobranza ?? 0)

  return (
    client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (searchTerm.toLowerCase().includes('atraso') && atrasos > 0)
  )
})
      setFilteredClients(filtered)
    }
  }, [searchTerm, clients])

  const loadClients = async (page = 0) => {
    try {
      setLoading(true)
      const response = await clientsService.getClients(page, pageSize)

      if (response.content) {
        setClients(response.content)
        setFilteredClients(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
        setCurrentPage(response.number)

        setStats({
          total: response.totalElements
        })
      } else {
        const data = Array.isArray(response) ? response : (response.data || [])
        setClients(data)
        setFilteredClients(data)
        setTotalPages(1)
        setTotalElements(data.length)
        setStats({
          total: data.length
        })
      }
    } catch (error) {
      console.error('Error loading clients:', error)
      toast.error('Error al cargar clientes')
      setClients([])
      setFilteredClients([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (clientData) => {
    try {
      await clientsService.createClient(clientData)
      toast.success('Cliente creado exitosamente')
      loadClients(currentPage)
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
      loadClients(currentPage)
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
      loadClients(currentPage)
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

      {/* Pagination Controls */}
      {totalPages > 1 && !searchTerm.trim() && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Mostrando <span className="font-medium">{currentPage * pageSize + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min((currentPage + 1) * pageSize, totalElements)}
                </span>{' '}
                de <span className="font-medium">{totalElements}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  if (
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 1 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        aria-current={currentPage === index ? 'page' : undefined}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === index
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                          }`}
                      >
                        {index + 1}
                      </button>
                    )
                  } else if (
                    index === currentPage - 2 ||
                    index === currentPage + 2
                  ) {
                    return (
                      <span
                        key={index}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 focus:outline-offset-0"
                      >
                        ...
                      </span>
                    )
                  }
                  return null
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
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