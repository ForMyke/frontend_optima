'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  FileDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { facturaService } from '@/app/services/facturaService'
import { clientsService } from '@/app/services/clientsService'
import { FacturaCard, StatCard, PagarFacturaModal, PagoParcialModal, ViewFacturaModal, EditFacturaModal } from './components'
import { exportFacturasPDF } from '@/utils/pdfExport'

const FacturasPage = () => {
  const [facturas, setFacturas] = useState([])
  const [filteredFacturas, setFilteredFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstatus, setFilterEstatus] = useState('TODAS')
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showPagoParcialModal, setShowPagoParcialModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState(null)
  const [facturaToDelete, setFacturaToDelete] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(15)

  const [stats, setStats] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    vencidas: 0,
    totalMonto: 0
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadFacturas(currentPage)
  }, [currentPage])

  useEffect(() => {
    filterFacturas()
  }, [searchTerm, filterEstatus, facturas])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadFacturas(0), loadClientes()])
    } catch (error) {
      console.error('Error loading initial data:', error)
      toast.error('Error al cargar datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadFacturas = async (page = 0) => {
    try {
      setLoading(true)
      const response = await facturaService.getFacturas(page, pageSize)

      if (response.content) {
        setFacturas(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
        setCurrentPage(response.number)

        // Calcular estadísticas con los datos disponibles
        // Nota: Para estadísticas precisas de toda la base de datos, el backend debería proveer un endpoint de stats
        updateStats(response.content, response.totalElements)
      } else {
        const data = Array.isArray(response) ? response : (response.data || [])
        setFacturas(data)
        setTotalPages(1)
        setTotalElements(data.length)
        updateStats(data, data.length)
      }
    } catch (error) {
      console.error('Error loading facturas:', error)
      toast.error('Error al cargar facturas')
      setFacturas([])
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (data, total) => {
    const pagadas = data.filter(f => f.estatus === 'PAGADA').length
    const pendientes = data.filter(f => f.estatus === 'PENDIENTE').length
    const vencidas = data.filter(f => f.estatus === 'VENCIDA').length
    const totalMonto = data.reduce((sum, f) => sum + (f.monto || 0), 0)

    setStats({
      total: total,
      pagadas,
      pendientes,
      vencidas,
      totalMonto
    })
  }

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 1000)
      const clientesData = response.content || []
      setClientes(clientesData)
    } catch (error) {
      console.error('Error loading clientes:', error)
    }
  }

  const filterFacturas = () => {
    const filtered = facturas.filter(factura => {
      const matchesSearch =
        factura.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterEstatus === 'TODAS' || factura.estatus === filterEstatus

      return matchesSearch && matchesFilter
    })
    setFilteredFacturas(filtered)
  }

  const handlePagarFactura = (factura) => {
    setSelectedFactura(factura)
    setShowPagarModal(true)
  }

  const handleConfirmPago = async (factura, pagoData) => {
    try {
      // Validar que montoParcial no sea mayor que el monto total
      const nuevoMontoParcial = parseFloat(pagoData.montoParcial) + (factura.montoParcial || 0)
      if (nuevoMontoParcial > factura.monto) {
        toast.error('El monto total a pagar no puede ser mayor que el monto de la factura')
        return
      }

      // Registrar el pago (el backend actualiza el estatus automáticamente)
      await facturaService.registrarPago(factura.id, {
        montoParcial: nuevoMontoParcial,
        metodoPago: pagoData.metodoPago,
        fechaPago: pagoData.fechaPago,
        observaciones: pagoData.observaciones
      })

      // Mensaje según el tipo de pago
      if (nuevoMontoParcial === factura.monto) {
        toast.success('¡Factura pagada completamente!')
      } else {
        toast.success(`Pago parcial registrado: $${parseFloat(pagoData.montoParcial).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`)
      }

      setShowPagarModal(false)
      setSelectedFactura(null)
      loadFacturas(currentPage)
    } catch (error) {
      toast.error(error.message || 'Error al registrar pago')
      throw error
    }
  }

  const handleConfirmPagoParcial = async (factura, pagoData) => {
    try {
      // Validar que el monto parcial no sea mayor que lo pendiente
      const montoPendiente = (factura.monto || 0) - (factura.montoParcial || 0)
      const montoAbonar = parseFloat(pagoData.montoParcial)

      if (montoAbonar > montoPendiente) {
        toast.error('El monto no puede ser mayor que el saldo pendiente')
        return
      }

      // Calcular nuevo monto parcial total
      const nuevoMontoParcial = (factura.montoParcial || 0) + montoAbonar

      // Registrar el pago parcial
      await facturaService.registrarPago(factura.id, {
        montoParcial: nuevoMontoParcial,
        metodoPago: pagoData.metodoPago,
        fechaPago: pagoData.fechaPago,
        observaciones: pagoData.observaciones
      })

      // Mensaje según si completó el pago o fue parcial
      if (nuevoMontoParcial >= factura.monto) {
        toast.success('¡Factura pagada completamente!')
      } else {
        toast.success(`Pago parcial registrado: $${montoAbonar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`)
      }

      setShowPagoParcialModal(false)
      setSelectedFactura(null)
      loadFacturas(currentPage)
    } catch (error) {
      toast.error(error.message || 'Error al registrar pago parcial')
      throw error
    }
  }

  const handleRegistrarPagoParcial = (factura) => {
    setSelectedFactura(factura)
    setShowPagoParcialModal(true)
  }

  const handleEstatusChange = (factura, nuevoEstatus) => {
  // Validar que solo facturas PAGADAS puedan marcarse como COMPLETADA
  if (nuevoEstatus === 'COMPLETADA' && factura.estatus !== 'PAGADA') {
    toast.error('Solo las facturas PAGADAS pueden marcarse como COMPLETADAS')
    return
  }

  // Si cambia a PAGO_PARCIAL o ya está en PAGO_PARCIAL, abrir modal de pago parcial
  if (nuevoEstatus === 'PAGO_PARCIAL' || factura.estatus === 'PAGO_PARCIAL') {
    setSelectedFactura(factura)
    setShowPagoParcialModal(true)
  } else if (nuevoEstatus === 'PAGADA') {
    // Si cambia a PAGADA, abrir modal para pago completo
    handlePagarFactura(factura)
  } else {
    // Para PENDIENTE, VENCIDA y COMPLETADA, actualizar directamente sin modal
    handleUpdateEstatus(factura, nuevoEstatus)
  }
}

  const handleUpdateEstatus = async (factura, nuevoEstatus) => {
  try {
    // Solo enviar el estatus, no toda la factura
    await facturaService.updateFacturaEstatus(factura.id, {
      estatus: nuevoEstatus
    })
    toast.success(`Estado actualizado a ${nuevoEstatus}`)
    loadFacturas(currentPage)
  } catch (error) {
    toast.error(error.message || 'Error al actualizar estado')
  }
}

  const handleViewDetails = (factura) => {
    setSelectedFactura(factura)
    setShowViewModal(true)
  }

  const handleEdit = (factura) => {
    setSelectedFactura(factura)
    setShowEditModal(true)
  }
  const handleConfirmEdit = async (id, updateData) => {
    try {
      await facturaService.updateFactura(id, updateData)
      toast.success('Factura actualizada exitosamente')
      setShowEditModal(false)
      setSelectedFactura(null)
      loadFacturas(currentPage)
    } catch (error) {
      toast.error(error.message || 'Error al actualizar factura')
      throw error
    }
  }

  const handleDeleteFactura = (factura) => {
    setFacturaToDelete(factura)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!facturaToDelete) return

    try {
      await facturaService.deleteFactura(facturaToDelete.id)
      toast.success(`Factura ${facturaToDelete.numeroFactura} eliminada exitosamente`)
      setShowDeleteModal(false)
      setFacturaToDelete(null)
      loadFacturas(currentPage)
    } catch (error) {
      toast.error(error.message || 'Error al eliminar factura')
    }
  }

  if (loading && facturas.length === 0) {
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gestión de facturas</h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">Administra las facturas y pagos</p>
          </div>
          <button
            onClick={() => exportFacturasPDF(filteredFacturas, stats)}
            className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <FileDown className="h-5 w-5" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total facturas"
          value={stats.total}
          icon={FileText}
          color="bg-blue-600"
          description="Registradas en el sistema"
        />
        <StatCard
          title="Pagadas"
          value={stats.pagadas}
          icon={CheckCircle}
          color="bg-emerald-600"
          description="Facturas liquidadas"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-orange-600"
          description="Por cobrar"
        />
        <StatCard
          title="Vencidas"
          value={stats.vencidas}
          icon={XCircle}
          color="bg-red-600"
          description="Requieren atención"
        />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por número de factura u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="relative lg:w-64">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
                value={filterEstatus}
                onChange={(e) => setFilterEstatus(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
                >
                <option value="TODAS">Todas las facturas</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="PAGO_PARCIAL">Pago parcial</option>
                <option value="PAGADA">Pagadas</option>
                <option value="VENCIDA">Vencidas</option>
              </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredFacturas.length}</span> de{' '}
          <span className="font-semibold text-slate-900">{totalElements}</span> facturas
        </p>
      </div>

      {/* Facturas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredFacturas.map((factura) => (
          <FacturaCard
            key={factura.id}
            factura={factura}
            clientes={clientes}
            onPagar={handlePagarFactura}
            onViewDetails={handleViewDetails}
            onEstatusChange={handleEstatusChange}
            onRegistrarPagoParcial={handleRegistrarPagoParcial}
            onDelete={handleDeleteFactura}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {filteredFacturas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron facturas</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !searchTerm.trim() && filterEstatus === 'TODAS' && (
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
      <PagarFacturaModal
        isOpen={showPagarModal}
        onClose={() => {
          setShowPagarModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmPago}
        factura={selectedFactura}
      />

      <PagoParcialModal
        isOpen={showPagoParcialModal}
        onClose={() => {
          setShowPagoParcialModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmPagoParcial}
        factura={selectedFactura}
      />

      <ViewFacturaModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFactura(null)
        }}
        factura={selectedFactura}
        clientes={clientes}
      />

      <EditFacturaModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmEdit}
        factura={selectedFactura}
        clientes={clientes}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Confirmar eliminación</h3>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la factura <strong>{facturaToDelete?.numeroFactura}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setFacturaToDelete(null)
                }}
                className="px-4 cursor-pointer py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 cursor-pointer py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturasPage
