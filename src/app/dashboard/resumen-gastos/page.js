'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Fuel,
  CreditCard,
  Users,
  PlusCircle,
  Truck,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import gastosService from '@/app/services/gastosService'

const ResumenGastosPage = () => {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadResumen()
  }, [])

  const loadResumen = async () => {
    try {
      setLoading(true)
      const data = await gastosService.getGastosGenerados()
      setResumen(data)
      setLastUpdate(new Date())
    } catch (error) {
      toast.error('Error al cargar el resumen de gastos')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    toast.promise(
      loadResumen(),
      {
        loading: 'Actualizando resumen...',
        success: 'Resumen actualizado',
        error: 'Error al actualizar'
      }
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    // Parsear la fecha como local para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getTotalGastos = () => {
    if (!resumen) return 0
    return (resumen.iave || 0) + (resumen.diesel || 0) + (resumen.nomina || 0) + (resumen.gastosExtras || 0)
  }

  const getGastosPorcentaje = (gasto) => {
    const total = getTotalGastos()
    if (total === 0) return 0
    return ((gasto / total) * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando resumen de gastos...</p>
        </div>
      </div>
    )
  }

  if (!resumen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">No se pudo cargar el resumen</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  const totalGastos = getTotalGastos()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center">
              Resumen de Gastos Semanales
            </h1>
            <p className="text-slate-600 mt-2">
              Resumen generado automáticamente por el sistema
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Período */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium">Período del resumen</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatDate(resumen.fechaInicio)} - {formatDate(resumen.fechaFin)}
                </p>
              </div>
            </div>
            {lastUpdate && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Última actualización</p>
                <p className="text-sm font-medium text-slate-700">
                  {lastUpdate.toLocaleTimeString('es-MX')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total General */}
      <div className="mb-8">
        <div className="border border-emerald-500 rounded-2xl p-8 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 text-lg font-medium mb-2">Total de Gastos del Período</p>
              <p className="text-5xl font-bold text-black">{formatCurrency(totalGastos)}</p>
              <p className="text-emerald-700 mt-3 flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                {resumen.totalViajes} viajes realizados
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Gastos */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Desglose de Gastos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* IAVE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {getGastosPorcentaje(resumen.iave)}%
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">IAVE / Casetas</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(resumen.iave)}</p>
            {/* Barra de progreso */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{ width: `${getGastosPorcentaje(resumen.iave)}%` }}
              />
            </div>
          </div>

          {/* Diesel */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Fuel className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                {getGastosPorcentaje(resumen.diesel)}%
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">Diesel</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(resumen.diesel)}</p>
            {/* Barra de progreso */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all"
                style={{ width: `${getGastosPorcentaje(resumen.diesel)}%` }}
              />
            </div>
          </div>

          {/* Nómina */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {getGastosPorcentaje(resumen.nomina)}%
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">Nómina</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(resumen.nomina)}</p>
            {/* Barra de progreso */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${getGastosPorcentaje(resumen.nomina)}%` }}
              />
            </div>
          </div>

          {/* Gastos Extras */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <PlusCircle className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                {getGastosPorcentaje(resumen.gastosExtras)}%
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">Gastos Extras</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(resumen.gastosExtras)}</p>
            {/* Barra de progreso */}
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all"
                style={{ width: `${getGastosPorcentaje(resumen.gastosExtras)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Promedio por Viaje */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Promedio por Viaje</p>
          <p className="text-2xl font-bold text-slate-900">
            {resumen.totalViajes > 0 ? formatCurrency(totalGastos / resumen.totalViajes) : '$0.00'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Basado en {resumen.totalViajes} viajes
          </p>
        </div>

        {/* Gasto Dominante */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Mayor Gasto</p>
          <p className="text-2xl font-bold text-slate-900">
            {resumen.iave >= resumen.diesel && resumen.iave >= resumen.nomina && resumen.iave >= resumen.gastosExtras ? 'IAVE' :
              resumen.diesel >= resumen.nomina && resumen.diesel >= resumen.gastosExtras ? 'Diesel' :
                resumen.nomina >= resumen.gastosExtras ? 'Nómina' : 'Gastos Extras'}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Categoría con más gastos
          </p>
        </div>

        {/* Duración del Período */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Duración</p>
          <p className="text-2xl font-bold text-slate-900">
            {(() => {
              const [yearInicio, monthInicio, dayInicio] = resumen.fechaInicio.split('-')
              const [yearFin, monthFin, dayFin] = resumen.fechaFin.split('-')
              const inicio = new Date(yearInicio, monthInicio - 1, dayInicio)
              const fin = new Date(yearFin, monthFin - 1, dayFin)
              return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)) + 1
            })()} días
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Del período analizado
          </p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Acerca de este resumen
            </p>
            <p className="text-sm text-blue-700">
              Este resumen se genera automáticamente por el sistema y consolida todos los gastos registrados
              durante el período especificado. Los datos se actualizan periódicamente y reflejan la información
              más reciente disponible en el sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumenGastosPage
