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
  Banknote
} from 'lucide-react'
import toast from 'react-hot-toast'
import { facturaService } from '@/app/services/facturaService'
import { clientsService } from '@/app/services/clientsService'
import { FacturaCard, StatCard, PagarFacturaModal, ViewFacturaModal } from '../facturas/components'

const LiquidacionEfectivoPage = () => {
  const [facturas, setFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstatus, setFilterEstatus] = useState('TODAS')
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState(null)
  const [facturaToDelete, setFacturaToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    totalMonto: 0
  })

  const loadFacturas = async () => {
    try {
      // Obtener facturas de tipo SIN_FACTURA (pagadas en efectivo)
      const response = await facturaService.getFacturasByTipo('SIN_FACTURA', 0, 100)
      const facturasData = response.content || []
      setFacturas(facturasData)

      // Calcular estadísticas
      const pagadas = facturasData.filter(f => f.estatus === 'PAGADA').length
      const pendientes = facturasData.filter(f => f.estatus === 'PENDIENTE').length
      const totalMonto = facturasData.reduce((sum, f) => sum + (f.monto || 0), 0)

      setStats({
        total: response.totalElements || facturasData.length,
        pagadas,
        pendientes,
        totalMonto
      })
    } catch (error) {
      console.error('Error loading facturas efectivo:', error)
      toast.error('Error al cargar facturas en efectivo')
    }
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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([loadFacturas(), loadClientes()])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [])

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
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al registrar pago')
      throw error
    }
  }

  const handleEstatusChange = (factura, nuevoEstatus) => {
    if (nuevoEstatus === 'PAGADA') {
      // Si cambia a PAGADA, abrir modal para ingresar método de pago y fecha
      handlePagarFactura(factura)
    } else {
      // Para otros estados, actualizar directamente
      handleUpdateEstatus(factura, nuevoEstatus)
    }
  }

  const handleUpdateEstatus = async (factura, nuevoEstatus) => {
    try {
      const facturaActualizada = {
        ...factura,
        estatus: nuevoEstatus
      }
      await facturaService.updateFacturaEstatus(factura.id, facturaActualizada)
      toast.success(`Estado actualizado a ${nuevoEstatus}`)
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar estado')
    }
  }

  const handleViewDetails = (factura) => {
    setSelectedFactura(factura)
    setShowViewModal(true)
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
      loadFacturas()
    } catch (error) {
      toast.error(error.message || "Error al eliminar factura")
    }
  }

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch =
      factura.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterEstatus === 'TODAS' || factura.estatus === filterEstatus

    return matchesSearch && matchesFilter
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
              Liquidación en efectivo
            </h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">
              Facturas pagadas en efectivo (Sin facturar)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total facturas"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Pagadas"
          value={stats.pagadas}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Monto total"
          value={`$${stats.totalMonto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por número de factura o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400"
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
              <option value="PAGADA">Pagadas</option>
              <option value="VENCIDA">Vencidas</option>
            </select>
          </div>
        </div>
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
            onDelete={handleDeleteFactura}
          />
        ))}
      </div>

      {filteredFacturas.length === 0 && (
        <div className="text-center py-12">
          <Banknote className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron facturas en efectivo</p>
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

      <ViewFacturaModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFactura(null)
        }}
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

export default LiquidacionEfectivoPage
