'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Filter,
  FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { facturaService } from '@/app/services/facturaService'
import { clientsService } from '@/app/services/clientsService'
import { exportFacturasExtraPDF } from '@/utils/pdfExport'
import {
  StatCard,
  FacturaExtraCard,
  CreateFacturaExtraModal,
  EditFacturaExtraModal,
  ViewFacturaExtraModal,
  ConfirmDeleteModal,
  PagarFacturaExtraModal
} from './components'

const ESTATUS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-orange-100 text-orange-800', icon: Clock },
  PAGADA: { label: 'Pagada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  VENCIDA: { label: 'Vencida', color: 'bg-red-100 text-red-800', icon: XCircle },
  CANCELADA: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle }
}

const FacturasExtraPage = () => {
  const [facturas, setFacturas] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estatusFilter, setEstatusFilter] = useState('TODAS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState(null)
  const [facturaToDelete, setFacturaToDelete] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    pagadas: 0,
    vencidas: 0,
    totalMonto: 0,
    montoPendiente: 0
  })

  const loadFacturas = async () => {
    try {
      let response
      if (estatusFilter === 'TODAS') {
        response = await facturaService.getFacturasExtra(0, 100)
      } else if (estatusFilter === 'VENCIDA') {
        response = await facturaService.getFacturasExtraVencidas(0, 100)
      } else {
        response = await facturaService.getFacturasExtraByEstatus(estatusFilter, 0, 100)
      }

      const facturasData = response.content || []
      setFacturas(facturasData)

      // Calcular estadísticas
      const pendientes = facturasData.filter(f => f.estatus === 'PENDIENTE').length
      const pagadas = facturasData.filter(f => f.estatus === 'PAGADA').length
      const vencidas = facturasData.filter(f => f.estatus === 'VENCIDA').length
      const totalMonto = facturasData.reduce((sum, f) => sum + (parseFloat(f.monto) || 0), 0)
      const montoPendiente = facturasData
        .filter(f => f.estatus === 'PENDIENTE' || f.estatus === 'VENCIDA')
        .reduce((sum, f) => sum + (parseFloat(f.monto) || 0), 0)

      setStats({
        total: response.totalElements || facturasData.length,
        pendientes,
        pagadas,
        vencidas,
        totalMonto,
        montoPendiente
      })
    } catch (error) {
      console.error('Error loading facturas extra:', error)
      toast.error('Error al cargar facturas extra')
    }
  }

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      setClientes(response.content || [])
    } catch (error) {
      console.error('Error loading clientes:', error)
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          loadFacturas(),
          loadClientes()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [estatusFilter])

  const handleCreateFactura = async (facturaData) => {
    try {
      await facturaService.createFacturaExtra(facturaData)
      toast.success('Factura extra creada exitosamente')
      setShowCreateModal(false)
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al crear factura extra')
      throw error
    }
  }

  const handleEditFactura = (factura) => {
    setSelectedFactura(factura)
    setShowEditModal(true)
  }

  const handleUpdateFactura = async (facturaId, facturaData) => {
    try {
      await facturaService.updateFacturaExtra(facturaId, facturaData)
      toast.success('Factura extra actualizada exitosamente')
      setShowEditModal(false)
      setSelectedFactura(null)
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar factura extra')
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
      await facturaService.deleteFacturaExtra(facturaToDelete.id)
      toast.success(`Factura extra ${facturaToDelete.numeroFactura} eliminada`)
      setShowDeleteModal(false)
      setFacturaToDelete(null)
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar factura extra')
    }
  }

  const handleViewDetails = (factura) => {
    setSelectedFactura(factura)
    setShowViewModal(true)
  }

  const handlePagarFactura = (factura) => {
    setSelectedFactura(factura)
    setShowPagarModal(true)
  }

  const handleConfirmPago = async (factura, fechaPago, metodoPago) => {
    try {
      // Enviar el objeto completo con todos los campos
      const facturaActualizada = {
        ...factura,
        estatus: 'PAGADA',
        fechaPago,
        metodoPago
      }

      await facturaService.updateFacturaExtra(factura.id, facturaActualizada)
      toast.success('Factura marcada como pagada')
      setShowPagarModal(false)
      setSelectedFactura(null)
      loadFacturas()
    } catch (error) {
      toast.error(error.message || 'Error al marcar factura como pagada')
      throw error
    }
  }

  const filteredFacturas = facturas.filter(factura => {
    const cliente = clientes.find(c => c.id === factura.clienteId)
    const clienteNombre = cliente?.nombre || ''

    const matchesSearch =
      factura.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.concepto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.id?.toString().includes(searchTerm)

    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Facturas Extra</h1>
            <p className="text-slate-600 mt-2">Gestiona facturas adicionales y servicios extra</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportFacturasExtraPDF(filteredFacturas, stats)}
              className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <FileDown className="h-5 w-5" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Nueva factura extra</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de facturas"
          value={stats.total}
          icon={FileText}
          color="bg-blue-600"
          description="Facturas registradas"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-orange-600"
          description="Por pagar"
        />
        <StatCard
          title="Pagadas"
          value={stats.pagadas}
          icon={CheckCircle}
          color="bg-green-600"
          description="Completadas"
        />
        <StatCard
          title="Monto pendiente"
          value={`$${(stats.montoPendiente / 1000).toFixed(1)}K`}
          icon={DollarSign}
          color="bg-red-600"
          description={`Total: $${(stats.totalMonto / 1000).toFixed(1)}K`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por número, concepto, cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
              value={estatusFilter}
              onChange={(e) => setEstatusFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
            >
              <option value="TODAS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADA">Pagadas</option>
              <option value="VENCIDA">Vencidas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Facturas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacturas.map((factura) => (
          <FacturaExtraCard
            key={factura.id}
            factura={factura}
            clientes={clientes}
            onEdit={handleEditFactura}
            onDelete={handleDeleteFactura}
            onViewDetails={handleViewDetails}
            onPagar={handlePagarFactura}
          />
        ))}
      </div>

      {filteredFacturas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron facturas extra</p>
        </div>
      )}

      {/* Modals */}
      <CreateFacturaExtraModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFactura}
        clientes={clientes}
      />

      <EditFacturaExtraModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedFactura(null)
        }}
        onSubmit={handleUpdateFactura}
        factura={selectedFactura}
        clientes={clientes}
      />

      <ViewFacturaExtraModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFactura(null)
        }}
        factura={selectedFactura}
        clientes={clientes}
      />

      <PagarFacturaExtraModal
        isOpen={showPagarModal}
        onClose={() => {
          setShowPagarModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmPago}
        factura={selectedFactura}
        clientes={clientes}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setFacturaToDelete(null)
        }}
        onConfirm={confirmDelete}
        factura={facturaToDelete}
      />
    </div>
  )
}

export default FacturasExtraPage
