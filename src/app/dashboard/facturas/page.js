'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  FileDown,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarDays
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
  const [filterCliente, setFilterCliente] = useState('TODOS')
  const [filterSemana, setFilterSemana] = useState('TODAS')

  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showPagoParcialModal, setShowPagoParcialModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [selectedFactura, setSelectedFactura] = useState(null)
  const [facturaToDelete, setFacturaToDelete] = useState(null)

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

  const filtrosActivos =
    searchTerm.trim() !== '' ||
    filterEstatus !== 'TODAS' ||
    filterCliente !== 'TODOS' ||
    filterSemana !== 'TODAS'

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    loadFacturas(currentPage)
  }, [currentPage, searchTerm, filterEstatus, filterCliente, filterSemana])

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 1000)
      const clientesData = response.content || response || []
      setClientes(clientesData)
    } catch (error) {
      console.error('Error loading clientes:', error)
      toast.error('Error al cargar clientes')
    }
  }

  const loadFacturas = async (page = 0) => {
    try {
      setLoading(true)

      if (filtrosActivos) {
        const todasLasFacturas = await obtenerTodasLasFacturas()
        const facturasFiltradas = filtrarFacturasLocal(todasLasFacturas)

        setFacturas(todasLasFacturas)
        setFilteredFacturas(facturasFiltradas)
        setTotalPages(1)
        setTotalElements(facturasFiltradas.length)

        if (currentPage !== 0) {
          setCurrentPage(0)
        }

        updateStats(facturasFiltradas, facturasFiltradas.length)
        return
      }

      const response = await facturaService.getFacturas(page, pageSize)

      if (response.content) {
        setFacturas(response.content)
        setFilteredFacturas(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
        setCurrentPage(response.number)

        updateStats(response.content, response.totalElements)
      } else {
        const data = Array.isArray(response) ? response : (response.data || [])

        setFacturas(data)
        setFilteredFacturas(data)
        setTotalPages(1)
        setTotalElements(data.length)

        updateStats(data, data.length)
      }
    } catch (error) {
      console.error('Error loading facturas:', error)
      toast.error('Error al cargar facturas')
      setFacturas([])
      setFilteredFacturas([])
    } finally {
      setLoading(false)
    }
  }

  const obtenerTodasLasFacturas = async () => {
    let page = 0
    const size = 100
    let totalPagesTemp = 1
    let todasLasFacturas = []

    do {
      const response = await facturaService.getFacturas(page, size)

      if (response.content) {
        todasLasFacturas = [
          ...todasLasFacturas,
          ...response.content
        ]

        totalPagesTemp = response.totalPages || 1
      } else {
        const data = Array.isArray(response) ? response : (response.data || [])

        todasLasFacturas = [
          ...todasLasFacturas,
          ...data
        ]

        totalPagesTemp = 1
      }

      page++
    } while (page < totalPagesTemp)

    return todasLasFacturas
  }

  const updateStats = (data, total) => {
    const pagadas = data.filter(f => f.estatus === 'PAGADA').length
    const pendientes = data.filter(f => f.estatus === 'PENDIENTE').length
    const vencidas = data.filter(f => f.estatus === 'VENCIDA').length
    const totalMonto = data.reduce((sum, f) => sum + (f.monto || 0), 0)

    setStats({
      total,
      pagadas,
      pendientes,
      vencidas,
      totalMonto
    })
  }

  const normalizarTexto = (texto = '') => {
    return texto
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  const parseFechaLocal = (fecha) => {
    if (!fecha) return null

    const texto = String(fecha)

    return new Date(
      texto.includes('T')
        ? texto
        : `${texto}T12:00:00`
    )
  }

  const getInicioDia = (date = new Date()) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const getFinDia = (date = new Date()) => {
    const d = new Date(date)
    d.setHours(23, 59, 59, 999)
    return d
  }

  const getSemanaOperativa = (offsetSemanas = 0) => {
    const hoy = new Date()
    const inicio = getInicioDia(hoy)

    // Domingo = 0, lunes = 1, martes = 2, miércoles = 3,
    // jueves = 4, viernes = 5, sábado = 6.
    // Semana operativa: viernes, sábado, domingo, lunes, martes, miércoles y jueves.
    const dia = inicio.getDay()
    const diasDesdeViernes = dia >= 5 ? dia - 5 : dia + 2

    inicio.setDate(inicio.getDate() - diasDesdeViernes + (offsetSemanas * 7))

    const fin = getFinDia(inicio)
    fin.setDate(inicio.getDate() + 6)

    return {
      inicio,
      fin
    }
  }

  const getSemanaSeleccionada = () => {
    const semanas = {
      ACTUAL: 0,
      ANTERIOR: -1,
      HACE_2: -2,
      HACE_3: -3,
      HACE_4: -4
    }

    if (filterSemana === 'TODAS') return null

    return getSemanaOperativa(semanas[filterSemana] ?? 0)
  }

  const formatFechaCorta = (date) => {
    if (!date) return 'N/A'

    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getFechaFactura = (factura) => {
    return (
      factura?.fechaEmision ||
      factura?.fechaFactura ||
      factura?.fechaCreacion ||
      factura?.createdAt ||
      factura?.fechaPago ||
      null
    )
  }

  const facturaEstaEnSemana = (factura) => {
    if (filterSemana === 'TODAS') return true

    const semana = getSemanaSeleccionada()
    if (!semana) return true

    const fechaFactura = parseFechaLocal(getFechaFactura(factura))
    if (!fechaFactura) return false

    return fechaFactura >= semana.inicio && fechaFactura <= semana.fin
  }

  const getClienteId = (cliente) => {
    return cliente?.id ?? cliente?.clienteId ?? cliente?.cliente_id ?? ''
  }

  const getClienteNombre = (cliente) => {
    return (
      cliente?.nombre ||
      cliente?.razonSocial ||
      cliente?.nombreCliente ||
      cliente?.clienteNombre ||
      `Cliente #${getClienteId(cliente)}`
    )
  }

  const getClienteFacturaId = (factura) => {
    return (
      factura?.clienteId ??
      factura?.cliente?.id ??
      factura?.cliente?.clienteId ??
      factura?.cliente_id ??
      factura?.idCliente ??
      factura?.id_cliente ??
      ''
    )
  }

  const getClienteNombreFactura = (factura) => {
    const clienteFacturaId = getClienteFacturaId(factura)

    const clienteEncontrado = clientes.find(cliente => {
      return String(getClienteId(cliente)) === String(clienteFacturaId)
    })

    return (
      factura?.clienteNombre ||
      factura?.nombreCliente ||
      factura?.cliente?.nombre ||
      factura?.cliente?.razonSocial ||
      factura?.cliente?.clienteNombre ||
      getClienteNombre(clienteEncontrado) ||
      ''
    )
  }

  const filtrarFacturasLocal = (listaFacturas = []) => {
    const termino = normalizarTexto(searchTerm)

    return listaFacturas.filter(factura => {
      const clienteFacturaId = getClienteFacturaId(factura)
      const clienteNombreFactura = getClienteNombreFactura(factura)

      const selectedCliente = clientes.find(cliente => {
        return String(getClienteId(cliente)) === String(filterCliente)
      })

      const selectedClienteNombre = getClienteNombre(selectedCliente)

      const matchesSearch =
        termino === '' ||
        normalizarTexto(factura.numeroFactura).includes(termino) ||
        normalizarTexto(factura.observaciones).includes(termino) ||
        normalizarTexto(clienteNombreFactura).includes(termino)

      const matchesFilter =
        filterEstatus === 'TODAS' || factura.estatus === filterEstatus

      const matchesCliente =
        filterCliente === 'TODOS' ||
        String(clienteFacturaId) === String(filterCliente) ||
        (
          selectedCliente &&
          normalizarTexto(clienteNombreFactura) === normalizarTexto(selectedClienteNombre)
        )

      const matchesSemana = facturaEstaEnSemana(factura)

      return matchesSearch && matchesFilter && matchesCliente && matchesSemana
    })
  }

  const limpiarFiltros = () => {
    setSearchTerm('')
    setFilterEstatus('TODAS')
    setFilterCliente('TODOS')
    setFilterSemana('TODAS')
  }

  const handlePagarFactura = (factura) => {
    setSelectedFactura(factura)
    setShowPagarModal(true)
  }

  const handleConfirmPago = async (factura, pagoData) => {
    try {
      const nuevoMontoParcial = parseFloat(pagoData.montoParcial) + (factura.montoParcial || 0)

      if (nuevoMontoParcial > factura.monto) {
        toast.error('El monto total a pagar no puede ser mayor que el monto de la factura')
        return
      }

      await facturaService.registrarPago(factura.id, {
        montoParcial: nuevoMontoParcial,
        metodoPago: pagoData.metodoPago,
        fechaPago: pagoData.fechaPago,
        observaciones: pagoData.observaciones
      })

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
      const montoPendiente = (factura.monto || 0) - (factura.montoParcial || 0)
      const montoAbonar = parseFloat(pagoData.montoParcial)

      if (montoAbonar > montoPendiente) {
        toast.error('El monto no puede ser mayor que el saldo pendiente')
        return
      }

      const nuevoMontoParcial = (factura.montoParcial || 0) + montoAbonar

      await facturaService.registrarPago(factura.id, {
        montoParcial: nuevoMontoParcial,
        metodoPago: pagoData.metodoPago,
        fechaPago: pagoData.fechaPago,
        observaciones: pagoData.observaciones
      })

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
    if (nuevoEstatus === 'COMPLETADA' && factura.estatus !== 'PAGADA') {
      toast.error('Solo las facturas PAGADAS pueden marcarse como COMPLETADAS')
      return
    }

    if (nuevoEstatus === 'PAGO_PARCIAL' || factura.estatus === 'PAGO_PARCIAL') {
      setSelectedFactura(factura)
      setShowPagoParcialModal(true)
    } else if (nuevoEstatus === 'PAGADA') {
      handlePagarFactura(factura)
    } else {
      handleUpdateEstatus(factura, nuevoEstatus)
    }
  }

  const handleUpdateEstatus = async (factura, nuevoEstatus) => {
    try {
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

  const semanaActual = getSemanaOperativa(0)
  const semanaAnterior = getSemanaOperativa(-1)
  const semanaHace2 = getSemanaOperativa(-2)
  const semanaHace3 = getSemanaOperativa(-3)
  const semanaHace4 = getSemanaOperativa(-4)

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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Gestión de facturas
            </h1>
            <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">
              Administra las facturas y pagos
            </p>
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="relative xl:col-span-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

            <input
              type="text"
              placeholder="Buscar factura, cliente u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

            <select
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="TODOS">Todos los clientes</option>

              {clientes.map((cliente) => (
                <option key={getClienteId(cliente)} value={getClienteId(cliente)}>
                  {getClienteNombre(cliente)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

            <select
              value={filterSemana}
              onChange={(e) => setFilterSemana(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="TODAS">Todas las semanas</option>
              <option value="ACTUAL">
                Actual: {formatFechaCorta(semanaActual.inicio)} - {formatFechaCorta(semanaActual.fin)}
              </option>
              <option value="ANTERIOR">
                Anterior: {formatFechaCorta(semanaAnterior.inicio)} - {formatFechaCorta(semanaAnterior.fin)}
              </option>
              <option value="HACE_2">
                Hace 2 semanas: {formatFechaCorta(semanaHace2.inicio)} - {formatFechaCorta(semanaHace2.fin)}
              </option>
              <option value="HACE_3">
                Hace 3 semanas: {formatFechaCorta(semanaHace3.inicio)} - {formatFechaCorta(semanaHace3.fin)}
              </option>
              <option value="HACE_4">
                Hace 4 semanas: {formatFechaCorta(semanaHace4.inicio)} - {formatFechaCorta(semanaHace4.fin)}
              </option>
            </select>
          </div>

          <div className="relative">
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

        {filtrosActivos && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-700">
              Filtros activos. Se están consultando todas las páginas de facturas.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredFacturas.length}</span> de{' '}
          <span className="font-semibold text-slate-900">{totalElements}</span> facturas
        </p>

        {filterSemana !== 'TODAS' && getSemanaSeleccionada() && (
          <p className="text-sm text-slate-500">
            Semana operativa:{' '}
            <span className="font-medium text-slate-700">
              {formatFechaCorta(getSemanaSeleccionada().inicio)} - {formatFechaCorta(getSemanaSeleccionada().fin)}
            </span>
          </p>
        )}
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
      {totalPages > 1 && !filtrosActivos && (
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
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === index
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  }

                  if (
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