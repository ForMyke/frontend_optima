'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
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
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'
import { viajesService } from '@/app/services/viajesService'
import { bitacoraService } from '@/app/services/bitacoraService'
import { unidadesService } from '@/app/services/unidadesService'
import { clientsService } from '@/app/services/clientsService'
import { operadoresService } from '@/app/services/operadoresService'
import { facturaService } from '@/app/services/facturaService'
import { refaccionesService } from '@/app/services/refaccionesService'
import gastosService from '@/app/services/gastosService'
import { authService } from '@/app/services/authService'
import { canViewChart, canViewStatCard } from '@/config/permissions'

const COLORS = {
  primary: [
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
    '#10b981'
  ],
  status: {
    PENDIENTE: '#f59e0b',
    EN_CURSO: '#3b82f6',
    COMPLETADO: '#10b981',
    CANCELADO: '#ef4444',
    RECHAZADO: '#dc2626'
  },
  estado: {
    ACTIVA: '#10b981',
    MANTENIMIENTO: '#f59e0b',
    INACTIVA: '#ef4444'
  }
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend
}) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs lg:text-sm font-medium text-slate-600">
        {title}
      </p>

      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
      </div>
    </div>

    <p className="text-2xl lg:text-3xl font-bold text-slate-900">
      {value}
    </p>

    {trend && (
      <p
        className={`text-xs mt-2 flex items-center ${
          trend > 0
            ? 'text-green-600'
            : 'text-red-600'
        }`}
      >
        <TrendingUp
          className={`h-3 w-3 mr-1 ${
            trend < 0 ? 'rotate-180' : ''
          }`}
        />

        {Math.abs(trend)}% vs mes anterior
      </p>
    )}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
      {label && (
        <p className="font-bold text-slate-900 mb-1">
          {label}
        </p>
      )}

      {payload.map((entry, index) => {
        const valor = entry?.value ?? 0

        return (
          <p
            key={index}
            className="text-sm font-semibold"
            style={{
              color: entry?.color || '#334155'
            }}
          >
            {entry?.name || 'Valor'}:{' '}
            {typeof valor === 'number'
              ? valor.toLocaleString('es-MX', {
                  minimumFractionDigits: 0
                })
              : valor}
          </p>
        )
      })}
    </div>
  )
}

const CustomMoneyTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
      {label && (
        <p className="font-bold text-slate-900 mb-1">
          {label}
        </p>
      )}

      {payload.map((entry, index) => {
        const valor = Number(entry?.value ?? 0)

        return (
          <p
            key={index}
            className="text-sm font-semibold"
            style={{
              color: entry?.color || '#334155'
            }}
          >
            {entry?.name || 'Valor'}:{' '}
            {valor.toLocaleString('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 2
            })}
          </p>
        )
      })}
    </div>
  )
}

const formatMoney = (value) => {
  return Number(value ?? 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  })
}

