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
import {
  FacturaCard,
  StatCard,
  PagarFacturaModal,
  PagoParcialModal,
  ViewFacturaModal,
  EditFacturaModal
} from './components'
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
  }, [
    currentPage,
    searchTerm,
    filterEstatus,
    filterCliente,
    filterSemana,
    clientes
  ])

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 1000)
      const clientesData = response?.content || response || []

      setClientes(
        Array.isArray(clientesData)
          ? clientesData
          : []
      )
    } catch (error) {
      console.error('Error loading clientes:', error)
      toast.error('Error al cargar clientes')
    }
  }

  const loadFacturas = async (page = 0) => {
    try {
      setLoading(true)

      /*
       * Cuando existe una búsqueda o algún filtro:
       *
       * 1. Se consultan todas las páginas del backend.
       * 2. Se filtra la colección completa.
       * 3. Se paginan localmente los resultados filtrados.
       *
       * De esta manera la búsqueda no se limita a la página actual.
       */
      if (filtrosActivos) {
        const todasLasFacturas = await obtenerTodasLasFacturas()

        const facturasFiltradas =
          filtrarFacturasLocal(todasLasFacturas)

        const totalFiltradas = facturasFiltradas.length

        const totalPaginasFiltradas =
          totalFiltradas === 0
            ? 0
            : Math.ceil(totalFiltradas / pageSize)

        const paginaValida =
          totalPaginasFiltradas === 0
            ? 0
            : Math.min(page, totalPaginasFiltradas - 1)

        const inicio = paginaValida * pageSize
        const fin = inicio + pageSize

        const facturasDeLaPagina =
          facturasFiltradas.slice(inicio, fin)

        setFacturas(facturasDeLaPagina)
        setFilteredFacturas(facturasDeLaPagina)

        setTotalPages(totalPaginasFiltradas)
        setTotalElements(totalFiltradas)

        if (paginaValida !== page) {
          setCurrentPage(paginaValida)
        }

        updateStats(
          facturasFiltradas,
          totalFiltradas
        )

        return
      }

      /*
       * Sin filtros se conserva la paginación normal del backend.
       */
      const response =
        await facturaService.getFacturas(page, pageSize)

      if (response?.content) {
        const contenido = Array.isArray(response.content)
          ? response.content
          : []

        setFacturas(contenido)
        setFilteredFacturas(contenido)

        setTotalPages(response.totalPages || 0)
        setTotalElements(response.totalElements || 0)
        setCurrentPage(response.number || 0)

        updateStats(
          contenido,
          response.totalElements || contenido.length
        )
      } else {
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []

        setFacturas(data)
        setFilteredFacturas(data)
        setTotalPages(data.length > 0 ? 1 : 0)
        setTotalElements(data.length)

        updateStats(data, data.length)
      }
    } catch (error) {
      console.error('Error loading facturas:', error)
      toast.error('Error al cargar facturas')

      setFacturas([])
      setFilteredFacturas([])
      setTotalPages(0)
      setTotalElements(0)

      updateStats([], 0)
    } finally {
      setLoading(false)
    }
  }

  /*
   * Recorre todas las páginas del endpoint paginado.
   *
   * Se usa cuando existe una búsqueda o filtro para que
   * el filtro se aplique sobre todos los registros.
   */
  const obtenerTodasLasFacturas = async () => {
    let pagina = 0
    const tamanioPagina = 100
    let totalPaginasBackend = 1
    let todasLasFacturas = []

    do {
      const response =
        await facturaService.getFacturas(
          pagina,
          tamanioPagina
        )

      if (response?.content) {
        const contenido = Array.isArray(response.content)
          ? response.content
          : []

        todasLasFacturas = [
          ...todasLasFacturas,
          ...contenido
        ]

        totalPaginasBackend =
          Number(response.totalPages) || 1
      } else {
        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : []

        todasLasFacturas = [
          ...todasLasFacturas,
          ...data
        ]

        totalPaginasBackend = 1
      }

      pagina += 1
    } while (pagina < totalPaginasBackend)

    return todasLasFacturas
  }

  const updateStats = (data = [], total = 0) => {
    const lista = Array.isArray(data) ? data : []

    const pagadas = lista.filter(
      factura => factura.estatus === 'PAGADA'
    ).length

    const pendientes = lista.filter(
      factura =>
        factura.estatus === 'PENDIENTE' ||
        factura.estatus === 'FACTURADA' ||
        factura.estatus === 'POR_FACTURAR'
    ).length

    const vencidas = lista.filter(
      factura => factura.estatus === 'VENCIDA'
    ).length

    const totalMonto = lista.reduce(
      (sum, factura) => {
        return sum + Number(factura.monto || 0)
      },
      0
    )

    setStats({
      total,
      pagadas,
      pendientes,
      vencidas,
      totalMonto
    })
  }

  const normalizarTexto = (texto = '') => {
    return String(texto ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  const parseFechaLocal = fecha => {
    if (!fecha) {
      return null
    }

    const texto = String(fecha)

    const fechaConvertida = new Date(
      texto.includes('T')
        ? texto
        : `${texto}T12:00:00`
    )

    return Number.isNaN(fechaConvertida.getTime())
      ? null
      : fechaConvertida
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

    /*
     * Domingo = 0
     * Lunes = 1
     * Martes = 2
     * Miércoles = 3
     * Jueves = 4
     * Viernes = 5
     * Sábado = 6
     *
     * Semana operativa: viernes a jueves.
     */
    const dia = inicio.getDay()

    const diasDesdeViernes =
      dia >= 5
        ? dia - 5
        : dia + 2

    inicio.setDate(
      inicio.getDate() -
      diasDesdeViernes +
      offsetSemanas * 7
    )

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

    if (filterSemana === 'TODAS') {
      return null
    }

    return getSemanaOperativa(
      semanas[filterSemana] ?? 0
    )
  }

  const formatFechaCorta = date => {
    if (!date) {
      return 'N/A'
    }

    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getFechaFactura = factura => {
    return (
      factura?.fechaEmision ||
      factura?.fechaFactura ||
      factura?.fechaCreacion ||
      factura?.createdAt ||
      factura?.fechaPago ||
      factura?.fechaViaje ||
      null
    )
  }

  const facturaEstaEnSemana = factura => {
    if (filterSemana === 'TODAS') {
      return true
    }

    const semana = getSemanaSeleccionada()

    if (!semana) {
      return true
    }

    const fechaFactura = parseFechaLocal(
      getFechaFactura(factura)
    )

    if (!fechaFactura) {
      return false
    }

    return (
      fechaFactura >= semana.inicio &&
      fechaFactura <= semana.fin
    )
  }

  const getClienteId = cliente => {
    return (
      cliente?.id ??
      cliente?.clienteId ??
      cliente?.cliente_id ??
      ''
    )
  }

  const getClienteNombre = cliente => {
    if (!cliente) {
      return ''
    }

    const clienteId = getClienteId(cliente)

    return (
      cliente?.nombre ||
      cliente?.razonSocial ||
      cliente?.nombreCliente ||
      cliente?.clienteNombre ||
      cliente?.nombreComercial ||
      (
        clienteId
          ? `Cliente #${clienteId}`
          : ''
      )
    )
  }

  const getClienteFacturaId = factura => {
    const clienteDirecto = factura?.cliente

    return (
      factura?.clienteId ??
      factura?.cliente_id ??
      factura?.idCliente ??
      factura?.id_cliente ??
      factura?.cliente?.id ??
      factura?.cliente?.clienteId ??
      factura?.cliente?.cliente_id ??
      factura?.clienteDTO?.id ??
      factura?.clienteDto?.id ??
      (
        typeof clienteDirecto === 'string' ||
        typeof clienteDirecto === 'number'
          ? clienteDirecto
          : ''
      )
    )
  }

  const getClienteNombreFactura = factura => {
    const clienteFacturaId =
      getClienteFacturaId(factura)

    const clienteEncontrado = clientes.find(
      cliente => {
        return (
          String(getClienteId(cliente)) ===
          String(clienteFacturaId)
        )
      }
    )

    return (
      factura?.clienteNombre ||
      factura?.nombreCliente ||
      factura?.razonSocialCliente ||
      factura?.nombreComercialCliente ||
      factura?.cliente?.nombre ||
      factura?.cliente?.razonSocial ||
      factura?.cliente?.clienteNombre ||
      factura?.cliente?.nombreComercial ||
      factura?.clienteDTO?.nombre ||
      factura?.clienteDTO?.razonSocial ||
      factura?.clienteDto?.nombre ||
      factura?.clienteDto?.razonSocial ||
      getClienteNombre(clienteEncontrado) ||
      ''
    )
  }

  const filtrarFacturasLocal = (
    listaFacturas = []
  ) => {
    const lista = Array.isArray(listaFacturas)
      ? listaFacturas
      : []

    const termino = normalizarTexto(searchTerm)

    const clienteSeleccionado = clientes.find(
      cliente => {
        return (
          String(getClienteId(cliente)) ===
          String(filterCliente)
        )
      }
    )

    const nombreClienteSeleccionado =
      getClienteNombre(clienteSeleccionado)

    return lista.filter(factura => {
      const clienteFacturaId =
        getClienteFacturaId(factura)

      const clienteNombreFactura =
        getClienteNombreFactura(factura)

      /*
       * La búsqueda se realiza por:
       *
       * - Número de factura.
       * - Nombre del cliente.
       * - Razón social.
       * - Observaciones.
       * - Origen.
       * - Destino.
       * - Operador.
       * - Placas.
       */
      const camposBusqueda = [
        factura?.numeroFactura,
        factura?.numero_factura,
        clienteNombreFactura,
        factura?.observaciones,
        factura?.origen,
        factura?.destino,
        factura?.operadorNombre,
        factura?.operador_nombre,
        factura?.unidadPlacas,
        factura?.unidad_placas
      ]

      const matchesSearch =
        termino === '' ||
        camposBusqueda.some(campo => {
          return normalizarTexto(campo).includes(termino)
        })

      const matchesEstatus =
        filterEstatus === 'TODAS' ||
        factura?.estatus === filterEstatus

      const matchesClientePorId =
        String(clienteFacturaId) ===
        String(filterCliente)

      const matchesClientePorNombre =
        clienteSeleccionado &&
        normalizarTexto(clienteNombreFactura) ===
          normalizarTexto(nombreClienteSeleccionado)

      const matchesCliente =
        filterCliente === 'TODOS' ||
        matchesClientePorId ||
        matchesClientePorNombre

      const matchesSemana =
        facturaEstaEnSemana(factura)

      return (
        matchesSearch &&
        matchesEstatus &&
        matchesCliente &&
        matchesSemana
      )
    })
  }

  const limpiarFiltros = () => {
    setSearchTerm('')
    setFilterEstatus('TODAS')
    setFilterCliente('TODOS')
    setFilterSemana('TODAS')
    setCurrentPage(0)
  }

  const handleSearchChange = event => {
    setSearchTerm(event.target.value)
    setCurrentPage(0)
  }

  const handleClienteChange = event => {
    setFilterCliente(event.target.value)
    setCurrentPage(0)
  }

  const handleSemanaChange = event => {
    setFilterSemana(event.target.value)
    setCurrentPage(0)
  }

  const handleEstatusFilterChange = event => {
    setFilterEstatus(event.target.value)
    setCurrentPage(0)
  }

  const handlePagarFactura = factura => {
    setSelectedFactura(factura)
    setShowPagarModal(true)
  }

  const handleConfirmPago = async (
    factura,
    pagoData
  ) => {
    try {
      const montoAnterior = Number(
        factura.montoParcial || 0
      )

      const montoNuevo = Number(
        pagoData.montoParcial || 0
      )

      const montoFactura = Number(
        factura.monto || 0
      )

      const nuevoMontoParcial =
        montoAnterior + montoNuevo

      if (nuevoMontoParcial > montoFactura) {
        toast.error(
          'El monto total a pagar no puede ser mayor que el monto de la factura'
        )

        return
      }

      await facturaService.registrarPago(
        factura.id,
        {
          montoParcial: nuevoMontoParcial,
          metodoPago: pagoData.metodoPago,
          fechaPago: pagoData.fechaPago,
          observaciones: pagoData.observaciones
        }
      )

      if (nuevoMontoParcial >= montoFactura) {
        toast.success(
          '¡Factura pagada completamente!'
        )
      } else {
        toast.success(
          `Pago parcial registrado: $${montoNuevo.toLocaleString(
            'es-MX',
            {
              minimumFractionDigits: 2
            }
          )}`
        )
      }

      setShowPagarModal(false)
      setSelectedFactura(null)

      await loadFacturas(currentPage)
    } catch (error) {
      toast.error(
        error?.message ||
        'Error al registrar pago'
      )

      throw error
    }
  }

  const handleConfirmPagoParcial = async (
    factura,
    pagoData
  ) => {
    try {
      const montoFactura = Number(
        factura.monto || 0
      )

      const montoPagado = Number(
        factura.montoParcial || 0
      )

      const montoPendiente =
        montoFactura - montoPagado

      const montoAbonar = Number(
        pagoData.montoParcial || 0
      )

      if (montoAbonar <= 0) {
        toast.error(
          'El monto debe ser mayor que cero'
        )

        return
      }

      if (montoAbonar > montoPendiente) {
        toast.error(
          'El monto no puede ser mayor que el saldo pendiente'
        )

        return
      }

      const nuevoMontoParcial =
        montoPagado + montoAbonar

      await facturaService.registrarPago(
        factura.id,
        {
          montoParcial: nuevoMontoParcial,
          metodoPago: pagoData.metodoPago,
          fechaPago: pagoData.fechaPago,
          observaciones: pagoData.observaciones
        }
      )

      if (nuevoMontoParcial >= montoFactura) {
        toast.success(
          '¡Factura pagada completamente!'
        )
      } else {
        toast.success(
          `Pago parcial registrado: $${montoAbonar.toLocaleString(
            'es-MX',
            {
              minimumFractionDigits: 2
            }
          )}`
        )
      }

      setShowPagoParcialModal(false)
      setSelectedFactura(null)

      await loadFacturas(currentPage)
    } catch (error) {
      toast.error(
        error?.message ||
        'Error al registrar pago parcial'
      )

      throw error
    }
  }

  const handleRegistrarPagoParcial = factura => {
    setSelectedFactura(factura)
    setShowPagoParcialModal(true)
  }

  const handleEstatusChange = (
    factura,
    nuevoEstatus
  ) => {
    if (
      nuevoEstatus === 'COMPLETADA' &&
      factura.estatus !== 'PAGADA'
    ) {
      toast.error(
        'Solo las facturas PAGADAS pueden marcarse como COMPLETADAS'
      )

      return
    }

    if (
      nuevoEstatus === 'PAGO_PARCIAL' ||
      factura.estatus === 'PAGO_PARCIAL'
    ) {
      setSelectedFactura(factura)
      setShowPagoParcialModal(true)

      return
    }

    if (nuevoEstatus === 'PAGADA') {
      handlePagarFactura(factura)

      return
    }

    handleUpdateEstatus(
      factura,
      nuevoEstatus
    )
  }

  const handleUpdateEstatus = async (
    factura,
    nuevoEstatus
  ) => {
    try {
      await facturaService.updateFacturaEstatus(
        factura.id,
        {
          estatus: nuevoEstatus
        }
      )

      toast.success(
        `Estado actualizado a ${nuevoEstatus}`
      )

      await loadFacturas(currentPage)
    } catch (error) {
      toast.error(
        error?.message ||
        'Error al actualizar estado'
      )
    }
  }

  const handleViewDetails = factura => {
    setSelectedFactura(factura)
    setShowViewModal(true)
  }

  const handleEdit = factura => {
    setSelectedFactura(factura)
    setShowEditModal(true)
  }

  const handleConfirmEdit = async (
    id,
    updateData
  ) => {
    try {
      await facturaService.updateFactura(
        id,
        updateData
      )

      toast.success(
        'Factura actualizada exitosamente'
      )

      setShowEditModal(false)
      setSelectedFactura(null)

      await loadFacturas(currentPage)
    } catch (error) {
      toast.error(
        error?.message ||
        'Error al actualizar factura'
      )

      throw error
    }
  }

  const handleDeleteFactura = factura => {
    setFacturaToDelete(factura)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!facturaToDelete) {
      return
    }

    try {
      await facturaService.deleteFactura(
        facturaToDelete.id
      )

      toast.success(
        `Factura ${facturaToDelete.numeroFactura} eliminada exitosamente`
      )

      setShowDeleteModal(false)
      setFacturaToDelete(null)

      await loadFacturas(currentPage)
    } catch (error) {
      toast.error(
        error?.message ||
        'Error al eliminar factura'
      )
    }
  }

  const handleExportarPDF = async () => {
    try {
      /*
       * Con filtros activos se exportan todos los resultados
       * encontrados, no solamente la página visible.
       */
      if (filtrosActivos) {
        const todasLasFacturas =
          await obtenerTodasLasFacturas()

        const facturasParaExportar =
          filtrarFacturasLocal(todasLasFacturas)

        exportFacturasPDF(
          facturasParaExportar,
          stats
        )

        return
      }

      /*
       * Sin filtros se consultan también todas las páginas
       * para que el PDF incluya todas las facturas.
       */
      const todasLasFacturas =
        await obtenerTodasLasFacturas()

      exportFacturasPDF(
        todasLasFacturas,
        stats
      )
    } catch (error) {
      console.error(
        'Error al exportar facturas:',
        error
      )

      toast.error(
        'No se pudieron exportar las facturas'
      )
    }
  }

  const semanaActual =
    getSemanaOperativa(0)

  const semanaAnterior =
    getSemanaOperativa(-1)

  const semanaHace2 =
    getSemanaOperativa(-2)

  const semanaHace3 =
    getSemanaOperativa(-3)

  const semanaHace4 =
    getSemanaOperativa(-4)

  const primerRegistro =
    totalElements === 0
      ? 0
      : currentPage * pageSize + 1

  const ultimoRegistro =
    Math.min(
      (currentPage + 1) * pageSize,
      totalElements
    )

  if (loading && facturas.length === 0) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-slate-200 h-28 lg:h-32 rounded-xl"
              />
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
            type="button"
            onClick={handleExportarPDF}
            className="flex cursor-pointer items-center justify-center space-x-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
          >
            <FileDown className="h-5 w-5" />

            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
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

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative xl:col-span-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <input
              type="text"
              placeholder="Buscar factura, cliente, operador..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Cliente */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <select
              value={filterCliente}
              onChange={handleClienteChange}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="TODOS">
                Todos los clientes
              </option>

              {clientes.map(cliente => {
                const clienteId =
                  getClienteId(cliente)

                return (
                  <option
                    key={clienteId}
                    value={clienteId}
                  >
                    {getClienteNombre(cliente)}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Semana */}
          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <select
              value={filterSemana}
              onChange={handleSemanaChange}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="TODAS">
                Todas las semanas
              </option>

              <option value="ACTUAL">
                Actual:{' '}
                {formatFechaCorta(
                  semanaActual.inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  semanaActual.fin
                )}
              </option>

              <option value="ANTERIOR">
                Anterior:{' '}
                {formatFechaCorta(
                  semanaAnterior.inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  semanaAnterior.fin
                )}
              </option>

              <option value="HACE_2">
                Hace 2 semanas:{' '}
                {formatFechaCorta(
                  semanaHace2.inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  semanaHace2.fin
                )}
              </option>

              <option value="HACE_3">
                Hace 3 semanas:{' '}
                {formatFechaCorta(
                  semanaHace3.inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  semanaHace3.fin
                )}
              </option>

              <option value="HACE_4">
                Hace 4 semanas:{' '}
                {formatFechaCorta(
                  semanaHace4.inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  semanaHace4.fin
                )}
              </option>
            </select>
          </div>

          {/* Estado */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />

            <select
              value={filterEstatus}
              onChange={handleEstatusFilterChange}
              className="w-full pl-12 pr-4 py-2.5 lg:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="TODAS">
                Todas las facturas
              </option>

              <option value="POR_FACTURAR">
                Por facturar
              </option>

              <option value="FACTURADA">
                Facturadas
              </option>

              <option value="PENDIENTE">
                Pendientes
              </option>

              <option value="COMPLETADA">
                Completadas
              </option>

              <option value="PAGO_PARCIAL">
                Pago parcial
              </option>

              <option value="PAGADA">
                Pagadas
              </option>

              <option value="VENCIDA">
                Vencidas
              </option>
            </select>
          </div>
        </div>

        {filtrosActivos && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-700">
              Los filtros se están aplicando sobre todas
              las páginas de facturas.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Conteo de resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <p className="text-sm text-slate-600">
          Mostrando{' '}
          <span className="font-semibold text-slate-900">
            {filteredFacturas.length}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-slate-900">
            {totalElements}
          </span>{' '}
          facturas
        </p>

        {filterSemana !== 'TODAS' &&
          getSemanaSeleccionada() && (
            <p className="text-sm text-slate-500">
              Semana operativa:{' '}
              <span className="font-medium text-slate-700">
                {formatFechaCorta(
                  getSemanaSeleccionada().inicio
                )}{' '}
                -{' '}
                {formatFechaCorta(
                  getSemanaSeleccionada().fin
                )}
              </span>
            </p>
          )}
      </div>

      {/* Indicador de carga al cambiar filtros */}
      {loading && facturas.length > 0 && (
        <div className="mb-4 flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-700">
            Consultando facturas...
          </p>
        </div>
      )}

      {/* Facturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredFacturas.map(factura => (
          <FacturaCard
            key={factura.id}
            factura={factura}
            clientes={clientes}
            onPagar={handlePagarFactura}
            onViewDetails={handleViewDetails}
            onEstatusChange={handleEstatusChange}
            onRegistrarPagoParcial={
              handleRegistrarPagoParcial
            }
            onDelete={handleDeleteFactura}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {!loading &&
        filteredFacturas.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />

            <p className="text-slate-500">
              No se encontraron facturas
            </p>
          </div>
        )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm mt-6">
          {/* Móvil */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              type="button"
              onClick={() => {
                setCurrentPage(
                  Math.max(0, currentPage - 1)
                )
              }}
              disabled={
                currentPage === 0 ||
                loading
              }
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentPage(
                  Math.min(
                    totalPages - 1,
                    currentPage + 1
                  )
                )
              }}
              disabled={
                currentPage === totalPages - 1 ||
                loading
              }
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>

          {/* Escritorio */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Mostrando{' '}
                <span className="font-medium">
                  {primerRegistro}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {ultimoRegistro}
                </span>{' '}
                de{' '}
                <span className="font-medium">
                  {totalElements}
                </span>{' '}
                resultados
              </p>
            </div>

            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Paginación"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage(
                      Math.max(
                        0,
                        currentPage - 1
                      )
                    )
                  }}
                  disabled={
                    currentPage === 0 ||
                    loading
                  }
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">
                    Anterior
                  </span>

                  <ChevronLeft
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>

                {[...Array(totalPages)].map(
                  (_, index) => {
                    const mostrarPagina =
                      index === 0 ||
                      index === totalPages - 1 ||
                      (
                        index >= currentPage - 1 &&
                        index <= currentPage + 1
                      )

                    if (mostrarPagina) {
                      return (
                        <button
                          type="button"
                          key={index}
                          onClick={() => {
                            setCurrentPage(index)
                          }}
                          disabled={loading}
                          aria-current={
                            currentPage === index
                              ? 'page'
                              : undefined
                          }
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
                            currentPage === index
                              ? 'z-10 bg-blue-600 text-white'
                              : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      )
                    }

                    const mostrarPuntos =
                      index === currentPage - 2 ||
                      index === currentPage + 2

                    if (mostrarPuntos) {
                      return (
                        <span
                          key={index}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300"
                        >
                          ...
                        </span>
                      )
                    }

                    return null
                  }
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage(
                      Math.min(
                        totalPages - 1,
                        currentPage + 1
                      )
                    )
                  }}
                  disabled={
                    currentPage === totalPages - 1 ||
                    loading
                  }
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">
                    Siguiente
                  </span>

                  <ChevronRight
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal para pagar */}
      <PagarFacturaModal
        isOpen={showPagarModal}
        onClose={() => {
          setShowPagarModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmPago}
        factura={selectedFactura}
      />

      {/* Modal para pago parcial */}
      <PagoParcialModal
        isOpen={showPagoParcialModal}
        onClose={() => {
          setShowPagoParcialModal(false)
          setSelectedFactura(null)
        }}
        onConfirm={handleConfirmPagoParcial}
        factura={selectedFactura}
      />

      {/* Modal de detalles */}
      <ViewFacturaModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedFactura(null)
        }}
        factura={selectedFactura}
        clientes={clientes}
      />

      {/* Modal de edición */}
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

      {/* Confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-xs bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Confirmar eliminación
            </h3>

            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la
              factura{' '}
              <strong>
                {facturaToDelete?.numeroFactura}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setFacturaToDelete(null)
                }}
                className="px-4 cursor-pointer py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancelar
              </button>

              <button
                type="button"
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