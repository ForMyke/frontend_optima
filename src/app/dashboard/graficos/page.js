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
import { clientsService } from '@/app/services/clientsService'
import { operadoresService } from '@/app/services/operadoresService'
import { facturaService } from '@/app/services/facturaService'
import { refaccionesService } from '@/app/services/refaccionesService'
import { authService } from '@/app/services/authService'
import { canViewChart, canViewStatCard, getRoleDisplayName } from '@/config/permissions'

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
  const [clientes, setClientes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [facturas, setFacturas] = useState([])
  const [refacciones, setRefacciones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6m') // diario, semanal, 1m, 3m, 6m, 1a
  const [userRole, setUserRole] = useState(null)

  // Función para obtener la cantidad de datos a mostrar según el período
  const getDataLimit = () => {
    switch (selectedPeriod) {
      case 'diario':
        return 7 // Últimos 7 días
      case 'semanal':
        return 4 // Últimas 4 semanas
      case '1m':
        return 1 // Último mes
      case '3m':
        return 3 // Últimos 3 meses
      case '6m':
        return 6 // Últimos 6 meses
      case '1a':
        return 12 // Últimos 12 meses
      default:
        return 6
    }
  }

  useEffect(() => {
    // Obtener el rol del usuario
    const user = authService.getUser()
    if (user?.rol) {
      setUserRole(user.rol)
    }
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [viajesData, bitacorasData, unidadesData, clientesData, operadoresData, facturasData, refaccionesData] = await Promise.all([
        viajesService.getViajes(0, 1000).catch(() => ({ content: [] })),
        bitacoraService.getAll().catch(() => ({ content: [] })),
        unidadesService.getAll().catch(() => ({ content: [] })),
        clientsService.getClients(0, 1000).catch(() => ({ content: [] })),
        operadoresService.getOperadores(0, 1000).catch(() => ({ content: [] })),
        facturaService.getFacturas(0, 1000).catch(() => ({ content: [] })),
        refaccionesService.getRefacciones(0, 1000).catch(() => ({ content: [] }))
      ])

      console.log('Datos cargados:', { viajesData, bitacorasData, unidadesData, clientesData, operadoresData, facturasData, refaccionesData })

      // Extraer datos de la estructura paginada (content) o usar directamente si es array
      setViajes(Array.isArray(viajesData?.content) ? viajesData.content : Array.isArray(viajesData) ? viajesData : [])
      setBitacoras(Array.isArray(bitacorasData?.content) ? bitacorasData.content : Array.isArray(bitacorasData) ? bitacorasData : [])
      setUnidades(Array.isArray(unidadesData?.content) ? unidadesData.content : Array.isArray(unidadesData) ? unidadesData : [])
      setClientes(Array.isArray(clientesData?.content) ? clientesData.content : Array.isArray(clientesData) ? clientesData : [])
      setOperadores(Array.isArray(operadoresData?.content) ? operadoresData.content : Array.isArray(operadoresData) ? operadoresData : [])
      setFacturas(Array.isArray(facturasData?.content) ? facturasData.content : Array.isArray(facturasData) ? facturasData : [])
      setRefacciones(Array.isArray(refaccionesData?.content) ? refaccionesData.content : Array.isArray(refaccionesData) ? refaccionesData : [])
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
    
    const periodos = {}
    viajes.forEach(viaje => {
      if (viaje.fechaSalida) {
        const fecha = new Date(viaje.fechaSalida)
        let clave, nombrePeriodo
        
        if (selectedPeriod === 'diario') {
          // Agrupar por día
          clave = fecha.toISOString().split('T')[0]
          nombrePeriodo = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        } else if (selectedPeriod === 'semanal') {
          // Agrupar por semana
          const inicioSemana = new Date(fecha)
          inicioSemana.setDate(fecha.getDate() - fecha.getDay())
          clave = inicioSemana.toISOString().split('T')[0]
          nombrePeriodo = `Sem ${inicioSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
        } else {
          // Agrupar por mes (comportamiento original)
          const anio = fecha.getFullYear()
          const mes = fecha.getMonth()
          clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
          nombrePeriodo = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        }
        
        if (!periodos[clave]) {
          periodos[clave] = { mes: nombrePeriodo, cantidad: 0, orden: fecha.getTime() }
        }
        periodos[clave].cantidad++
      }
    })
    
    // Ordenar por fecha y tomar según el período seleccionado
    const limit = getDataLimit()
    return Object.values(periodos)
      .sort((a, b) => a.orden - b.orden)
      .slice(-limit)
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
    
    const periodos = {}
    bitacoras.forEach(bitacora => {
      if (bitacora.fechaCarga || bitacora.fechaHoraInicio) {
        const fecha = new Date(bitacora.fechaCarga || bitacora.fechaHoraInicio)
        let clave, nombrePeriodo
        
        if (selectedPeriod === 'diario') {
          clave = fecha.toISOString().split('T')[0]
          nombrePeriodo = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        } else if (selectedPeriod === 'semanal') {
          const inicioSemana = new Date(fecha)
          inicioSemana.setDate(fecha.getDate() - fecha.getDay())
          clave = inicioSemana.toISOString().split('T')[0]
          nombrePeriodo = `Sem ${inicioSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
        } else {
          const anio = fecha.getFullYear()
          const mes = fecha.getMonth()
          clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
          nombrePeriodo = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        }
        
        // Sumar los gastos desglosados (no usar costoTotal)
        const gastoTotal = (
          parseFloat(bitacora.dieselLitros || 0) +
          parseFloat(bitacora.casetas || 0) +
          parseFloat(bitacora.gastosExtras || 0) +
          parseFloat(bitacora.comisionOperador || 0)
        )
        
        if (!periodos[clave]) {
          periodos[clave] = { mes: nombrePeriodo, total: 0, orden: fecha.getTime() }
        }
        periodos[clave].total += gastoTotal
      }
    })
    
    // Ordenar por fecha y tomar según el período seleccionado
    const limit = getDataLimit()
    return Object.values(periodos)
      .sort((a, b) => a.orden - b.orden)
      .slice(-limit)
      .map(({ mes, total }) => ({ mes, total: Math.round(total) }))
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
    
    const periodos = {}
    
    // Ingresos de viajes (tarifa)
    if (Array.isArray(viajes)) {
      viajes.forEach(viaje => {
        if (viaje.fechaSalida && viaje.tarifa) {
          const fecha = new Date(viaje.fechaSalida)
          let clave, nombrePeriodo
          
          if (selectedPeriod === 'diario') {
            clave = fecha.toISOString().split('T')[0]
            nombrePeriodo = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
          } else if (selectedPeriod === 'semanal') {
            const inicioSemana = new Date(fecha)
            inicioSemana.setDate(fecha.getDate() - fecha.getDay())
            clave = inicioSemana.toISOString().split('T')[0]
            nombrePeriodo = `Sem ${inicioSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
          } else {
            const anio = fecha.getFullYear()
            const mes = fecha.getMonth()
            clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
            nombrePeriodo = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
          }
          
          if (!periodos[clave]) periodos[clave] = { mes: nombrePeriodo, ingresos: 0, gastos: 0, orden: fecha.getTime() }
          periodos[clave].ingresos += parseFloat(viaje.tarifa)
        }
      })
    }

    // Gastos de bitácoras (sumar los conceptos desglosados)
    if (Array.isArray(bitacoras)) {
      bitacoras.forEach(bitacora => {
        if (bitacora.fechaCarga || bitacora.fechaHoraInicio) {
          const fecha = new Date(bitacora.fechaCarga || bitacora.fechaHoraInicio)
          let clave, nombrePeriodo
          
          if (selectedPeriod === 'diario') {
            clave = fecha.toISOString().split('T')[0]
            nombrePeriodo = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
          } else if (selectedPeriod === 'semanal') {
            const inicioSemana = new Date(fecha)
            inicioSemana.setDate(fecha.getDate() - fecha.getDay())
            clave = inicioSemana.toISOString().split('T')[0]
            nombrePeriodo = `Sem ${inicioSemana.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
          } else {
            const anio = fecha.getFullYear()
            const mes = fecha.getMonth()
            clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
            nombrePeriodo = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
          }
          
          if (!periodos[clave]) periodos[clave] = { mes: nombrePeriodo, ingresos: 0, gastos: 0, orden: fecha.getTime() }
          
          // Sumar los gastos desglosados (no usar costoTotal)
          const gastoTotal = (
            parseFloat(bitacora.dieselLitros || 0) +
            parseFloat(bitacora.casetas || 0) +
            parseFloat(bitacora.gastosExtras || 0) +
            parseFloat(bitacora.comisionOperador || 0)
          )
          periodos[clave].gastos += gastoTotal
        }
      })
    }

    // Ordenar por fecha y tomar según el período seleccionado
    const limit = getDataLimit()
    return Object.values(periodos)
      .sort((a, b) => a.orden - b.orden)
      .slice(-limit)
      .map(item => ({
        mes: item.mes,
        ingresos: Math.round(item.ingresos),
        gastos: Math.round(item.gastos),
        utilidad: Math.round(item.ingresos - item.gastos)
      }))
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

  // Procesar datos para gráficos de clientes
  const getViajesPorCliente = () => {
    if (!Array.isArray(viajes) || viajes.length === 0) return []
    
    const clienteViajes = {}
    viajes.forEach(viaje => {
      const clienteNombre = viaje.cliente?.nombreComercial || viaje.cliente?.nombre || 'Sin cliente'
      clienteViajes[clienteNombre] = (clienteViajes[clienteNombre] || 0) + 1
    })
    
    return Object.entries(clienteViajes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  const getIngresosPorCliente = () => {
    if (!Array.isArray(viajes) || viajes.length === 0) return []
    
    const clienteIngresos = {}
    viajes.forEach(viaje => {
      if (viaje.tarifa) {
        const clienteNombre = viaje.cliente?.nombreComercial || viaje.cliente?.nombre || 'Sin cliente'
        clienteIngresos[clienteNombre] = (clienteIngresos[clienteNombre] || 0) + parseFloat(viaje.tarifa)
      }
    })
    
    return Object.entries(clienteIngresos)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }

  // Procesar datos para gráficos de operadores
  const getViajesPorOperador = () => {
    if (!Array.isArray(viajes) || viajes.length === 0) return []
    
    const operadorViajes = {}
    viajes.forEach(viaje => {
      const operadorNombre = viaje.operador?.nombre || 'Sin operador'
      operadorViajes[operadorNombre] = (operadorViajes[operadorNombre] || 0) + 1
    })
    
    return Object.entries(operadorViajes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  const getOperadoresEstatus = () => {
    if (!Array.isArray(operadores) || operadores.length === 0) return []
    
    const estatus = {}
    operadores.forEach(operador => {
      const estado = operador.estatus || 'Disponible'
      estatus[estado] = (estatus[estado] || 0) + 1
    })
    
    return Object.entries(estatus).map(([name, value]) => ({ name, value }))
  }

  // Procesar datos para gráficos de facturas
  const getFacturasPorEstatus = () => {
    if (!Array.isArray(facturas) || facturas.length === 0) return []
    
    const estatus = {}
    facturas.forEach(factura => {
      const estado = factura.estatus || 'PENDIENTE'
      estatus[estado] = (estatus[estado] || 0) + 1
    })
    
    return Object.entries(estatus).map(([name, value]) => ({ name, value }))
  }

  const getFacturasPorMes = () => {
    if (!Array.isArray(facturas) || facturas.length === 0) return []
    
    const meses = {}
    facturas.forEach(factura => {
      if (factura.fechaEmision) {
        const fecha = new Date(factura.fechaEmision)
        const anio = fecha.getFullYear()
        const mes = fecha.getMonth()
        const clave = `${anio}-${String(mes + 1).padStart(2, '0')}`
        const nombreMes = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
        
        if (!meses[clave]) {
          meses[clave] = { mes: nombreMes, monto: 0, cantidad: 0, orden: fecha.getTime() }
        }
        meses[clave].monto += parseFloat(factura.monto || 0)
        meses[clave].cantidad++
      }
    })
    
    return Object.values(meses)
      .sort((a, b) => a.orden - b.orden)
      .slice(-6)
      .map(({ mes, monto, cantidad }) => ({ mes, monto: Math.round(monto), cantidad }))
  }

  // Procesar datos para gráficos de refacciones
  const getRefaccionesPorCategoria = () => {
    if (!Array.isArray(refacciones) || refacciones.length === 0) return []
    
    // Clasificar refacciones por nivel de stock
    const niveles = {
      'Crítico (< 5)': 0,
      'Bajo (5-10)': 0,
      'Normal (11-20)': 0,
      'Suficiente (21-50)': 0,
      'Alto (> 50)': 0
    }
    
    refacciones.forEach(refaccion => {
      const stock = parseFloat(refaccion.stockActual || 0)
      
      if (stock < 5) {
        niveles['Crítico (< 5)']++
      } else if (stock <= 10) {
        niveles['Bajo (5-10)']++
      } else if (stock <= 20) {
        niveles['Normal (11-20)']++
      } else if (stock <= 50) {
        niveles['Suficiente (21-50)']++
      } else {
        niveles['Alto (> 50)']++
      }
    })
    
    return Object.entries(niveles)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0) // Solo mostrar niveles con refacciones
  }

  const getInventarioBajo = () => {
    if (!Array.isArray(refacciones) || refacciones.length === 0) {
      console.log('⚠️ No hay refacciones disponibles')
      return []
    }
    
    const stockBajo = refacciones
      .filter(refaccion => {
        const stockActual = parseFloat(refaccion.stockActual || 0)
        // Stock bajo es cuando tiene menos de 5 unidades
        return stockActual < 5
      })
      .map(refaccion => ({
        nombre: refaccion.nombre || refaccion.descripcion || 'Sin nombre',
        stock: parseFloat(refaccion.stockActual || 0),
        minimo: 5 // Umbral fijo de stock bajo
      }))
      .slice(0, 10)
    
    console.log(`📊 Refacciones con stock bajo (< 5):`, stockBajo.length, stockBajo)
    return stockBajo
  }

  // Calcular estadísticas
  const unidadesArray = Array.isArray(unidades) ? unidades : []
  const clientesArray = Array.isArray(clientes) ? clientes : []
  const operadoresArray = Array.isArray(operadores) ? operadores : []
  const facturasArray = Array.isArray(facturas) ? facturas : []
  const refaccionesArray = Array.isArray(refacciones) ? refacciones : []
  
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
    unidadesInactivas: unidadesArray.filter(u => u.estado === 'INACTIVA').length,
    totalClientes: clientesArray.length,
    totalOperadores: operadoresArray.length,
    operadoresDisponibles: operadoresArray.filter(o => o.estatus === 'Disponible').length,
    facturasPendientes: facturasArray.filter(f => f.estatus === 'PENDIENTE').length,
    totalFacturasPendientes: facturasArray
      .filter(f => f.estatus === 'PENDIENTE')
      .reduce((sum, f) => sum + parseFloat(f.monto || 0), 0),
    refaccionesStockBajo: refaccionesArray.filter(r => 
      parseFloat(r.stockActual || 0) < 5
    ).length
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
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Gráficos</h1>
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
                <option value="diario">Últimos 7 días</option>
                <option value="semanal">Últimas 4 semanas</option>
                <option value="1m">Último mes</option>
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1a">Último año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {canViewStatCard(userRole, 'total-viajes') && (
            <StatCard
              title="Total de viajes"
              value={stats.totalViajes}
              icon={Truck}
              color="bg-blue-600"
              trend={8.5}
            />
          )}
          {canViewStatCard(userRole, 'viajes-activos') && (
            <StatCard
              title="Viajes activos"
              value={stats.viajesActivos}
              icon={Activity}
              color="bg-orange-600"
            />
          )}
          {canViewStatCard(userRole, 'gastos-totales') && (
            <StatCard
              title="Gastos totales"
              value={`$${stats.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
              icon={DollarSign}
              color="bg-red-600"
              trend={-3.2}
            />
          )}
          {canViewStatCard(userRole, 'unidades-activas') && (
            <StatCard
              title="Unidades activas"
              value={`${stats.unidadesActivas}/${stats.totalUnidades}`}
              icon={Truck}
              color="bg-green-600"
            />
          )}
          {canViewStatCard(userRole, 'total-clientes') && (
            <StatCard
              title="Total clientes"
              value={stats.totalClientes}
              icon={Activity}
              color="bg-purple-600"
            />
          )}
          {canViewStatCard(userRole, 'operadores-disponibles') && (
            <StatCard
              title="Operadores disponibles"
              value={`${stats.operadoresDisponibles}/${stats.totalOperadores}`}
              icon={Activity}
              color="bg-cyan-600"
            />
          )}
        </div>

        {/* Segunda fila de stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {canViewStatCard(userRole, 'facturas-pendientes') && (
            <StatCard
              title="Facturas pendientes"
              value={stats.facturasPendientes}
              icon={DollarSign}
              color="bg-yellow-600"
            />
          )}
          {canViewStatCard(userRole, 'monto-por-cobrar') && (
            <StatCard
              title="Monto por cobrar"
              value={`$${stats.totalFacturasPendientes.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
              icon={DollarSign}
              color="bg-amber-600"
            />
          )}
          {canViewStatCard(userRole, 'refacciones-stock-bajo') && (
            <StatCard
              title="Refacciones stock bajo"
              value={stats.refaccionesStockBajo}
              icon={Activity}
              color="bg-rose-600"
            />
          )}
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ingresos vs Gastos */}
          {canViewChart(userRole, 'ingresos-vs-gastos') && (
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
          )}

          {/* Gastos por categoría */}
          {canViewChart(userRole, 'gastos-categoria') && (
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
          )}
        </div>

        {/* Gráficos de viajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Viajes por mes */}
          {canViewChart(userRole, 'viajes-mes') && (
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
          )}

          {/* Viajes por estado */}
          {canViewChart(userRole, 'viajes-estado') && (
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
          )}
        </div>

        {/* Gráficos de unidades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unidades por estado */}
          {canViewChart(userRole, 'unidades-estado') && (
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
          )}

          {/* Kilometraje por unidad */}
          {canViewChart(userRole, 'kilometraje-unidad') && (
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
          )}
        </div>

        {/* Gastos mensuales */}
        {canViewChart(userRole, 'gastos-mensuales') && (
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
        )}

        {/* Gráficos de Clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Viajes por cliente */}
          {canViewChart(userRole, 'viajes-cliente') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Viajes por Cliente</h3>
                <p className="text-sm text-slate-600">Top 10 clientes</p>
              </div>
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getViajesPorCliente()} layout="vertical">
                <defs>
                  <linearGradient id="gradCliente" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="name" stroke="#334155" style={{ fontSize: '10px' }} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} />
                <Bar dataKey="value" name="Viajes" fill="url(#gradCliente)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Ingresos por cliente */}
          {canViewChart(userRole, 'ingresos-cliente') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ingresos por Cliente</h3>
                <p className="text-sm text-slate-600">Top 8 clientes más rentables</p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.primary.map((color, index) => (
                    <linearGradient key={`gradIngCliente${index}`} id={`gradIngCliente${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={getIngresosPorCliente()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {getIngresosPorCliente().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradIngCliente${index % COLORS.primary.length})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  formatter={(value, entry) => (
                    <span style={{ color: '#475569', fontSize: '11px' }}>
                      {value}: ${entry.payload.value.toLocaleString('es-MX')}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Gráficos de Operadores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Viajes por operador */}
          {canViewChart(userRole, 'viajes-operador') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Viajes por Operador</h3>
                <p className="text-sm text-slate-600">Top 10 operadores</p>
              </div>
              <Activity className="h-6 w-6 text-cyan-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getViajesPorOperador()}>
                <defs>
                  <linearGradient id="gradOperador" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
                <Bar dataKey="value" name="Viajes" fill="url(#gradOperador)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Operadores por estatus */}
          {canViewChart(userRole, 'operadores-estatus') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Operadores por Estatus</h3>
                <p className="text-sm text-slate-600">Disponibilidad actual</p>
              </div>
              <Activity className="h-6 w-6 text-cyan-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradDisp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradOcup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradDesc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={getOperadoresEstatus()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getOperadoresEstatus().map((entry, index) => {
                    const fillMap = {
                      'Disponible': 'url(#gradDisp)',
                      'Ocupado': 'url(#gradOcup)',
                      'Descanso': 'url(#gradDesc)'
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
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Gráficos de Facturas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Facturas por estatus */}
          {canViewChart(userRole, 'facturas-estatus') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Facturas por Estatus</h3>
                <p className="text-sm text-slate-600">Estado actual de facturación</p>
              </div>
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradPend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradPag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradCanc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={getFacturasPorEstatus()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getFacturasPorEstatus().map((entry, index) => {
                    const fillMap = {
                      'PENDIENTE': 'url(#gradPend)',
                      'PAGADO': 'url(#gradPag)',
                      'CANCELADO': 'url(#gradCanc)'
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
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Facturas mensuales */}
          {canViewChart(userRole, 'facturas-mensuales') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Facturas Mensuales</h3>
                <p className="text-sm text-slate-600">Monto y cantidad por mes</p>
              </div>
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getFacturasPorMes()}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#334155" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="monto"
                  name="Monto"
                  fill="url(#colorMonto)"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="cantidad"
                  name="Cantidad"
                  fill="url(#colorCantidad)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* Gráficos de Refacciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Refacciones por nivel de stock */}
          {canViewChart(userRole, 'refacciones-categoria') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Refacciones por Nivel de Stock</h3>
                <p className="text-sm text-slate-600">Clasificación por cantidad disponible</p>
              </div>
              <PieChartIcon className="h-6 w-6 text-rose-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {COLORS.primary.map((color, index) => (
                    <linearGradient key={`gradRefCat${index}`} id={`gradRefCat${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={getRefaccionesPorCategoria()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getRefaccionesPorCategoria().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradRefCat${index % COLORS.primary.length})`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: '#475569', fontSize: '12px' }}>
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Inventario bajo */}
          {canViewChart(userRole, 'inventario-bajo') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Inventario Bajo</h3>
                <p className="text-sm text-slate-600">Refacciones con stock bajo</p>
              </div>
              <Activity className="h-6 w-6 text-rose-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getInventarioBajo()} layout="vertical">
                <defs>
                  <linearGradient id="gradStock" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="gradMin" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#334155" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="nombre" stroke="#334155" style={{ fontSize: '10px' }} width={120} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }} />
                <Legend />
                <Bar dataKey="stock" name="Stock Actual" fill="url(#gradStock)" radius={[0, 8, 8, 0]} />
                <Bar dataKey="minimo" name="Stock Mínimo" fill="url(#gradMin)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