export default function GraficosPage() {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [viajes, setViajes] = useState([])
  const [bitacoras, setBitacoras] = useState([])
  const [unidades, setUnidades] = useState([])
  const [clientes, setClientes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [facturas, setFacturas] = useState([])
  const [refacciones, setRefacciones] = useState([])
  const [gastosSemanales, setGastosSemanales] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [selectedPeriod, setSelectedPeriod] =
    useState('semanal')

  const [userRole, setUserRole] =
    useState(null)

  // =========================================================
  // CARGA DE DATOS
  // =========================================================

  useEffect(() => {
    const user = authService.getUser()

    if (user?.rol) {
      setUserRole(user.rol)
    }

    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)

    try {
      const [
        viajesData,
        bitacorasData,
        unidadesData,
        clientesData,
        operadoresData,
        facturasData,
        refaccionesData,
        gastosSemanalesData
      ] = await Promise.all([
        viajesService
          .getViajes(0, 1000)
          .catch(() => ({
            content: []
          })),

        bitacoraService
          .getAll()
          .catch(() => ({
            content: []
          })),

        unidadesService
          .getAll()
          .catch(() => ({
            content: []
          })),

        clientsService
          .getClients(0, 1000)
          .catch(() => ({
            content: []
          })),

        operadoresService
          .getOperadores(0, 1000)
          .catch(() => ({
            content: []
          })),

        facturaService
          .getFacturas(0, 1000)
          .catch(() => ({
            content: []
          })),

        refaccionesService
          .getRefacciones(0, 1000)
          .catch(() => ({
            content: []
          })),

        gastosService
          .getGastosSemanales(0, 1000)
          .catch(() => ({
            content: []
          }))
      ])

      setViajes(
        Array.isArray(viajesData?.content)
          ? viajesData.content
          : Array.isArray(viajesData)
            ? viajesData
            : []
      )

      setBitacoras(
        Array.isArray(bitacorasData?.content)
          ? bitacorasData.content
          : Array.isArray(bitacorasData)
            ? bitacorasData
            : []
      )

      setUnidades(
        Array.isArray(unidadesData?.content)
          ? unidadesData.content
          : Array.isArray(unidadesData)
            ? unidadesData
            : []
      )

      setClientes(
        Array.isArray(clientesData?.content)
          ? clientesData.content
          : Array.isArray(clientesData)
            ? clientesData
            : []
      )

      setOperadores(
        Array.isArray(operadoresData?.content)
          ? operadoresData.content
          : Array.isArray(operadoresData)
            ? operadoresData
            : []
      )

      setFacturas(
        Array.isArray(facturasData?.content)
          ? facturasData.content
          : Array.isArray(facturasData)
            ? facturasData
            : []
      )

      setRefacciones(
        Array.isArray(refaccionesData?.content)
          ? refaccionesData.content
          : Array.isArray(refaccionesData)
            ? refaccionesData
            : []
      )

      setGastosSemanales(
        Array.isArray(
          gastosSemanalesData?.content
        )
          ? gastosSemanalesData.content
          : Array.isArray(
                gastosSemanalesData
              )
            ? gastosSemanalesData
            : []
      )

    } catch (error) {
      console.error(
        'Error al cargar datos:',
        error
      )

      toast.error(
        'Error al cargar los datos'
      )

    } finally {
      setIsLoading(false)
    }
  }

  // =========================================================
  // HELPERS GENERALES
  // =========================================================

  const toNumber = (value) => {
    const number = Number(value)

    return Number.isFinite(number)
      ? number
      : 0
  }

  const parseDateLocal = (dateValue) => {
    if (!dateValue) return null

    if (dateValue instanceof Date) {
      return Number.isNaN(
        dateValue.getTime()
      )
        ? null
        : new Date(dateValue)
    }

    const text = String(dateValue)

    const fecha = text.includes('T')
      ? new Date(text)
      : new Date(
          `${text}T12:00:00`
        )

    return Number.isNaN(
      fecha.getTime()
    )
      ? null
      : fecha
  }

  const getInicioDia = (
    date = new Date()
  ) => {
    const d = new Date(date)

    d.setHours(
      0,
      0,
      0,
      0
    )

    return d
  }

  const getFinDia = (
    date = new Date()
  ) => {
    const d = new Date(date)

    d.setHours(
      23,
      59,
      59,
      999
    )

    return d
  }

  // =========================================================
  // SEMANA OPERATIVA
  // VIERNES -> JUEVES
  // =========================================================

  const getSemanaOperativaActual = () => {
    const hoy = new Date()

    const inicio =
      getInicioDia(hoy)

    /*
      Domingo = 0
      Lunes = 1
      Martes = 2
      Miércoles = 3
      Jueves = 4
      Viernes = 5
      Sábado = 6
    */

    const dia =
      inicio.getDay()

    const diasDesdeViernes =
      dia >= 5
        ? dia - 5
        : dia + 2

    inicio.setDate(
      inicio.getDate() -
        diasDesdeViernes
    )

    const fin =
      getFinDia(inicio)

    fin.setDate(
      inicio.getDate() + 6
    )

    return {
      inicio,
      fin
    }
  }

  // =========================================================
  // MES ACTUAL
  // DÍA 1 -> HOY
  // =========================================================

  const getMesActualAcumulado = () => {
    const hoy =
      new Date()

    const inicio =
      getInicioDia(
        new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          1
        )
      )

    const fin =
      getFinDia(hoy)

    return {
      inicio,
      fin,
      diasTranscurridos:
        hoy.getDate()
    }
  }

  // =========================================================
  // RANGO GENERAL DEL SELECTOR
  //
  // LO UTILIZAN TODAS LAS GRÁFICAS,
  // EXCEPTO RENTABILIDAD POR UNIDAD
  // =========================================================

  const getRangoSeleccionado = () => {

    if (
      selectedPeriod ===
      'semanal'
    ) {
      const semana =
        getSemanaOperativaActual()

      return {
        inicio:
          semana.inicio,

        fin:
          semana.fin,

        nombre:
          'Semana actual'
      }
    }

    const mes =
      getMesActualAcumulado()

    return {
      inicio:
        mes.inicio,

      fin:
        mes.fin,

      nombre:
        'Mes actual'
    }
  }

  const fechaEstaEnRango = (
    fechaValue,
    inicio,
    fin
  ) => {
    const fecha =
      parseDateLocal(
        fechaValue
      )

    if (!fecha) {
      return false
    }

    return (
      fecha >= inicio &&
      fecha <= fin
    )
  }

  const formatFechaCorta = (
    date
  ) => {
    if (!date) {
      return 'N/A'
    }

    return date.toLocaleDateString(
      'es-MX',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    )
  }

  const getDescripcionPeriodoSeleccionado =
    () => {

      const {
        inicio,
        fin
      } =
        getRangoSeleccionado()

      if (
        selectedPeriod ===
        'semanal'
      ) {
        return `Semana actual · Viernes a jueves (${formatFechaCorta(
          inicio
        )} - ${formatFechaCorta(
          fin
        )})`
      }

      return `Mes actual acumulado (${formatFechaCorta(
        inicio
      )} - ${formatFechaCorta(
        fin
      )})`
    }

  // =========================================================
  // VIAJES DEL PERIODO
  // =========================================================

  const getFechaViaje = (
    viaje
  ) => {
    return (
      viaje.fechaSalida ??
      viaje.fecha_salida ??
      viaje.fechaViaje ??
      viaje.fecha ??
      null
    )
  }

  const getViajesPeriodoSeleccionado =
    () => {

      const {
        inicio,
        fin
      } =
        getRangoSeleccionado()

      return viajes.filter(
        (viaje) =>
          fechaEstaEnRango(
            getFechaViaje(
              viaje
            ),
            inicio,
            fin
          )
      )
    }

  // =========================================================
  // BITÁCORAS DEL PERIODO
  // =========================================================

  const getBitacorasPeriodoSeleccionado =
    () => {

      const {
        inicio,
        fin
      } =
        getRangoSeleccionado()

      return bitacoras.filter(
        (bitacora) => {

          const fecha =
            bitacora.fechaCarga ??
            bitacora.fechaHoraInicio ??
            bitacora.fecha ??
            null

          return fechaEstaEnRango(
            fecha,
            inicio,
            fin
          )
        }
      )
    }

  // =========================================================
  // FACTURAS DEL PERIODO
  // =========================================================

  const getFacturasPeriodoSeleccionado =
    () => {

      const {
        inicio,
        fin
      } =
        getRangoSeleccionado()

      return facturas.filter(
        (factura) => {

          const fecha =
            factura.fechaEmision ??
            factura.fecha_emision ??
            factura.fecha ??
            null

          return fechaEstaEnRango(
            fecha,
            inicio,
            fin
          )
        }
      )
    }

  // =========================================================
  // GASTOS DEL PERIODO
  // =========================================================

  const getGastosPeriodoSeleccionado =
    () => {

      const {
        inicio,
        fin
      } =
        getRangoSeleccionado()

      return gastosSemanales.filter(
        (gasto) => {

          const fechaInicio =
            parseDateLocal(
              gasto.semanaInicio ??
              gasto.fechaInicio ??
              gasto.fecha_inicio ??
              gasto.fecha ??
              null
            )

          if (!fechaInicio) {
            return false
          }

          const fechaFin =
            parseDateLocal(
              gasto.semanaFin ??
              gasto.fechaFin ??
              gasto.fecha_fin ??
              gasto.semanaInicio ??
              gasto.fechaInicio ??
              gasto.fecha_inicio ??
              gasto.fecha ??
              null
            )

          if (!fechaFin) {
            return (
              fechaInicio >=
                inicio &&
              fechaInicio <= fin
            )
          }

          /*
            Detectamos si el rango
            del gasto se cruza con
            el periodo seleccionado.
          */

          return (
            fechaInicio <= fin &&
            fechaFin >= inicio
          )
        }
      )
    }

  const getTotalGastoRegistro = (
    gasto
  ) => {
    return (
      toNumber(
        gasto.diesel
      ) +

      toNumber(
        gasto.iave ??
        gasto.casetas
      ) +

      toNumber(
        gasto.nomina
      ) +

      toNumber(
        gasto.gastosExtras ??
        gasto.gastos_extras
      )
    )
  }

  const getTotalBitacora = (
    bitacora
  ) => {
    return (
      toNumber(
        bitacora.dieselLitros ??
        bitacora.diesel_litros
      ) +

      toNumber(
        bitacora.casetas ??
        bitacora.iave
      ) +

      toNumber(
        bitacora.gastosExtras ??
        bitacora.gastos_extras
      ) +

      toNumber(
        bitacora.comisionOperador ??
        bitacora.comision_operador
      )
    )
  }

  // =========================================================
  // =========================================================
  // RENTABILIDAD POR UNIDAD
  //
  // ESTA SECCIÓN NO OBEDECE
  // EL SELECTOR GENERAL.
  //
  // TIENE:
  // - SEMANA VIERNES -> JUEVES
  // - MES DÍA 1 -> HOY
  // =========================================================
  // =========================================================

  const getGastoDirectoViaje = (
    viaje
  ) => {

    const diesel =
      toNumber(
        viaje.dieselLitros ??
        viaje.diesel_litros ??
        viaje.diesel ??
        0
      )

    const casetas =
      toNumber(
        viaje.casetas ??
        viaje.iave ??
        viaje.casetasIave ??
        0
      )

    const comision =
      toNumber(
        viaje.comisionOperador ??
        viaje.comision_operador ??
        viaje.comision ??
        0
      )

    const gastosExtras =
      toNumber(
        viaje.gastosExtras ??
        viaje.gastos_extras ??
        0
      )

    return (
      diesel +
      casetas +
      comision +
      gastosExtras
    )
  }

  const viajeEstaEnRango = (
    viaje,
    inicio,
    fin
  ) => {

    return fechaEstaEnRango(
      getFechaViaje(viaje),
      inicio,
      fin
    )
  }

  const getUnidadIdFromViaje = (
    viaje
  ) => {
    return (
      viaje.unidadId ??
      viaje.unidad?.id ??
      viaje.unidad_id ??
      viaje.idUnidad ??
      viaje.id_unidad ??
      null
    )
  }

  const getUnidadNombreFromViaje =
    (viaje) => {

      return (
        viaje.unidad
          ?.numeroEconomico ??

        viaje.unidad
          ?.numero_economico ??

        viaje
          .numeroEconomicoUnidad ??

        viaje
          .numero_economico_unidad ??

        viaje.unidad
          ?.placas ??

        viaje.unidadPlacas ??

        viaje.placasUnidad ??

        'Sin unidad'
      )
    }

  const getUnidadNombre = (
    unidad
  ) => {
    return (
      unidad.numeroEconomico ??
      unidad.numero_economico ??
      unidad.placas ??
      unidad.nombre ??
      `Unidad #${unidad.id}`
    )
  }

  const getRentabilidadUnidades = (
    inicio,
    fin
  ) => {

    const unidadesMap = {}

    /*
      Primero metemos todas
      las unidades.

      Así también aparecen
      unidades con cero viajes.
    */

    unidades.forEach(
      (unidad) => {

        const unidadId =
          unidad.id

        const unidadNombre =
          getUnidadNombre(
            unidad
          )

        unidadesMap[
          String(unidadId)
        ] = {
          unidadId,

          unidad:
            unidadNombre,

          ingresos: 0,

          gastosViajes: 0,

          numeroViajes: 0
        }
      }
    )

    /*
      Ahora revisamos
      todos los viajes.
    */

    viajes.forEach(
      (viaje) => {

        if (
          !viajeEstaEnRango(
            viaje,
            inicio,
            fin
          )
        ) {
          return
        }

        const unidadId =
          getUnidadIdFromViaje(
            viaje
          )

        const unidadNombre =
          getUnidadNombreFromViaje(
            viaje
          )

        const key =
          unidadId !== null &&
          unidadId !== undefined
            ? String(
                unidadId
              )
            : unidadNombre

        if (
          !unidadesMap[key]
        ) {
          unidadesMap[key] = {
            unidadId,

            unidad:
              unidadNombre,

            ingresos: 0,

            gastosViajes: 0,

            numeroViajes: 0
          }
        }

        /*
          INGRESO DE LA UNIDAD
        */

        unidadesMap[
          key
        ].ingresos +=
          toNumber(
            viaje.tarifa
          )

        /*
          GASTOS DE LOS VIAJES
          DE LA UNIDAD
        */

        unidadesMap[
          key
        ].gastosViajes +=
          getGastoDirectoViaje(
            viaje
          )

        unidadesMap[
          key
        ].numeroViajes += 1
      }
    )

    return Object.values(
      unidadesMap
    )
      .map((item) => {

        const gastos =
          item.gastosViajes

        const utilidad =
          item.ingresos -
          gastos

        return {
          unidadId:
            item.unidadId,

          unidad:
            item.unidad,

          ingresos:
            Math.round(
              item.ingresos
            ),

          gastos:
            Math.round(
              gastos
            ),

          utilidad:
            Math.round(
              utilidad
            ),

          numeroViajes:
            item.numeroViajes
        }
      })

      .sort(
        (a, b) =>
          b.utilidad -
          a.utilidad
      )
  }

  const getRentabilidadMensualUnidades =
    () => {

      const mes =
        getMesActualAcumulado()

      return getRentabilidadUnidades(
        mes.inicio,
        mes.fin
      )
    }

  const getRentabilidadSemanalUnidades =
    () => {

      const semana =
        getSemanaOperativaActual()

      return getRentabilidadUnidades(
        semana.inicio,
        semana.fin
      )
    }

  const getAlturaGraficaUnidades = (
    data = []
  ) => {

    const cantidad =
      Array.isArray(data)
        ? data.length
        : 0

    return Math.max(
      380,
      cantidad * 62 + 120
    )
  }

  // =========================================================
  // VIAJES DEL PERIODO
  // OBEDECE SELECTOR
  // =========================================================

  const getViajesPorPeriodo =
    () => {

      const viajesPeriodo =
        getViajesPeriodoSeleccionado()

      if (
        viajesPeriodo.length ===
        0
      ) {
        return []
      }

      const dias = {}

      viajesPeriodo.forEach(
        (viaje) => {

          const fecha =
            parseDateLocal(
              getFechaViaje(
                viaje
              )
            )

          if (!fecha) {
            return
          }

          const clave =
            `${fecha.getFullYear()}-${String(
              fecha.getMonth() + 1
            ).padStart(
              2,
              '0'
            )}-${String(
              fecha.getDate()
            ).padStart(
              2,
              '0'
            )}`

          const nombre =
            fecha.toLocaleDateString(
              'es-MX',
              {
                day: '2-digit',
                month: 'short'
              }
            )

          if (!dias[clave]) {
            dias[clave] = {
              periodo:
                nombre,

              cantidad: 0,

              orden:
                fecha.getTime()
            }
          }

          dias[
            clave
          ].cantidad += 1
        }
      )

      return Object.values(
        dias
      )
        .sort(
          (a, b) =>
            a.orden -
            b.orden
        )

        .map(
          ({
            periodo,
            cantidad
          }) => ({
            periodo,
            cantidad
          })
        )
    }

  // =========================================================
  // GASTOS DEL PERIODO
  // OBEDECE SELECTOR
  // =========================================================

  const getGastosPorPeriodo =
    () => {

      const gastosPeriodo =
        getGastosPeriodoSeleccionado()

      /*
        Primero intentamos usar
        gastos registrados.
      */

      if (
        gastosPeriodo.length >
        0
      ) {
        const periodos = {}

        gastosPeriodo.forEach(
          (gasto) => {

            const fechaInicio =
              parseDateLocal(
                gasto.semanaInicio ??
                gasto.fechaInicio ??
                gasto.fecha_inicio ??
                gasto.fecha
              )

            const fechaFin =
              parseDateLocal(
                gasto.semanaFin ??
                gasto.fechaFin ??
                gasto.fecha_fin ??
                gasto.semanaInicio ??
                gasto.fechaInicio ??
                gasto.fecha_inicio ??
                gasto.fecha
              )

            if (!fechaInicio) {
              return
            }

            const clave =
              `${fechaInicio.getFullYear()}-${String(
                fechaInicio.getMonth() +
                  1
              ).padStart(
                2,
                '0'
              )}-${String(
                fechaInicio.getDate()
              ).padStart(
                2,
                '0'
              )}`

            const inicioTexto =
              fechaInicio.toLocaleDateString(
                'es-MX',
                {
                  day: '2-digit',
                  month: 'short'
                }
              )

            const finTexto =
              fechaFin
                ? fechaFin.toLocaleDateString(
                    'es-MX',
                    {
                      day:
                        '2-digit',
                      month:
                        'short'
                    }
                  )
                : inicioTexto

            const nombrePeriodo =
              fechaFin &&
              fechaFin.toDateString() !==
                fechaInicio.toDateString()
                ? `${inicioTexto} - ${finTexto}`
                : inicioTexto

            if (
              !periodos[clave]
            ) {
              periodos[clave] = {
                periodo:
                  nombrePeriodo,

                total: 0,

                orden:
                  fechaInicio.getTime()
              }
            }

            periodos[
              clave
            ].total +=
              getTotalGastoRegistro(
                gasto
              )
          }
        )

        return Object.values(
          periodos
        )
          .sort(
            (a, b) =>
              a.orden -
              b.orden
          )

          .map(
            ({
              periodo,
              total
            }) => ({
              periodo,

              total:
                Math.round(
                  total
                )
            })
          )
      }

      /*
        Si no existen gastos
        registrados, usamos
        bitácoras.
      */

      const bitacorasPeriodo =
        getBitacorasPeriodoSeleccionado()

      if (
        bitacorasPeriodo.length ===
        0
      ) {
        return []
      }

      const dias = {}

      bitacorasPeriodo.forEach(
        (bitacora) => {

          const fecha =
            parseDateLocal(
              bitacora.fechaCarga ??
              bitacora.fechaHoraInicio ??
              bitacora.fecha
            )

          if (!fecha) {
            return
          }

          const clave =
            `${fecha.getFullYear()}-${String(
              fecha.getMonth() + 1
            ).padStart(
              2,
              '0'
            )}-${String(
              fecha.getDate()
            ).padStart(
              2,
              '0'
            )}`

          const nombre =
            fecha.toLocaleDateString(
              'es-MX',
              {
                day: '2-digit',
                month: 'short'
              }
            )

          if (!dias[clave]) {
            dias[clave] = {
              periodo:
                nombre,

              total: 0,

              orden:
                fecha.getTime()
            }
          }

          dias[
            clave
          ].total +=
            getTotalBitacora(
              bitacora
            )
        }
      )

      return Object.values(
        dias
      )
        .sort(
          (a, b) =>
            a.orden -
            b.orden
        )

        .map(
          ({
            periodo,
            total
          }) => ({
            periodo,

            total:
              Math.round(
                total
              )
          })
        )
    }

  // =========================================================
  // GASTOS POR CATEGORÍA
  // OBEDECE SELECTOR
  // =========================================================

  const getGastosPorCategoria =
    () => {

      const gastosPeriodo =
        getGastosPeriodoSeleccionado()

      if (
        gastosPeriodo.length >
        0
      ) {
        let diesel = 0
        let casetas = 0
        let nomina = 0
        let extras = 0

        gastosPeriodo.forEach(
          (gasto) => {

            diesel +=
              toNumber(
                gasto.diesel
              )

            casetas +=
              toNumber(
                gasto.iave ??
                gasto.casetas
              )

            nomina +=
              toNumber(
                gasto.nomina
              )

            extras +=
              toNumber(
                gasto.gastosExtras ??
                gasto.gastos_extras
              )
          }
        )

        return [
          {
            name:
              'Diesel',

            value:
              Math.round(
                diesel
              )
          },

          {
            name:
              'Casetas (IAVE)',

            value:
              Math.round(
                casetas
              )
          },

          {
            name:
              'Nómina',

            value:
              Math.round(
                nomina
              )
          },

          {
            name:
              'Gastos Extras',

            value:
              Math.round(
                extras
              )
          }
        ].filter(
          (item) =>
            item.value > 0
        )
      }

      /*
        FALLBACK:
        BITÁCORAS
      */

      const bitacorasPeriodo =
        getBitacorasPeriodoSeleccionado()

      let diesel = 0
      let casetas = 0
      let extras = 0
      let comisiones = 0

      bitacorasPeriodo.forEach(
        (bitacora) => {

          diesel +=
            toNumber(
              bitacora.dieselLitros ??
              bitacora.diesel_litros
            )

          casetas +=
            toNumber(
              bitacora.casetas ??
              bitacora.iave
            )

          extras +=
            toNumber(
              bitacora.gastosExtras ??
              bitacora.gastos_extras
            )

          comisiones +=
            toNumber(
              bitacora.comisionOperador ??
              bitacora.comision_operador
            )
        }
      )

      return [
        {
          name:
            'Diesel',

          value:
            Math.round(
              diesel
            )
        },

        {
          name:
            'Casetas',

          value:
            Math.round(
              casetas
            )
        },

        {
          name:
            'Comisiones',

          value:
            Math.round(
              comisiones
            )
        },

        {
          name:
            'Gastos Extras',

          value:
            Math.round(
              extras
            )
        }
      ].filter(
        (item) =>
          item.value > 0
      )
    }

  // =========================================================
  // INGRESOS VS GASTOS VS UTILIDAD
  // OBEDECE SELECTOR
  // =========================================================

  const getIngresoVsGasto =
    () => {

      const viajesPeriodo =
        getViajesPeriodoSeleccionado()

      const gastosPeriodo =
        getGastosPeriodoSeleccionado()

      /*
        INGRESOS:
        suma de tarifas de viajes
        dentro del periodo.
      */

      const ingresos =
        viajesPeriodo.reduce(
          (
            total,
            viaje
          ) =>
            total +
            toNumber(
              viaje.tarifa
            ),
          0
        )

      let gastos = 0

      /*
        GASTOS:
        Si existen registros
        de gastos, usamos esos.
      */

      if (
        gastosPeriodo.length >
        0
      ) {
        gastos =
          gastosPeriodo.reduce(
            (
              total,
              gasto
            ) =>
              total +
              getTotalGastoRegistro(
                gasto
              ),
            0
          )
      } else {

        /*
          Si no existen,
          usamos bitácoras.
        */

        gastos =
          getBitacorasPeriodoSeleccionado()
            .reduce(
              (
                total,
                bitacora
              ) =>
                total +
                getTotalBitacora(
                  bitacora
                ),
              0
            )
      }

      const utilidad =
        ingresos -
        gastos

      return [
        {
          periodo:
            selectedPeriod ===
            'semanal'
              ? 'Semana actual'
              : 'Mes actual',

          ingresos:
            Math.round(
              ingresos
            ),

          gastos:
            Math.round(
              gastos
            ),

          utilidad:
            Math.round(
              utilidad
            )
        }
      ]
    }

  // =========================================================
  // VIAJES POR CLIENTE
  // OBEDECE SELECTOR
  // =========================================================

  const getViajesPorCliente =
    () => {

      const viajesPeriodo =
        getViajesPeriodoSeleccionado()

      if (
        viajesPeriodo.length ===
        0
      ) {
        return []
      }

      const clienteViajes = {}

      viajesPeriodo.forEach(
        (viaje) => {

          const clienteNombre =
            viaje.cliente
              ?.nombreComercial ??

            viaje.cliente
              ?.nombre ??

            viaje.clienteNombre ??

            'Sin cliente'

          clienteViajes[
            clienteNombre
          ] =
            (
              clienteViajes[
                clienteNombre
              ] || 0
            ) + 1
        }
      )

      return Object.entries(
        clienteViajes
      )
        .map(
          ([
            name,
            value
          ]) => ({
            name,
            value
          })
        )

        .sort(
          (a, b) =>
            b.value -
            a.value
        )

        .slice(
          0,
          10
        )
    }

  // =========================================================
  // INGRESOS POR CLIENTE
  // OBEDECE SELECTOR
  // =========================================================

  const getIngresosPorCliente =
    () => {

      const viajesPeriodo =
        getViajesPeriodoSeleccionado()

      if (
        viajesPeriodo.length ===
        0
      ) {
        return []
      }

      const clienteIngresos = {}

      viajesPeriodo.forEach(
        (viaje) => {

          const clienteNombre =
            viaje.cliente
              ?.nombreComercial ??

            viaje.cliente
              ?.nombre ??

            viaje.clienteNombre ??

            'Sin cliente'

          clienteIngresos[
            clienteNombre
          ] =
            (
              clienteIngresos[
                clienteNombre
              ] || 0
            ) +
            toNumber(
              viaje.tarifa
            )
        }
      )

      return Object.entries(
        clienteIngresos
      )
        .map(
          ([
            name,
            value
          ]) => ({
            name,

            value:
              Math.round(
                value
              )
          })
        )

        .sort(
          (a, b) =>
            b.value -
            a.value
        )

        .slice(
          0,
          8
        )
    }

  // =========================================================
  // FACTURAS POR ESTATUS
  // OBEDECE SELECTOR
  // =========================================================

  const getFacturasPorEstatus =
    () => {

      const facturasPeriodo =
        getFacturasPeriodoSeleccionado()

      if (
        facturasPeriodo.length ===
        0
      ) {
        return []
      }

      const estatus = {}

      facturasPeriodo.forEach(
        (factura) => {

          const estado =
            factura.estatus ||
            'PENDIENTE'

          estatus[
            estado
          ] =
            (
              estatus[
                estado
              ] || 0
            ) + 1
        }
      )

      return Object.entries(
        estatus
      ).map(
        ([
          name,
          value
        ]) => ({
          name,
          value
        })
      )
    }

  // =========================================================
  // FACTURAS POR PERIODO
  // OBEDECE SELECTOR
  // =========================================================

  const getFacturasPorPeriodo =
    () => {

      const facturasPeriodo =
        getFacturasPeriodoSeleccionado()

      if (
        facturasPeriodo.length ===
        0
      ) {
        return []
      }

      const dias = {}

      facturasPeriodo.forEach(
        (factura) => {

          const fecha =
            parseDateLocal(
              factura.fechaEmision ??
              factura.fecha_emision ??
              factura.fecha
            )

          if (!fecha) {
            return
          }

          const clave =
            `${fecha.getFullYear()}-${String(
              fecha.getMonth() +
                1
            ).padStart(
              2,
              '0'
            )}-${String(
              fecha.getDate()
            ).padStart(
              2,
              '0'
            )}`

          const nombre =
            fecha.toLocaleDateString(
              'es-MX',
              {
                day: '2-digit',
                month: 'short'
              }
            )

          if (
            !dias[clave]
          ) {
            dias[clave] = {
              periodo:
                nombre,

              monto: 0,

              cantidad: 0,

              orden:
                fecha.getTime()
            }
          }

          dias[
            clave
          ].monto +=
            toNumber(
              factura.monto
            )

          dias[
            clave
          ].cantidad += 1
        }
      )

      return Object.values(
        dias
      )
        .sort(
          (a, b) =>
            a.orden -
            b.orden
        )

        .map(
          ({
            periodo,
            monto,
            cantidad
          }) => ({
            periodo,

            monto:
              Math.round(
                monto
              ),

            cantidad
          })
        )
    }

  // =========================================================
  // KILOMETRAJE
  // ESTADO ACTUAL
  // NO OBEDECE SELECTOR
  // =========================================================

  const getKilometrajePorUnidad =
    () => {

      if (
        !Array.isArray(
          unidades
        ) ||
        unidades.length ===
          0
      ) {
        return []
      }

      return unidades
        .map(
          (unidad) => ({
            unidad:
              unidad.numeroEconomico ??
              unidad.numero_economico ??
              unidad.placas ??
              `Unidad #${unidad.id}`,

            kilometraje:
              toNumber(
                unidad.kilometrajeActual
              )
          })
        )

        .sort(
          (a, b) =>
            b.kilometraje -
            a.kilometraje
        )

        .slice(
          0,
          10
        )
    }

  // =========================================================
  // INVENTARIO BAJO
  // ESTADO ACTUAL
  // NO OBEDECE SELECTOR
  // =========================================================

  const getInventarioBajo =
    () => {

      if (
        !Array.isArray(
          refacciones
        ) ||
        refacciones.length ===
          0
      ) {
        return []
      }

      return refacciones
        .filter(
          (refaccion) =>
            toNumber(
              refaccion.stockActual
            ) < 5
        )

        .map(
          (refaccion) => ({
            nombre:
              refaccion.nombre ||
              refaccion.descripcion ||
              'Sin nombre',

            stock:
              toNumber(
                refaccion.stockActual
              ),

            minimo: 5
          })
        )

        .slice(
          0,
          10
        )
    }

  // =========================================================
  // ESTADÍSTICAS
  //
  // ESTAS TARJETAS SIGUEN MOSTRANDO
  // EL ESTADO GLOBAL/ACTUAL.
  // =========================================================

  const unidadesArray =
    Array.isArray(
      unidades
    )
      ? unidades
      : []

  const clientesArray =
    Array.isArray(
      clientes
    )
      ? clientes
      : []

  const operadoresArray =
    Array.isArray(
      operadores
    )
      ? operadores
      : []

  const facturasArray =
    Array.isArray(
      facturas
    )
      ? facturas
      : []

  const refaccionesArray =
    Array.isArray(
      refacciones
    )
      ? refacciones
      : []

  const stats = {

    totalViajes:
      Array.isArray(viajes)
        ? viajes.length
        : 0,

    viajesActivos:
      Array.isArray(viajes)
        ? viajes.filter(
            (v) =>
              v.estado ===
              'EN_CURSO'
          ).length
        : 0,

    totalUnidades:
      unidadesArray.length,

    unidadesActivas:
      unidadesArray.filter(
        (u) =>
          u.estado ===
          'ACTIVA'
      ).length,

    unidadesMantenimiento:
      unidadesArray.filter(
        (u) =>
          u.estado ===
          'MANTENIMIENTO'
      ).length,

    unidadesInactivas:
      unidadesArray.filter(
        (u) =>
          u.estado ===
          'INACTIVA'
      ).length,

    totalClientes:
      clientesArray.length,

    totalOperadores:
      operadoresArray.length,

    operadoresDisponibles:
      operadoresArray.filter(
        (o) =>
          o.estatus ===
          'Disponible'
      ).length,

    facturasPendientes:
      facturasArray.filter(
        (f) =>
          f.estatus ===
          'PENDIENTE'
      ).length,

    totalFacturasPendientes:
      facturasArray
        .filter(
          (f) =>
            f.estatus ===
            'PENDIENTE'
        )
        .reduce(
          (
            sum,
            f
          ) =>
            sum +
            toNumber(
              f.monto
            ),
          0
        ),

    refaccionesStockBajo:
      refaccionesArray.filter(
        (r) =>
          toNumber(
            r.stockActual
          ) < 5
      ).length
  }

  // =========================================================
  // RENTABILIDAD DE UNIDADES
  // =========================================================

  const rentabilidadSemanal =
    getRentabilidadSemanalUnidades()

  const rentabilidadMensual =
    getRentabilidadMensualUnidades()

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />

          <p className="text-slate-600">
            Cargando datos...
          </p>

        </div>

      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">

      <div className="mx-auto">

        {/* ================================================ */}
        {/* HEADER */}
        {/* ================================================ */}

        <div className="mb-6 lg:mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>

              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
                Gráficos
              </h1>

              <p className="text-sm lg:text-base text-slate-600 mt-1">
                Visualización y análisis de datos operacionales
              </p>

            </div>

            {/* SELECTOR */}

            <div className="flex items-center space-x-3">

              <select
                value={
                  selectedPeriod
                }
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value
                  )
                }
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 cursor-pointer"
              >

                <option value="semanal">
                  Semana actual
                </option>

                <option value="mensual">
                  Mes actual
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ================================================ */}
        {/* STATS */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">

          {canViewStatCard(
            userRole,
            'total-viajes'
          ) && (
            <StatCard
              title="Total de viajes"
              value={
                stats.totalViajes
              }
              icon={Truck}
              color="bg-blue-600"
              trend={8.5}
            />
          )}

          {canViewStatCard(
            userRole,
            'viajes-activos'
          ) && (
            <StatCard
              title="Viajes activos"
              value={
                stats.viajesActivos
              }
              icon={Activity}
              color="bg-orange-600"
            />
          )}

          {canViewStatCard(
            userRole,
            'total-clientes'
          ) && (
            <StatCard
              title="Total clientes"
              value={
                stats.totalClientes
              }
              icon={Activity}
              color="bg-purple-600"
            />
          )}

        </div>

        {/* SEGUNDA FILA */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">

          {canViewStatCard(
            userRole,
            'facturas-pendientes'
          ) && (
            <StatCard
              title="Facturas pendientes"
              value={
                stats.facturasPendientes
              }
              icon={DollarSign}
              color="bg-yellow-600"
            />
          )}

          {canViewStatCard(
            userRole,
            'monto-por-cobrar'
          ) && (
            <StatCard
              title="Monto por cobrar"
              value={`$${stats.totalFacturasPendientes.toLocaleString(
                'es-MX',
                {
                  minimumFractionDigits: 0
                }
              )}`}
              icon={DollarSign}
              color="bg-amber-600"
            />
          )}

        </div>

        {/* ================================================ */}
        {/* RENTABILIDAD POR UNIDAD */}
        {/* NO OBEDECE EL SELECTOR */}
        {/* ================================================ */}

        <div className="space-y-6 mb-6">

          {/* =============================== */}
          {/* SEMANAL */}
          {/* =============================== */}

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">

              <div>

                <h3 className="text-lg font-bold text-slate-900">
                  Ganancia, pérdida y utilidad por unidad
                </h3>

                <p className="text-sm text-slate-600">

                  Semanal · Viernes a jueves{' '}

                  <span className="font-medium text-slate-700">

                    (
                    {formatFechaCorta(
                      getSemanaOperativaActual()
                        .inicio
                    )}

                    {' - '}

                    {formatFechaCorta(
                      getSemanaOperativaActual()
                        .fin
                    )}
                    )

                  </span>

                </p>

              </div>

              <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-purple-700">

                <Wallet className="h-5 w-5" />

                <span className="text-sm font-semibold">

                  {rentabilidadSemanal.length}{' '}

                  unidad
                  {rentabilidadSemanal.length ===
                  1
                    ? ''
                    : 'es'}

                </span>

              </div>

            </div>

            {rentabilidadSemanal.length ===
            0 ? (

              <div className="h-[320px] flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">

                No hay unidades registradas para calcular rentabilidad semanal.

              </div>

            ) : (

              <div className="w-full overflow-x-auto">

                <div
                  style={{
                    minWidth:
                      '900px'
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height={getAlturaGraficaUnidades(
                      rentabilidadSemanal
                    )}
                  >

                    <BarChart
                      data={
                        rentabilidadSemanal
                      }
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 40,
                        left: 40,
                        bottom: 10
                      }}
                      barCategoryGap={
                        12
                      }
                    >

                      <defs>

                        <linearGradient
                          id="gananciaSemanalOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                        <linearGradient
                          id="perdidaSemanalOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                        <linearGradient
                          id="utilidadSemanalOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        horizontal={
                          false
                        }
                      />

                      <XAxis
                        type="number"
                        stroke="#334155"
                        style={{
                          fontSize:
                            '12px'
                        }}
                        tickFormatter={(
                          value
                        ) =>
                          `$${Number(
                            value ||
                              0
                          ).toLocaleString(
                            'es-MX'
                          )}`
                        }
                      />

                      <YAxis
                        type="category"
                        dataKey="unidad"
                        stroke="#334155"
                        style={{
                          fontSize:
                            '12px',
                          fontWeight:
                            600
                        }}
                        width={190}
                      />

                      <Tooltip
                        content={
                          <CustomMoneyTooltip />
                        }
                        cursor={{
                          fill:
                            'rgba(139, 92, 246, 0.05)'
                        }}
                      />

                      <Legend />

                      <Bar
                        dataKey="ingresos"
                        name="Ganancia"
                        fill="url(#gananciaSemanalOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                      <Bar
                        dataKey="gastos"
                        name="Pérdida"
                        fill="url(#perdidaSemanalOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                      <Bar
                        dataKey="utilidad"
                        name="Utilidad"
                        fill="url(#utilidadSemanalOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

          </div>

          {/* =============================== */}
          {/* MENSUAL */}
          {/* =============================== */}

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">

              <div>

                <h3 className="text-lg font-bold text-slate-900">
                  Ganancia, pérdida y utilidad por unidad
                </h3>

                <p className="text-sm text-slate-600">

                  Mensual · Mes actual acumulado{' '}

                  <span className="font-medium text-slate-700">

                    (
                    {formatFechaCorta(
                      getMesActualAcumulado()
                        .inicio
                    )}

                    {' - '}

                    {formatFechaCorta(
                      getMesActualAcumulado()
                        .fin
                    )}
                    )

                  </span>

                </p>

              </div>

              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-blue-700">

                <Calendar className="h-5 w-5" />

                <span className="text-sm font-semibold">

                  {rentabilidadMensual.length}{' '}

                  unidad
                  {rentabilidadMensual.length ===
                  1
                    ? ''
                    : 'es'}

                </span>

              </div>

            </div>

            {rentabilidadMensual.length ===
            0 ? (

              <div className="h-[320px] flex items-center justify-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">

                No hay unidades registradas para calcular rentabilidad mensual.

              </div>

            ) : (

              <div className="w-full overflow-x-auto">

                <div
                  style={{
                    minWidth:
                      '900px'
                  }}
                >

                  <ResponsiveContainer
                    width="100%"
                    height={getAlturaGraficaUnidades(
                      rentabilidadMensual
                    )}
                  >

                    <BarChart
                      data={
                        rentabilidadMensual
                      }
                      layout="vertical"
                      margin={{
                        top: 10,
                        right: 40,
                        left: 40,
                        bottom: 10
                      }}
                      barCategoryGap={
                        12
                      }
                    >

                      <defs>

                        <linearGradient
                          id="gananciaMensualOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                        <linearGradient
                          id="perdidaMensualOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                        <linearGradient
                          id="utilidadMensualOp"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >

                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={
                              0.9
                            }
                          />

                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={
                              0.55
                            }
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        horizontal={
                          false
                        }
                      />

                      <XAxis
                        type="number"
                        stroke="#334155"
                        style={{
                          fontSize:
                            '12px'
                        }}
                        tickFormatter={(
                          value
                        ) =>
                          `$${Number(
                            value ||
                              0
                          ).toLocaleString(
                            'es-MX'
                          )}`
                        }
                      />

                      <YAxis
                        type="category"
                        dataKey="unidad"
                        stroke="#334155"
                        style={{
                          fontSize:
                            '12px',
                          fontWeight:
                            600
                        }}
                        width={190}
                      />

                      <Tooltip
                        content={
                          <CustomMoneyTooltip />
                        }
                        cursor={{
                          fill:
                            'rgba(59, 130, 246, 0.05)'
                        }}
                      />

                      <Legend />

                      <Bar
                        dataKey="ingresos"
                        name="Ganancia"
                        fill="url(#gananciaMensualOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                      <Bar
                        dataKey="gastos"
                        name="Pérdida"
                        fill="url(#perdidaMensualOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                      <Bar
                        dataKey="utilidad"
                        name="Utilidad"
                        fill="url(#utilidadMensualOp)"
                        radius={[
                          0,
                          8,
                          8,
                          0
                        ]}
                        barSize={14}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* ================================================ */}
        {/* INGRESOS / GASTOS + CATEGORÍAS */}
        {/* SÍ OBEDECEN SELECTOR */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* INGRESOS VS GASTOS */}

          {canViewChart(
            userRole,
            'ingresos-vs-gastos'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Ingresos, Gastos y Utilidad
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <BarChart3 className="h-6 w-6 text-blue-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={330}
              >

                <BarChart
                  data={
                    getIngresoVsGasto()
                  }
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10
                  }}
                >

                  <defs>

                    <linearGradient
                      id="colorIngresos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={
                          0.4
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="colorGastos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={
                          0.4
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="colorUtilidad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.4
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="periodo"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    tickFormatter={(
                      value
                    ) =>
                      `$${Number(
                        value ||
                          0
                      ).toLocaleString(
                        'es-MX'
                      )}`
                    }
                  />

                  <Tooltip
                    content={
                      <CustomMoneyTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(59, 130, 246, 0.05)'
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="url(#colorIngresos)"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="gastos"
                    name="Gastos"
                    fill="url(#colorGastos)"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="utilidad"
                    name="Utilidad"
                    fill="url(#colorUtilidad)"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

          {/* GASTOS POR CATEGORÍA */}

          {canViewChart(
            userRole,
            'gastos-categoria'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Gastos por Categoría
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <PieChartIcon className="h-6 w-6 text-blue-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <defs>

                    <linearGradient
                      id="grad1"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#1d4ed8"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="grad2"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#6d28d9"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="grad3"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#ec4899"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#be185d"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="grad4"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#d97706"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <Pie
                    data={
                      getGastosPorCategoria()
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={
                      60
                    }
                    outerRadius={
                      100
                    }
                    paddingAngle={
                      5
                    }
                    dataKey="value"
                  >

                    {getGastosPorCategoria().map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#grad${
                            (
                              index %
                              4
                            ) + 1
                          })`}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Legend
  verticalAlign="bottom"
  height={36}
  formatter={(value, entry) => {
    const cantidad =
      entry?.payload?.value ??
      entry?.payload?.payload?.value ??
      0

    return (
      <span
        style={{
          color: '#475569',
          fontSize: '12px'
        }}
      >
        {value}: {formatMoney(cantidad)}
      </span>
    )
  }}
/>

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================================================ */}
        {/* GASTOS DEL PERIODO */}
        {/* ================================================ */}

        {canViewChart(
          userRole,
          'gastos-mensuales'
        ) && (

          <div className="mt-6">

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Gastos del Periodo
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <DollarSign className="h-6 w-6 text-blue-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <AreaChart
                  data={
                    getGastosPorPeriodo()
                  }
                >

                  <defs>

                    <linearGradient
                      id="colorTotal"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={
                          0.1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="periodo"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    tickFormatter={(
                      value
                    ) =>
                      `$${Number(
                        value ||
                          0
                      ).toLocaleString(
                        'es-MX'
                      )}`
                    }
                  />

                  <Tooltip
                    content={
                      <CustomMoneyTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(239, 68, 68, 0.05)'
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Gasto Total"
                    stroke="#ef4444"
                    strokeWidth={
                      3
                    }
                    fillOpacity={
                      1
                    }
                    fill="url(#colorTotal)"
                    dot={{
                      fill:
                        '#ef4444',
                      r: 4
                    }}
                    activeDot={{
                      r: 6
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>

        )}

        {/* ================================================ */}
        {/* VIAJES DEL PERIODO */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 my-6">

          {canViewChart(
            userRole,
            'viajes-mes'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Viajes del Periodo
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <Calendar className="h-6 w-6 text-blue-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <AreaChart
                  data={
                    getViajesPorPeriodo()
                  }
                >

                  <defs>

                    <linearGradient
                      id="colorViajes"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="periodo"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(59, 130, 246, 0.05)'
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="cantidad"
                    name="Viajes"
                    stroke="#3b82f6"
                    strokeWidth={
                      3
                    }
                    fillOpacity={
                      1
                    }
                    fill="url(#colorViajes)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================================================ */}
        {/* CLIENTES */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* VIAJES POR CLIENTE */}

          {canViewChart(
            userRole,
            'viajes-cliente'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Viajes por Cliente
                  </h3>

                  <p className="text-sm text-slate-600">

                    Top 10 ·{' '}

                    {selectedPeriod ===
                    'semanal'
                      ? 'Semana actual'
                      : 'Mes actual'}

                  </p>

                </div>

                <Activity className="h-6 w-6 text-purple-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={
                    getViajesPorCliente()
                  }
                  layout="vertical"
                >

                  <defs>

                    <linearGradient
                      id="gradCliente"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >

                      <stop
                        offset="0%"
                        stopColor="#a855f7"
                        stopOpacity={
                          0.6
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#a855f7"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={
                      false
                    }
                  />

                  <XAxis
                    type="number"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    allowDecimals={
                      false
                    }
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '10px'
                    }}
                    width={100}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(168, 85, 247, 0.1)'
                    }}
                  />

                  <Bar
                    dataKey="value"
                    name="Viajes"
                    fill="url(#gradCliente)"
                    radius={[
                      0,
                      8,
                      8,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

          {/* INGRESOS POR CLIENTE */}

          {canViewChart(
            userRole,
            'ingresos-cliente'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Ingresos por Cliente
                  </h3>

                  <p className="text-sm text-slate-600">

                    Top 8 ·{' '}

                    {selectedPeriod ===
                    'semanal'
                      ? 'Semana actual'
                      : 'Mes actual'}

                  </p>

                </div>

                <DollarSign className="h-6 w-6 text-purple-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <defs>

                    {COLORS.primary.map(
                      (
                        color,
                        index
                      ) => (

                        <linearGradient
                          key={`gradIngCliente${index}`}
                          id={`gradIngCliente${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor={
                              color
                            }
                            stopOpacity={
                              1
                            }
                          />

                          <stop
                            offset="100%"
                            stopColor={
                              color
                            }
                            stopOpacity={
                              0.7
                            }
                          />

                        </linearGradient>

                      )
                    )}

                  </defs>

                  <Pie
                    data={
                      getIngresosPorCliente()
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={
                      60
                    }
                    outerRadius={
                      100
                    }
                    paddingAngle={
                      3
                    }
                    dataKey="value"
                  >

                    {getIngresosPorCliente().map(
                      (
                        entry,
                        index
                      ) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradIngCliente${
                            index %
                            COLORS
                              .primary
                              .length
                          })`}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <CustomMoneyTooltip />
                    }
                  />

                  <Legend
  verticalAlign="bottom"
  height={60}
  formatter={(value, entry) => {
    const cantidad =
      entry?.payload?.value ??
      entry?.payload?.payload?.value ??
      0

    return (
      <span
        style={{
          color: '#475569',
          fontSize: '11px'
        }}
      >
        {value}: {formatMoney(cantidad)}
      </span>
    )
  }}
/>

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================================================ */}
        {/* FACTURAS */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* FACTURAS POR ESTATUS */}

          {canViewChart(
            userRole,
            'facturas-estatus'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Facturas por Estatus
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <DollarSign className="h-6 w-6 text-amber-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <defs>

                    <linearGradient
                      id="gradPend"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#d97706"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="gradPag"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#10b981"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#059669"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="gradCanc"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                        stopOpacity={
                          1
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#dc2626"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <Pie
                    data={
                      getFacturasPorEstatus()
                    }
                    cx="50%"
                    cy="50%"
                    innerRadius={
                      60
                    }
                    outerRadius={
                      100
                    }
                    paddingAngle={
                      5
                    }
                    dataKey="value"
                  >

                    {getFacturasPorEstatus().map(
                      (
                        entry,
                        index
                      ) => {

                        const fillMap =
                          {
                            PENDIENTE:
                              'url(#gradPend)',

                            PAGADA:
                              'url(#gradPag)',

                            PAGADO:
                              'url(#gradPag)',

                            PAGO_PARCIAL:
                              '#8b5cf6',

                            CANCELADO:
                              'url(#gradCanc)'
                          }

                        return (

                          <Cell
                            key={`cell-${index}`}
                            fill={
                              fillMap[
                                entry
                                  .name
                              ] ||
                              COLORS
                                .primary[
                                index %
                                  COLORS
                                    .primary
                                    .length
                              ]
                            }
                          />

                        )
                      }
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={
                      36
                    }
                    formatter={(
                      value,
                      entry
                    ) => (

                      <span
                        style={{
                          color:
                            '#475569',
                          fontSize:
                            '12px'
                        }}
                      >

                        {value}:{' '}

                        {
                          entry
                            .payload
                            .value
                        }

                      </span>

                    )}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

          )}

          {/* FACTURAS DEL PERIODO */}

          {canViewChart(
            userRole,
            'facturas-mensuales'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Facturas del Periodo
                  </h3>

                  <p className="text-sm text-slate-600">
                    {getDescripcionPeriodoSeleccionado()}
                  </p>

                </div>

                <Calendar className="h-6 w-6 text-amber-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={
                    getFacturasPorPeriodo()
                  }
                >

                  <defs>

                    <linearGradient
                      id="colorMonto"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          0.4
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="colorCantidad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.8
                        }
                      />

                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={
                          0.4
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="periodo"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    yAxisId="left"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    tickFormatter={(
                      value
                    ) =>
                      `$${Number(
                        value ||
                          0
                      ).toLocaleString(
                        'es-MX'
                      )}`
                    }
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(245, 158, 11, 0.05)'
                    }}
                  />

                  <Legend />

                  <Bar
                    yAxisId="left"
                    dataKey="monto"
                    name="Monto"
                    fill="url(#colorMonto)"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    yAxisId="right"
                    dataKey="cantidad"
                    name="Cantidad"
                    fill="url(#colorCantidad)"
                    radius={[
                      8,
                      8,
                      0,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

        {/* ================================================ */}
        {/* ESTADO ACTUAL */}
        {/* NO OBEDECE SELECTOR */}
        {/* ================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* KILOMETRAJE */}

          {canViewChart(
            userRole,
            'kilometraje-unidad'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Kilometraje por Unidad
                  </h3>

                  <p className="text-sm text-slate-600">
                    Top 10 unidades
                  </p>

                </div>

                <TrendingUp className="h-6 w-6 text-blue-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={
                    getKilometrajePorUnidad()
                  }
                  layout="vertical"
                >

                  <defs>

                    <linearGradient
                      id="gradKm"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >

                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity={
                          0.6
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#8b5cf6"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={
                      false
                    }
                  />

                  <XAxis
                    type="number"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="unidad"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '11px'
                    }}
                    width={80}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(139, 92, 246, 0.1)'
                    }}
                  />

                  <Bar
                    dataKey="kilometraje"
                    name="Km"
                    fill="url(#gradKm)"
                    radius={[
                      0,
                      8,
                      8,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

          {/* INVENTARIO */}

          {canViewChart(
            userRole,
            'inventario-bajo'
          ) && (

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Inventario Bajo
                  </h3>

                  <p className="text-sm text-slate-600">
                    Refacciones con stock bajo
                  </p>

                </div>

                <Activity className="h-6 w-6 text-rose-600" />

              </div>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={
                    getInventarioBajo()
                  }
                  layout="vertical"
                >

                  <defs>

                    <linearGradient
                      id="gradStock"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >

                      <stop
                        offset="0%"
                        stopColor="#ef4444"
                        stopOpacity={
                          0.6
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#ef4444"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                    <linearGradient
                      id="gradMin"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >

                      <stop
                        offset="0%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          0.6
                        }
                      />

                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity={
                          1
                        }
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    horizontal={
                      false
                    }
                  />

                  <XAxis
                    type="number"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '12px'
                    }}
                  />

                  <YAxis
                    type="category"
                    dataKey="nombre"
                    stroke="#334155"
                    style={{
                      fontSize:
                        '10px'
                    }}
                    width={120}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                    cursor={{
                      fill:
                        'rgba(239, 68, 68, 0.1)'
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="stock"
                    name="Stock Actual"
                    fill="url(#gradStock)"
                    radius={[
                      0,
                      8,
                      8,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="minimo"
                    name="Stock Mínimo"
                    fill="url(#gradMin)"
                    radius={[
                      0,
                      8,
                      8,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>

      </div>

    </div>
  )
}