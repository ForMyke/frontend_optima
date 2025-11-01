'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  Truck,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Filter,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'
import { viajesService } from '@/app/services/viajesService'
import { bitacoraService } from '@/app/services/bitacoraService'
import { unidadesService } from '@/app/services/unidadesService'

const COLORS = {
  primary: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  status: {
    PENDIENTE: '#f59e0b',
    EN_CURSO: '#3b82f6',
    COMPLETADO: '#10b981',
    CANCELADO: '#ef4444'
  },
  estado: {
    ACTIVA: '#10b981',
    MANTENIMIENTO: '#f59e0b',
    INACTIVA: '#ef4444'
  }
}

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs lg:text-sm font-medium text-slate-600">{title}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
      </div>
    </div>
    <p className="text-2xl lg:text-3xl font-bold text-slate-900">{value}</p>
    {trend && (
      <p className={`text-xs mt-2 flex items-center ${
        trend > 0 ? 'text-green-600' : 'text-red-600'
      }`}>
        <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
        {Math.abs(trend)}% vs mes anterior
      </p>
    )}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <p className="font-bold text-slate-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? entry.value.toLocaleString('es-MX', { minimumFractionDigits: 0 })
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function GraficosPage() {
  const [viajes, setViajes] = useState([])
  const [bitacoras, setBitacoras] = useState([])
  const [unidades, setUnidades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6m') // 1m, 3m, 6m, 1a

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [viajesData, bitacorasData, unidadesData] = await Promise.all([
        viajesService.getViajes(0, 1000).catch(() => ({ content: [] })),
        bitacoraService.getAll().catch(() => ({ content: [] })),
        unidadesService.getAll().catch(() => ({ content: [] }))
      ])

      console.log('Datos cargados:', { viajesData, bitacorasData, unidadesData })

      // Extraer datos de la estructura paginada (content) o usar directamente si es array
      setViajes(Array.isArray(viajesData?.content) ? viajesData.content : Array.isArray(viajesData) ? viajesData : [])
      setBitacoras(Array.isArray(bitacorasData?.content) ? bitacorasData.content : Array.isArray(bitacorasData) ? bitacorasData : [])
      setUnidades(Array.isArray(unidadesData?.content) ? unidadesData.content : Array.isArray(unidadesData) ? unidadesData : [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Procesar datos para gráficos de viajes
  const getViajesPorMes = () => {
    if (!Array.isArray(viajes) || viajes.length === 0) return []
    
    const meses = {}
    viajes.forEach(viaje => {
      if (viaje.fechaSalida) {
        const fecha = new Date(viaje.fechaSalida)
        // Crear clave con formato YYYY-MM para ordenar correctamente
        const anio = fecha.getFullYear()
        const mes = fecha.getMonth()
        const clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
        const nombreMes = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        
        if (!meses[clave]) {
          meses[clave] = { mes: nombreMes, cantidad: 0, orden: fecha.getTime() }
        }
        meses[clave].cantidad++
      }
    })
    
    // Ordenar por fecha y tomar los últimos 6 meses
    return Object.values(meses)
      .sort((a, b) => a.orden - b.orden)
      .slice(-6)
      .map(({ mes, cantidad }) => ({ mes, cantidad }))
  }

  const getViajesPorEstado = () => {
    if (!Array.isArray(viajes) || viajes.length === 0) return []
    
    const estados = {}
    viajes.forEach(viaje => {
      estados[viaje.estado] = (estados[viaje.estado] || 0) + 1
    })
    
    return Object.entries(estados).map(([name, value]) => ({ name, value }))
  }

  // Procesar datos para gráficos de gastos (bitácoras)
  const getGastosPorMes = () => {
    if (!Array.isArray(bitacoras) || bitacoras.length === 0) return []
    
    const meses = {}
    bitacoras.forEach(bitacora => {
      if (bitacora.fechaCarga || bitacora.fechaHoraInicio) {
        const fecha = new Date(bitacora.fechaCarga || bitacora.fechaHoraInicio)
        const mes = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        
        // Sumar los gastos desglosados (no usar costoTotal)
        const gastoTotal = (
          parseFloat(bitacora.dieselLitros || 0) +
          parseFloat(bitacora.casetas || 0) +
          parseFloat(bitacora.gastosExtras || 0) +
          parseFloat(bitacora.comisionOperador || 0)
        )
        
        meses[mes] = (meses[mes] || 0) + gastoTotal
      }
    })
    
    return Object.entries(meses)
      .map(([mes, total]) => ({ mes, total: Math.round(total) }))
      .slice(-6)
  }

  const getGastosPorCategoria = () => {
    if (!Array.isArray(bitacoras) || bitacoras.length === 0) return []
    
    let diesel = 0
    let casetas = 0
    let extras = 0
    let comisiones = 0

    bitacoras.forEach(bitacora => {
      // Usar los valores directos de la API
      diesel += parseFloat(bitacora.dieselLitros || 0)
      casetas += parseFloat(bitacora.casetas || 0)
      extras += parseFloat(bitacora.gastosExtras || 0)
      comisiones += parseFloat(bitacora.comisionOperador || 0)
    })

    return [
      { name: 'Diesel', value: Math.round(diesel) },
      { name: 'Casetas', value: Math.round(casetas) },
      { name: 'Comisiones', value: Math.round(comisiones) },
      { name: 'Gastos Extras', value: Math.round(extras) }
    ].filter(item => item.value > 0)
  }

  const getIngresoVsGasto = () => {
    if ((!Array.isArray(viajes) || viajes.length === 0) && (!Array.isArray(bitacoras) || bitacoras.length === 0)) return []
    
    const meses = {}
    
    // Ingresos de viajes (tarifa)
    if (Array.isArray(viajes)) {
      viajes.forEach(viaje => {
        if (viaje.fechaSalida && viaje.tarifa) {
          const fecha = new Date(viaje.fechaSalida)
          const mes = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
          if (!meses[mes]) meses[mes] = { mes, ingresos: 0, gastos: 0 }
          meses[mes].ingresos += parseFloat(viaje.tarifa)
        }
      })
    }

    // Gastos de bitácoras (sumar los conceptos desglosados)
    if (Array.isArray(bitacoras)) {
      bitacoras.forEach(bitacora => {
        if (bitacora.fechaCarga || bitacora.fechaHoraInicio) {
          const fecha = new Date(bitacora.fechaCarga || bitacora.fechaHoraInicio)
          const mes = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
          if (!meses[mes]) meses[mes] = { mes, ingresos: 0, gastos: 0 }
          
          // Sumar los gastos desglosados (no usar costoTotal)
          const gastoTotal = (
            parseFloat(bitacora.dieselLitros || 0) +
            parseFloat(bitacora.casetas || 0) +
            parseFloat(bitacora.gastosExtras || 0) +
            parseFloat(bitacora.comisionOperador || 0)
          )
          meses[mes].gastos += gastoTotal
        }
      })
    }

    return Object.values(meses)
      .map(item => ({
        ...item,
        ingresos: Math.round(item.ingresos),
        gastos: Math.round(item.gastos),
        utilidad: Math.round(item.ingresos - item.gastos)
      }))
      .slice(-6)
  }

  // Procesar datos para gráficos de unidades
  const getUnidadesPorEstado = () => {
    if (!Array.isArray(unidades) || unidades.length === 0) return []
    
    const estados = {}
    unidades.forEach(unidad => {
      estados[unidad.estado] = (estados[unidad.estado] || 0) + 1
    })
    
    return Object.entries(estados).map(([name, value]) => ({ name, value }))
  }

  const getKilometrajePorUnidad = () => {
    if (!Array.isArray(unidades) || unidades.length === 0) return []
    
    return unidades
      .map(unidad => ({
        unidad: unidad.placas,
        kilometraje: parseFloat(unidad.kilometrajeActual || 0)
      }))
      .sort((a, b) => b.kilometraje - a.kilometraje)
      .slice(0, 10)
  }

  // Calcular estadísticas
  const unidadesArray = Array.isArray(unidades) ? unidades : []
  const stats = {
    totalViajes: Array.isArray(viajes) ? viajes.length : 0,
    viajesActivos: Array.isArray(viajes) ? viajes.filter(v => v.estado === 'EN_CURSO').length : 0,
    totalGastos: Array.isArray(bitacoras) ? bitacoras.reduce((sum, b) => {
      // Sumar los gastos desglosados (no usar costoTotal)
      const diesel = parseFloat(b.dieselLitros || 0)
      const casetas = parseFloat(b.casetas || 0)
      const extras = parseFloat(b.gastosExtras || 0)
      const comision = parseFloat(b.comisionOperador || 0)
      return sum + diesel + casetas + extras + comision
    }, 0) : 0,
    totalUnidades: unidadesArray.length,
    unidadesActivas: unidadesArray.filter(u => u.estado === 'ACTIVA').length,
    unidadesMantenimiento: unidadesArray.filter(u => u.estado === 'MANTENIMIENTO').length,
    unidadesInactivas: unidadesArray.filter(u => u.estado === 'INACTIVA').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard de Análisis</h1>
              <p className="text-sm lg:text-base text-slate-600 mt-1">
                Visualización y análisis de datos operacionales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 cursor-pointer"
              >
                <option value="1m">Último mes</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1a">Último año</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <StatCard
            title="Total de viajes"
            value={stats.totalViajes}
            icon={Truck}
            color="bg-blue-600"
            trend={8.5}
          />
          <StatCard
            title="Viajes activos"
            value={stats.viajesActivos}
            icon={Activity}
            color="bg-orange-600"
          />
          <StatCard
            title="Gastos totales"
            value={`$${stats.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
            icon={DollarSign}
            color="bg-red-600"
            trend={-3.2}
          />
          <StatCard
            title="Unidades activas"
            value={`${stats.unidadesActivas}/${stats.totalUnidades}`}
            icon={Truck}
            color="bg-green-600"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ingresos vs Gastos */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ingresos vs Gastos</h3>
                <p className="text-sm text-slate-600">Comparativa mensual</p>
              </div>
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getIngresoVsGasto()}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Legend />
                <Bar
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="url(#colorIngresos)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="gastos"
                  name="Gastos"
                  fill="url(#colorGastos)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos por categoría */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gastos por Categoría</h3>
                <p className="text-sm text-slate-600">Distribución de gastos</p>
              </div>
              <PieChartIcon className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="grad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#be185d" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="grad4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={getGastosPorCategoria()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getGastosPorCategoria().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#grad${(index % 4) + 1})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                      {value}: ${entry.payload.value.toLocaleString('es-MX')}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos de viajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Viajes por mes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Viajes por Mes</h3>
                <p className="text-sm text-slate-600">Tendencia mensual</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getViajesPorMes()}>
                <defs>
                  <linearGradient id="colorViajes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Area
                  type="monotone"
                  dataKey="cantidad"
                  name="Viajes"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViajes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Viajes por estado */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Viajes por Estado</h3>
                <p className="text-sm text-slate-600">Distribución actual</p>
              </div>
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getViajesPorEstado()}>
                <defs>
                  {Object.entries(COLORS.status).map(([key, color]) => (
                    <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Bar dataKey="value" name="Cantidad" radius={[8, 8, 0, 0]}>
                  {getViajesPorEstado().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient-${entry.name})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos de unidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unidades por estado */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Unidades por Estado</h3>
                <p className="text-sm text-slate-600">Estado actual de la flota</p>
              </div>
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradActiva" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradMantenimiento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradInactiva" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={getUnidadesPorEstado()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getUnidadesPorEstado().map((entry, index) => {
                    const fillMap = {
                      'ACTIVA': 'url(#gradActiva)',
                      'MANTENIMIENTO': 'url(#gradMantenimiento)',
                      'INACTIVA': 'url(#gradInactiva)'
                    }
                    return <Cell key={`cell-${index}`} fill={fillMap[entry.name] || COLORS.primary[index]} />
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                      {value}: {entry.payload.value} unidad{entry.payload.value !== 1 ? 'es' : ''}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Kilometraje por unidad */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kilometraje por Unidad</h3>
                <p className="text-sm text-slate-600">Top 10 unidades</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getKilometrajePorUnidad()} layout="vertical">
                <defs>
                  <linearGradient id="gradKm" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="unidad" stroke="#334155" style={{ fontSize: '11px' }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                <Bar dataKey="kilometraje" name="Km" fill="url(#gradKm)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gastos mensuales */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Gastos Mensuales</h3>
                <p className="text-sm text-slate-600">Evolución de gastos operativos</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={getGastosPorMes()}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.05)' }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Gasto Total"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
