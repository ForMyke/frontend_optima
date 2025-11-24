'use client'

import { useState, useEffect } from 'react'
import {
  History,
  Package,
  ArrowRightLeft,
  Calendar,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileDown,
  Warehouse
} from 'lucide-react'
import toast from 'react-hot-toast'
import { historicoService } from '@/app/services/historicoService'
import { exportHistoricoPDF } from '@/utils/pdfExport'

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const MovimientoCard = ({ movimiento }) => {
  const tipoMovimiento = {
    ENTRADA: { label: 'Entrada', color: 'bg-green-100 text-green-800', icon: '' },
    SALIDA: { label: 'Salida', color: 'bg-red-100 text-red-800', icon: '' },
    TRANSFERENCIA: { label: 'Transferencia', color: 'bg-blue-100 text-blue-800', icon: '' },
    AJUSTE: { label: 'Ajuste', color: 'bg-orange-100 text-orange-800', icon: '' }
  }

  const tipo = tipoMovimiento[movimiento.tipo] || tipoMovimiento.ENTRADA

  // Obtener almacén de la refacción si existe
  const almacen = movimiento.refaccion?.almacen

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{tipo.icon}</div>
          <div>
            <h3 className="font-semibold text-slate-900">{movimiento.refaccion?.nombre || 'Refacción'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{movimiento.refaccion?.descripcion || ''}</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipo.color} mt-1`}>
              {tipo.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Cantidad</p>
          <p className={`text-lg font-bold ${movimiento.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
            {movimiento.tipo === 'ENTRADA' ? '+' : '-'}{movimiento.cantidad}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {almacen && (
          <div>
            <p className="text-slate-500 flex items-center mb-1">
              <Warehouse className="h-3.5 w-3.5 mr-1" />
              Almacén
            </p>
            <p className="font-medium text-slate-900">{almacen.nombre}</p>
            <p className="text-xs text-slate-500">{almacen.ubicacion || ''}</p>
          </div>
        )}
        
        <div>
          <p className="text-slate-500 flex items-center mb-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Fecha
          </p>
          <p className="font-medium text-slate-900">
            {new Date(movimiento.fecha).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {movimiento.costoUnitario && (
          <div>
            <p className="text-slate-500 mb-1">Costo Unitario</p>
            <p className="font-medium text-slate-900">
              ${parseFloat(movimiento.costoUnitario).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {movimiento.costoUnitario && movimiento.cantidad && (
          <div>
            <p className="text-slate-500 mb-1">Costo Total</p>
            <p className="font-medium text-slate-900">
              ${(parseFloat(movimiento.costoUnitario) * movimiento.cantidad).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {movimiento.referencia && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Referencia</p>
          <p className="text-sm text-slate-700">{movimiento.referencia}</p>
        </div>
      )}
    </div>
  )
}

export default function HistoricoPage() {
  const [movimientos, setMovimientos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(10)
  const [tipoFilter, setTipoFilter] = useState('')

  useEffect(() => {
    loadMovimientos()
  }, [currentPage])

  const loadMovimientos = async () => {
    setIsLoading(true)
    try {
      const response = await historicoService.getMovimientos(currentPage, pageSize, 'fecha,desc')
      setMovimientos(response.content || [])
      setTotalPages(response.totalPages || 0)
      setTotalElements(response.totalElements || 0)
    } catch (error) {
      console.error('Error loading movimientos:', error)
      toast.error('Error al cargar el histórico de movimientos')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMovimientos = movimientos.filter(movimiento => {
    const matchesSearch = 
      movimiento.refaccion?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.refaccion?.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.refaccion?.almacen?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movimiento.referencia?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = tipoFilter === '' || movimiento.tipo === tipoFilter

    return matchesSearch && matchesTipo
  })

  // Calcular estadísticas
  const stats = {
    total: totalElements,
    entradas: movimientos.filter(m => m.tipo === 'ENTRADA').length,
    salidas: movimientos.filter(m => m.tipo === 'SALIDA').length,
    transferencias: movimientos.filter(m => m.tipo === 'TRANSFERENCIA').length
  }

  if (isLoading && movimientos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center">
              <History className="h-8 w-8 mr-3 text-blue-600" />
              Histórico de Movimientos
            </h1>
            <p className="text-slate-600 mt-1">Registro completo de movimientos de inventario</p>
          </div>
          <button
            onClick={() => {
              if (filteredMovimientos.length === 0) {
                toast.error('No hay movimientos para exportar')
                return
              }
              exportHistoricoPDF(filteredMovimientos, stats)
              toast.success('PDF generado correctamente')
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Movimientos"
          value={stats.total}
          icon={ArrowRightLeft}
          color="bg-blue-600"
        />
        <StatCard
          title="Entradas"
          value={stats.entradas}
          icon={Package}
          color="bg-green-600"
        />
        <StatCard
          title="Salidas"
          value={stats.salidas}
          icon={Package}
          color="bg-red-600"
        />
        <StatCard
          title="Transferencias"
          value={stats.transferencias}
          icon={ArrowRightLeft}
          color="bg-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por refacción, almacén o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="TRANSFERENCIA">Transferencias</option>
              <option value="AJUSTE">Ajustes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movimientos List */}
      {filteredMovimientos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
          <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay movimientos registrados
          </h3>
          <p className="text-slate-600">
            {searchTerm || tipoFilter ? 'No se encontraron movimientos con los filtros aplicados' : 'Aún no se han registrado movimientos en el sistema'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMovimientos.map((movimiento) => (
              <MovimientoCard key={movimiento.id} movimiento={movimiento} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Mostrando {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} movimientos
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 text-slate-600" />
                  </button>
                  <span className="text-sm font-medium text-slate-900">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
