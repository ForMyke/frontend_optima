'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
  BarChart3
} from 'lucide-react'
import { viajesService } from '@/app/services/viajesService'
import { clientsService } from '@/app/services/clientsService'
import { unidadesService } from '@/app/services/unidadesService'
import { bitacoraService } from '@/app/services/bitacoraService'
import { authService } from '@/app/services/authService'
import { canViewDashboardElement } from '@/config/permissions'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const StatCard = ({ title, value, change, changeType, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <p className="text-xs lg:text-sm font-medium text-slate-600">{title}</p>
          <div className={`p-1.5 lg:p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
          </div>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-slate-500 mb-2">{description}</p>
        )}
        {change && (
          <div className={`flex items-center ${changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
            }`}>
            {changeType === 'positive' ? (
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
            )}
            <span className="text-xs lg:text-sm font-medium">{change}</span>
            <span className="text-xs text-slate-500 ml-1 hidden sm:inline">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  </div>
)

const RecentTrips = ({ trips }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'COMPLETADO':
        return { color: 'bg-emerald-500', label: 'Completado' }
      case 'EN_CURSO':
        return { color: 'bg-blue-600', label: 'En Curso' }
      case 'PENDIENTE':
        return { color: 'bg-amber-500', label: 'Pendiente' }
      case 'CANCELADO':
        return { color: 'bg-red-500', label: 'Cancelado' }
      default:
        return { color: 'bg-slate-400', label: status }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base lg:text-lg font-semibold text-slate-900">Viajes Recientes</h3>
          <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
        </div>
      </div>
      <div className="p-4 lg:p-6">
        {trips.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay viajes registrados aún</p>
          </div>
        ) : (
          <div className="space-y-3 lg:space-y-4">
            {trips.map((trip) => {
              const statusConfig = getStatusConfig(trip.status)
              return (
                <div key={trip.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors gap-2 sm:gap-4">
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full shrink-0 ${statusConfig.color}`}></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm lg:text-base">{trip.tripNumber}</p>
                      <p className="text-xs lg:text-sm text-slate-600 truncate">{trip.origin} → {trip.destination}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right pl-5 sm:pl-0">
                    <p className="text-xs lg:text-sm font-medium text-slate-900">{trip.client}</p>
                    <p className="text-xs text-slate-500">{trip.date}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const TasksWidget = ({ tasks }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
    <div className="p-4 lg:p-6 border-b border-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900">Alertas y Tareas</h3>
        <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
      </div>
    </div>
    <div className="p-4 lg:p-6">
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">¡Todo en orden!</p>
          <p className="text-slate-400 text-xs mt-1">No hay alertas pendientes</p>
        </div>
      ) : (
        <div className="space-y-2 lg:space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-2 lg:space-x-3 p-2.5 lg:p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 lg:mt-2 shrink-0 ${task.priority === 'high' ? 'bg-red-500' :
                task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-600 mt-1">{task.description}</p>
              </div>
              <div className="text-xs text-slate-400 whitespace-nowrap">
                {task.dueDate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)

const QuickActions = ({ userRole }) => {
  const router = useRouter()

  const actions = [
    {
      id: 'action-nuevo-viaje',
      onClick: () => router.push('/dashboard/viajes'),
      icon: Truck,
      label: 'Nuevo viaje',
      color: 'bg-slate-600 hover:bg-slate-700'
    },
    {
      id: 'action-bitacora',
      onClick: () => router.push('/dashboard/bitacora'),
      icon: FileText,
      label: 'Bitácora',
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'action-nuevo-cliente',
      onClick: () => router.push('/dashboard/clientes'),
      icon: Users,
      label: 'Nuevo cliente',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'action-ver-reportes',
      onClick: () => router.push('/dashboard/graficos'),
      icon: BarChart3,
      label: 'Ver reportes',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  const allowedActions = actions.filter(action => canViewDashboardElement(userRole, action.id))

  if (allowedActions.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <h3 className="text-base lg:text-lg font-semibold text-slate-900">Acciones Rápidas</h3>
      </div>
      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          {allowedActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`p-3 lg:p-4 ${action.color} text-white rounded-lg transition-colors text-center`}
            >
              <action.icon className="h-5 w-5 lg:h-6 lg:w-6 mx-auto mb-1 lg:mb-2" />
              <span className="text-xs lg:text-sm font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const router = useRouter()
  const [userRole, setUserRole] = useState(null)
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    pendingTrips: 0,
    cancelledTrips: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    vehiclesActive: 0,
    vehiclesMaintenance: 0,
    vehiclesOutOfService: 0,
    totalVehicles: 0
  })

  const [recentTrips, setRecentTrips] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener el rol del usuario
    const user = authService.getUser()
    if (user?.rol) {
      setUserRole(user.rol)
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Cargar viajes
      const viajesResponse = await viajesService.getViajes(0, 100)
      const viajes = viajesResponse.content || viajesResponse || []

      // Cargar clientes
      const clientesResponse = await clientsService.getClients()
      const clientes = clientesResponse.content || clientesResponse || []

      // Cargar unidades - traer todas para estadísticas correctas
      // Primero obtenemos la primera página para saber el total y luego cargamos todo si es necesario
      const unidadesResponse = await unidadesService.getAll({ page: 0, size: 1000 })
      const unidades = unidadesResponse.content || unidadesResponse || []
      const totalUnidades = unidadesResponse.totalElements || unidades.length

      // Cargar bitácoras para calcular ingresos
      let bitacoras = []
      try {
        const bitacoraResponse = await bitacoraService.getAll()
        bitacoras = bitacoraResponse.content || bitacoraResponse || []
      } catch (error) {
        console.error('Error cargando bitácoras:', error)
      }

      // Calcular estadísticas de viajes
      const viajesActivos = viajes.filter(v => v.estado === 'EN_CURSO').length
      const viajesCompletados = viajes.filter(v => v.estado === 'COMPLETADO').length
      const viajesPendientes = viajes.filter(v => v.estado === 'PENDIENTE').length
      const viajesCancelados = viajes.filter(v => v.estado === 'CANCELADO').length

      // Calcular ingresos y gastos del mes actual
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      // Filtrar bitácoras del mes actual
      const bitacorasDelMes = bitacoras.filter(b => {
        if (!b.fechaCarga && !b.fechaHoraInicio) return false
        const fecha = new Date(b.fechaCarga || b.fechaHoraInicio)
        return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear
      })

      // Calcular ingresos brutos del mes (costoTotal de bitácoras)
      const ingresosBrutosMes = bitacorasDelMes.reduce((sum, b) =>
        sum + (parseFloat(b.costoTotal) || 0), 0
      )

      // Calcular gastos del mes (casetas + diesel + comisión + extras)
      const gastosMes = bitacorasDelMes.reduce((sum, b) => {
        return sum + (
          parseFloat(b.casetas || 0) +
          parseFloat(b.dieselLitros || 0) +
          parseFloat(b.comisionOperador || 0) +
          parseFloat(b.gastosExtras || 0)
        )
      }, 0)

      // Calcular ingresos netos (costoTotal - gastos)
      const ingresosMes = ingresosBrutosMes - gastosMes

      // Estadísticas de unidades
      // Estados posibles según la API: ACTIVA, MANTENIMIENTO, INACTIVA, FUERA_DE_SERVICIO
      const unidadesActivas = unidades.filter(u =>
        u.estado === 'ACTIVA' || u.estado === 'ACTIVO' || u.estado === 'DISPONIBLE'
      ).length
      const unidadesMantenimiento = unidades.filter(u =>
        u.estado === 'MANTENIMIENTO' || u.estado === 'EN_MANTENIMIENTO'
      ).length
      const unidadesFueraServicio = unidades.filter(u =>
        u.estado === 'FUERA_DE_SERVICIO' || u.estado === 'INACTIVA' || u.estado === 'INACTIVO'
      ).length

      setStats({
        totalTrips: viajes.length,
        activeTrips: viajesActivos,
        completedTrips: viajesCompletados,
        pendingTrips: viajesPendientes,
        cancelledTrips: viajesCancelados,
        totalClients: clientes.length,
        monthlyRevenue: ingresosMes,
        monthlyExpenses: gastosMes,
        vehiclesActive: unidadesActivas,
        vehiclesMaintenance: unidadesMantenimiento,
        vehiclesOutOfService: unidadesFueraServicio,
        totalVehicles: totalUnidades
      })

      // Preparar viajes recientes (últimos 5)
      const viajesOrdenados = [...viajes]
        .sort((a, b) => {
          const fechaA = new Date(a.fechaSalida || 0)
          const fechaB = new Date(b.fechaSalida || 0)
          return fechaB - fechaA
        })
        .slice(0, 5)

      const viajesFormateados = viajesOrdenados.map(v => {
        // El cliente ya viene en el objeto viaje
        const clienteNombre = v.cliente?.nombre || 'Cliente no encontrado'
        const fecha = v.fechaSalida ? new Date(v.fechaSalida).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : 'Sin fecha'

        return {
          id: v.id,
          tripNumber: v.folio || `VJ-${String(v.id).padStart(6, '0')}`,
          origin: v.origen || 'N/A',
          destination: v.destino || 'N/A',
          status: v.estado || 'PENDIENTE',
          client: clienteNombre,
          date: fecha
        }
      })

      setRecentTrips(viajesFormateados)

      // Generar tareas/alertas basadas en datos reales
      const tareasGeneradas = []

      // Alertas de viajes pendientes
      if (viajesPendientes > 0) {
        tareasGeneradas.push({
          id: 1,
          title: `${viajesPendientes} viaje${viajesPendientes > 1 ? 's' : ''} pendiente${viajesPendientes > 1 ? 's' : ''}`,
          description: 'Requieren asignación de operador y unidad',
          priority: viajesPendientes > 5 ? 'high' : 'medium',
          dueDate: 'Hoy'
        })
      }

      // Alertas de unidades en mantenimiento
      if (unidadesMantenimiento > 0) {
        tareasGeneradas.push({
          id: 2,
          title: `${unidadesMantenimiento} unidad${unidadesMantenimiento > 1 ? 'es' : ''} en mantenimiento`,
          description: 'Verificar progreso de reparaciones',
          priority: 'medium',
          dueDate: 'Esta semana'
        })
      }

      // Alertas de viajes activos
      if (viajesActivos > 0) {
        tareasGeneradas.push({
          id: 3,
          title: `${viajesActivos} viaje${viajesActivos > 1 ? 's' : ''} en curso`,
          description: 'Monitorear entregas y tiempos estimados',
          priority: 'low',
          dueDate: 'En seguimiento'
        })
      }

      // Alerta de bitácoras pendientes
      const bitacorasPendientes = viajes.filter(v =>
        v.estado === 'COMPLETADO' &&
        !bitacoras.some(b => b.viajeId === v.id)
      ).length

      if (bitacorasPendientes > 0) {
        tareasGeneradas.push({
          id: 4,
          title: `${bitacorasPendientes} bitácora${bitacorasPendientes > 1 ? 's' : ''} pendiente${bitacorasPendientes > 1 ? 's' : ''}`,
          description: 'Viajes completados sin registro de gastos',
          priority: 'high',
          dueDate: 'Urgente'
        })
      }

      setTasks(tareasGeneradas.slice(0, 5)) // Máximo 5 tareas

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
      toast.error('Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
        <div className="mb-6 lg:mb-8">
          <div className="h-8 bg-slate-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-28 lg:h-32 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-200 h-48 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Calcular cambios porcentuales (mock - podrías implementar lógica real comparando con mes anterior)
  const calculateChange = (current, previous = 0) => {
    if (previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      type: change > 0 ? 'positive' : 'negative'
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-sm lg:text-base text-slate-600 mt-1 lg:mt-2">
          Resumen ejecutivo de operaciones - {new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {canViewDashboardElement(userRole, 'stat-viajes-activos') && (
          <StatCard
            title="Viajes Activos"
            value={stats.activeTrips}
            change={stats.activeTrips > 0 ? `${stats.activeTrips} en ruta` : 'Sin viajes activos'}
            changeType="positive"
            icon={Truck}
            color="bg-blue-600"
            description="En curso actualmente"
          />
        )}
        {canViewDashboardElement(userRole, 'stat-viajes-completados') && (
          <StatCard
            title="Viajes Completados"
            value={stats.completedTrips}
            icon={CheckCircle}
            color="bg-green-600"
            description={`De ${stats.totalTrips} totales`}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {canViewDashboardElement(userRole, 'widget-estado-viajes') && (
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">Estado de Viajes</h3>
              <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
            </div>
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">En Curso</span>
                <span className="text-xs lg:text-sm font-semibold text-blue-600">{stats.activeTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">Completados</span>
                <span className="text-xs lg:text-sm font-semibold text-emerald-600">{stats.completedTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">Pendientes</span>
                <span className="text-xs lg:text-sm font-semibold text-amber-600">{stats.pendingTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">Cancelados</span>
                <span className="text-xs lg:text-sm font-semibold text-red-600">{stats.cancelledTrips}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs lg:text-sm text-slate-600 font-medium">Total</span>
                <span className="text-xs lg:text-sm font-bold text-slate-900">{stats.totalTrips}</span>
              </div>
            </div>
          </div>
        )}

        {canViewDashboardElement(userRole, 'widget-flota-vehicular') && (
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">Flota Vehicular</h3>
              <Truck className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400" />
            </div>
            <div className="space-y-2 lg:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">Activos</span>
                <span className="text-xs lg:text-sm font-semibold text-emerald-600">{stats.vehiclesActive}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">En Mantenimiento</span>
                <span className="text-xs lg:text-sm font-semibold text-amber-600">{stats.vehiclesMaintenance}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs lg:text-sm text-slate-600">Fuera de Servicio</span>
                <span className="text-xs lg:text-sm font-semibold text-red-600">{stats.vehiclesOutOfService}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-xs lg:text-sm text-slate-600 font-medium">Total</span>
                <span className="text-xs lg:text-sm font-bold text-slate-900">
                  {stats.totalVehicles}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="md:col-span-2 lg:col-span-1">
          <QuickActions userRole={userRole} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {canViewDashboardElement(userRole, 'widget-viajes-recientes') && (
          <div className="lg:col-span-2">
            <RecentTrips trips={recentTrips} />
          </div>
        )}
        {canViewDashboardElement(userRole, 'widget-alertas-tareas') && (
          <div className={!canViewDashboardElement(userRole, 'widget-viajes-recientes') ? 'lg:col-span-3' : ''}>
            <TasksWidget tasks={tasks} />
          </div>
        )}
      </div>
    </div>
  )
}
export default Dashboard;