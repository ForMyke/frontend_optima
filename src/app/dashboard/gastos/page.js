'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  DollarSign,
  FileDown,
  Settings,
  CalendarDays,
  XCircle
} from 'lucide-react'
import gastosService from '@/app/services/gastosService'
import toast from 'react-hot-toast'
import {
  StatCard,
  GastoSemanalCard,
  CreateGastoSemanalModal,
  EditGastoSemanalModal,
  ViewGastoSemanalModal,
  ConfirmDeleteModal,
  GastosFijosModal
} from './components'
import { exportGastosPDF } from '@/utils/pdfExport'

export default function GastosSemanalesPage() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [fechaInicioFiltro, setFechaInicioFiltro] = useState('')
  const [fechaFinFiltro, setFechaFinFiltro] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGasto, setSelectedGasto] = useState(null)
  const [showGastosFijosModal, setShowGastosFijosModal] = useState(false)

  useEffect(() => {
    loadGastos()
  }, [])

  const loadGastos = async () => {
    try {
      setLoading(true)
      const data = await gastosService.getGastosSemanales(0, 100)
      setGastos(data.content || data || [])
    } catch (error) {
      console.error('Error loading gastos:', error)
      toast.error('Error al cargar gastos semanales')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGasto = async (gastoData) => {
    try {
      await gastosService.createGastoSemanal(gastoData)
      toast.success('Gasto semanal creado exitosamente')
      setShowCreateModal(false)
      loadGastos()
    } catch (error) {
      toast.error(error.message || 'Error al crear gasto semanal')
      throw error
    }
  }

  const handleEditGasto = (gasto) => {
    setSelectedGasto(gasto)
    setShowEditModal(true)
  }

  const handleUpdateGasto = async (gastoId, gastoData) => {
    try {
      await gastosService.updateGastoSemanal(gastoId, gastoData)
      toast.success('Gasto semanal actualizado exitosamente')
      setShowEditModal(false)
      setSelectedGasto(null)
      loadGastos()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar gasto semanal')
      throw error
    }
  }

  const handleViewGasto = (gasto) => {
    setSelectedGasto(gasto)
    setShowViewModal(true)
  }

  const handleDeleteGasto = (gasto) => {
    setSelectedGasto(gasto)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async (gastoId) => {
    try {
      await gastosService.deleteGastoSemanal(gastoId)
      toast.success('Gasto semanal eliminado exitosamente')
      setShowDeleteModal(false)
      setSelectedGasto(null)
      loadGastos()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar gasto semanal')
    }
  }

  const parseFechaLocal = (fecha) => {
    if (!fecha) return null

    const fechaTexto = String(fecha)

    return new Date(
      fechaTexto.includes('T')
        ? fechaTexto
        : `${fechaTexto}T12:00:00`
    )
  }

  const gastoCoincideConFechas = (gasto) => {
    if (!fechaInicioFiltro && !fechaFinFiltro) return true

    const inicioFiltro = fechaInicioFiltro
      ? parseFechaLocal(fechaInicioFiltro)
      : null

    const finFiltro = fechaFinFiltro
      ? parseFechaLocal(fechaFinFiltro)
      : null

    const inicioGasto = gasto.semanaInicio
      ? parseFechaLocal(gasto.semanaInicio)
      : null

    const finGasto = gasto.semanaFin
      ? parseFechaLocal(gasto.semanaFin)
      : inicioGasto

    if (!inicioGasto && !finGasto) return false

    if (inicioFiltro && finGasto && finGasto < inicioFiltro) {
      return false
    }

    if (finFiltro && inicioGasto && inicioGasto > finFiltro) {
      return false
    }

    return true
  }

  const limpiarFiltros = () => {
    setSearchTerm('')
    setFechaInicioFiltro('')
    setFechaFinFiltro('')
  }

  const filtrosActivos =
    searchTerm.trim() !== '' ||
    fechaInicioFiltro !== '' ||
    fechaFinFiltro !== ''

  // Calcular estadísticas
  const calcularTotal = (gasto) => {
    return (
      parseFloat(gasto.iave || 0) +
      parseFloat(gasto.imss || 0) +
      parseFloat(gasto.infonavit || 0) +
      parseFloat(gasto.diesel || 0) +
      parseFloat(gasto.nomina || 0) +
      parseFloat(gasto.refacciones || 0) +
      parseFloat(gasto.contador || 0) +
      parseFloat(gasto.gps || 0) +
      parseFloat(gasto.gastosExtras || 0) +
      parseFloat(gasto.seguros || 0) +
      parseFloat(gasto.creditos || 0) +
      parseFloat(gasto.telefonia || 0) +
      parseFloat(gasto.gastoExtrahordinario || 0)
    )
  }

  // Filtrar gastos
  const filteredGastos = gastos.filter(gasto => {
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch =
      searchTerm === '' ||
      gasto.id?.toString().includes(searchLower) ||
      gasto.semanaInicio?.toLowerCase().includes(searchLower) ||
      gasto.semanaFin?.toLowerCase().includes(searchLower) ||
      gasto.observaciones?.toLowerCase().includes(searchLower)

    const matchesFecha = gastoCoincideConFechas(gasto)

    return matchesSearch && matchesFecha
  })

  const stats = {
    totalSemanas: filteredGastos.length,
    totalGastos: filteredGastos.reduce((sum, g) => sum + calcularTotal(g), 0),
    promedioSemanal: filteredGastos.length > 0
      ? filteredGastos.reduce((sum, g) => sum + calcularTotal(g), 0) / filteredGastos.length
      : 0,
    mayorGasto: filteredGastos.length > 0
      ? Math.max(...filteredGastos.map(g => calcularTotal(g)))
      : 0
  }

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
          <h1 className="text-3xl font-bold text-slate-900">
            Gastos Diarios Administrativos y Operativos
          </h1>
          <p className="text-slate-600 mt-1">
            Registro y control de gastos diarios
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => exportGastosPDF(filteredGastos, stats)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <FileDown className="h-5 w-5" />
            <span>Exportar PDF</span>
          </button>

          <button
            onClick={() => setShowGastosFijosModal(true)}
            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Settings className="h-5 w-5" />
            <span>Gastos fijos</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Search and Date Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, fecha, observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="date"
              value={fechaInicioFiltro}
              onChange={(e) => setFechaInicioFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="date"
              value={fechaFinFiltro}
              onChange={(e) => setFechaFinFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {filtrosActivos && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-700">
              Filtros activos. Mostrando gastos según búsqueda o rango de fechas.
            </p>

            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
            >
              <XCircle className="h-4 w-4" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{filteredGastos.length}</span> de{' '}
          <span className="font-semibold text-slate-900">{gastos.length}</span> registros
        </p>

        {(fechaInicioFiltro || fechaFinFiltro) && (
          <p className="text-sm text-slate-500">
            Rango:{' '}
            <span className="font-medium text-slate-700">
              {fechaInicioFiltro || 'Sin inicio'}
            </span>{' '}
            a{' '}
            <span className="font-medium text-slate-700">
              {fechaFinFiltro || 'Sin fin'}
            </span>
          </p>
        )}
      </div>

      {/* Gastos Grid */}
      {filteredGastos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No se encontraron gastos
          </h3>

          <p className="text-slate-600 mb-6">
            {filtrosActivos
              ? 'Intenta ajustar los filtros de búsqueda o rango de fechas'
              : 'Comienza registrando el primer gasto semanal'}
          </p>

          {!filtrosActivos && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar primer gasto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGastos.map((gasto) => (
            <GastoSemanalCard
              key={gasto.id}
              gasto={gasto}
              calcularTotal={calcularTotal}
              onEdit={handleEditGasto}
              onDelete={handleDeleteGasto}
              onViewDetails={handleViewGasto}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateGastoSemanalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGasto}
      />

      <EditGastoSemanalModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedGasto(null)
        }}
        onSubmit={handleUpdateGasto}
        gasto={selectedGasto}
      />

      <ViewGastoSemanalModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedGasto(null)
        }}
        gasto={selectedGasto}
        calcularTotal={calcularTotal}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedGasto(null)
        }}
        onConfirm={handleConfirmDelete}
        gasto={selectedGasto}
        calcularTotal={calcularTotal}
      />

      <GastosFijosModal
        isOpen={showGastosFijosModal}
        onClose={() => setShowGastosFijosModal(false)}
      />
    </div>
  )
}