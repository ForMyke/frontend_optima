'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Save,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import { authService } from '@/app/services/authService'
import gastosService from '@/app/services/gastosService'
import gastosFijosService from '@/app/services/gastosFijosService'

const MAP_GASTOS_FIJOS = {
  IMSS: 'imss',
  INFONAVIT: 'infonavit',
  CONTADOR: 'contador',
  GPS: 'gps',
  SEGUROS: 'seguros',
  CREDITOS: 'creditos',
  TELEFONIA: 'telefonia'
}

const crearFormularioInicial = (fecha = '') => ({
  semanaInicio: fecha,
  semanaFin: fecha,
  iave: '0',
  imss: '0',
  infonavit: '0',
  diesel: '0',
  nomina: '0',
  refacciones: '0',
  contador: '0',
  gps: '0',
  gastosExtras: '0',
  seguros: '0',
  creditos: '0',
  telefonia: '0',
  gastoExtrahordinario: '0',
  observaciones: ''
})

const normalizarNombreGasto = (nombre = '') => {
  return nombre
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
}

const obtenerFechaAyer = () => {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() - 1)

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

const calcularDiasInclusivos = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) {
    return 1
  }

  const [anioInicio, mesInicio, diaInicio] = fechaInicio
    .split('-')
    .map(Number)

  const [anioFin, mesFin, diaFin] = fechaFin
    .split('-')
    .map(Number)

  const inicioUTC = Date.UTC(
    anioInicio,
    mesInicio - 1,
    diaInicio
  )

  const finUTC = Date.UTC(
    anioFin,
    mesFin - 1,
    diaFin
  )

  const diferencia = finUTC - inicioUTC

  return Math.floor(diferencia / 86400000) + 1
}

const formatearMoneda = (valor) => {
  const numero = Number(valor || 0)

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(numero)
}

const CAMPOS_AUTOMATICOS = [
  'iave',
  'imss',
  'infonavit',
  'diesel',
  'nomina',
  'contador',
  'gps',
  'gastosExtras',
  'seguros',
  'creditos',
  'telefonia'
]

const CreateGastoSemanalModal = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState(
    crearFormularioInicial()
  )

  const [tipoPeriodo, setTipoPeriodo] = useState('DIA')
  const [errors, setErrors] = useState({})
  const [totalViajes, setTotalViajes] = useState(0)
  const [diasPeriodo, setDiasPeriodo] = useState(1)
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [datosCargados, setDatosCargados] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const ayer = obtenerFechaAyer()

      setTipoPeriodo('DIA')
      setFormData(crearFormularioInicial(ayer))
      setErrors({})
      setTotalViajes(0)
      setDiasPeriodo(1)
      setDatosCargados(false)
      setLoadingDatos(false)
      setGuardando(false)

      return
    }

    setFormData(crearFormularioInicial())
    setErrors({})
    setTotalViajes(0)
    setDiasPeriodo(1)
    setDatosCargados(false)
  }, [isOpen])

  const limpiarCamposAutomaticos = (datosAnteriores) => {
    const nuevosDatos = { ...datosAnteriores }

    CAMPOS_AUTOMATICOS.forEach((campo) => {
      nuevosDatos[campo] = '0'
    })

    return nuevosDatos
  }

  const reiniciarResultadoAutomatico = () => {
    setDatosCargados(false)
    setTotalViajes(0)
    setDiasPeriodo(1)
  }

  const cambiarTipoPeriodo = (nuevoTipo) => {
    setTipoPeriodo(nuevoTipo)

    setFormData((prev) => {
      const nuevosDatos = limpiarCamposAutomaticos(prev)

      if (nuevoTipo === 'DIA') {
        nuevosDatos.semanaFin = prev.semanaInicio
      }

      return nuevosDatos
    })

    reiniciarResultadoAutomatico()
    setErrors({})
  }

  const handleFechaInicioChange = (event) => {
    const fecha = event.target.value

    setFormData((prev) => {
      const nuevosDatos = limpiarCamposAutomaticos(prev)

      nuevosDatos.semanaInicio = fecha

      if (
        tipoPeriodo === 'DIA' ||
        !prev.semanaFin ||
        prev.semanaFin < fecha
      ) {
        nuevosDatos.semanaFin = fecha
      }

      return nuevosDatos
    })

    reiniciarResultadoAutomatico()

    setErrors((prev) => ({
      ...prev,
      semanaInicio: '',
      semanaFin: ''
    }))
  }

  const handleFechaFinChange = (event) => {
    const fecha = event.target.value

    setFormData((prev) => {
      const nuevosDatos = limpiarCamposAutomaticos(prev)
      nuevosDatos.semanaFin = fecha
      return nuevosDatos
    })

    reiniciarResultadoAutomatico()

    setErrors((prev) => ({
      ...prev,
      semanaFin: ''
    }))
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validarPeriodo = () => {
    const nuevosErrores = {}

    if (!formData.semanaInicio) {
      nuevosErrores.semanaInicio =
        'La fecha inicial es requerida'
    }

    const fechaFin =
      tipoPeriodo === 'DIA'
        ? formData.semanaInicio
        : formData.semanaFin

    if (!fechaFin) {
      nuevosErrores.semanaFin =
        'La fecha final es requerida'
    } else if (
      formData.semanaInicio &&
      fechaFin < formData.semanaInicio
    ) {
      nuevosErrores.semanaFin =
        'La fecha final no puede ser anterior a la inicial'
    }

    setErrors(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  const cargarDatosGenerados = async () => {
    if (!validarPeriodo()) {
      return
    }

    const fechaInicio = formData.semanaInicio

    const fechaFin =
      tipoPeriodo === 'DIA'
        ? fechaInicio
        : formData.semanaFin

    setLoadingDatos(true)
    setDatosCargados(false)

    try {
      const datosGenerados =
        await gastosService.getGastosGenerados(
          fechaInicio,
          fechaFin
        )

      const diasCalculados =
        Number(datosGenerados?.diasRango) ||
        calcularDiasInclusivos(fechaInicio, fechaFin)

      const camposGastosFijos = {
        imss: '0',
        infonavit: '0',
        contador: '0',
        gps: '0',
        seguros: '0',
        creditos: '0',
        telefonia: '0'
      }

      try {
        const respuestaGastosFijos =
          await gastosFijosService.getGastosFijos()

        const listaGastosFijos = Array.isArray(
          respuestaGastosFijos
        )
          ? respuestaGastosFijos
          : respuestaGastosFijos?.content || []

        listaGastosFijos.forEach((gasto) => {
          const nombreNormalizado =
            normalizarNombreGasto(gasto.nombre)

          const campoFormulario =
            MAP_GASTOS_FIJOS[nombreNormalizado]

          if (!campoFormulario) {
            return
          }

          const montoDiario = Number(
            gasto.montoDiario || 0
          )

          const montoPeriodo =
            montoDiario * diasCalculados

          camposGastosFijos[campoFormulario] =
            montoPeriodo.toFixed(2)
        })
      } catch (error) {
        console.error(
          'Error al cargar gastos fijos:',
          error
        )

        toast.error(
          'Los gastos de viajes se cargaron, pero no fue posible obtener los gastos fijos'
        )
      }

      setFormData((prev) => ({
        ...prev,

        semanaInicio:
          datosGenerados?.fechaInicio || fechaInicio,

        semanaFin:
          datosGenerados?.fechaFin || fechaFin,

        iave: String(datosGenerados?.iave || 0),

        diesel: String(
          datosGenerados?.diesel || 0
        ),

        /*
         * El backend devuelve:
         * nómina base diaria × días
         * +
         * comisiones del período.
         */
        nomina: String(
          datosGenerados?.nomina || 0
        ),

        gastosExtras: String(
          datosGenerados?.gastosExtras || 0
        ),

        imss: camposGastosFijos.imss,
        infonavit: camposGastosFijos.infonavit,
        contador: camposGastosFijos.contador,
        gps: camposGastosFijos.gps,
        seguros: camposGastosFijos.seguros,
        creditos: camposGastosFijos.creditos,
        telefonia: camposGastosFijos.telefonia
      }))

      setTotalViajes(
        Number(datosGenerados?.totalViajes || 0)
      )

      setDiasPeriodo(diasCalculados)
      setDatosCargados(true)

      toast.success(
        diasCalculados === 1
          ? 'Gastos del día cargados correctamente'
          : `Gastos de ${diasCalculados} días cargados correctamente`
      )
    } catch (error) {
      console.error(
        'Error al cargar datos automáticos:',
        error
      )

      toast.error(
        error.message ||
          'No fue posible calcular los gastos del período'
      )

      setTotalViajes(0)
      setDatosCargados(false)
    } finally {
      setLoadingDatos(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validarPeriodo()) {
      return
    }

    const usuario = authService.getUser()
    const creadoPor = usuario?.id || 1

    const fechaFin =
      tipoPeriodo === 'DIA'
        ? formData.semanaInicio
        : formData.semanaFin

    const gastoData = {
      ...formData,

      semanaInicio: formData.semanaInicio,
      semanaFin: fechaFin,

      iave: Number.parseFloat(formData.iave || 0),
      imss: Number.parseFloat(formData.imss || 0),
      infonavit: Number.parseFloat(
        formData.infonavit || 0
      ),
      diesel: Number.parseFloat(
        formData.diesel || 0
      ),
      nomina: Number.parseFloat(
        formData.nomina || 0
      ),
      refacciones: Number.parseFloat(
        formData.refacciones || 0
      ),
      contador: Number.parseFloat(
        formData.contador || 0
      ),
      gps: Number.parseFloat(formData.gps || 0),
      gastosExtras: Number.parseFloat(
        formData.gastosExtras || 0
      ),
      seguros: Number.parseFloat(
        formData.seguros || 0
      ),
      creditos: Number.parseFloat(
        formData.creditos || 0
      ),
      telefonia: Number.parseFloat(
        formData.telefonia || 0
      ),
      gastoExtrahordinario: Number.parseFloat(
        formData.gastoExtrahordinario || 0
      ),

      creadoPor
    }

    setGuardando(true)

    try {
      await onSubmit(gastoData)
    } catch (error) {
      console.error('Error al guardar gasto:', error)

      toast.error(
        error.message ||
          'No fue posible guardar el gasto'
      )
    } finally {
      setGuardando(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* Encabezado */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Nuevo gasto
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Selecciona un día o rango para calcular los
              gastos automáticamente
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* Selección del período */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />

              <h3 className="font-semibold text-slate-900">
                Período de los gastos
              </h3>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  cambiarTipoPeriodo('DIA')
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tipoPeriodo === 'DIA'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Un solo día
              </button>

              <button
                type="button"
                onClick={() =>
                  cambiarTipoPeriodo('RANGO')
                }
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tipoPeriodo === 'RANGO'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                Rango de días
              </button>
            </div>

            <div
              className={`grid grid-cols-1 gap-4 ${
                tipoPeriodo === 'RANGO'
                  ? 'md:grid-cols-2'
                  : ''
              }`}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {tipoPeriodo === 'DIA'
                    ? 'Fecha'
                    : 'Fecha inicial'}
                </label>

                <input
                  type="date"
                  name="semanaInicio"
                  value={formData.semanaInicio}
                  onChange={handleFechaInicioChange}
                  className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:ring-2 focus:ring-blue-500 ${
                    errors.semanaInicio
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300 bg-white'
                  }`}
                />

                {errors.semanaInicio && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.semanaInicio}
                  </p>
                )}
              </div>

              {tipoPeriodo === 'RANGO' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Fecha final
                  </label>

                  <input
                    type="date"
                    name="semanaFin"
                    value={formData.semanaFin}
                    min={formData.semanaInicio}
                    onChange={handleFechaFinChange}
                    className={`w-full rounded-lg border px-4 py-2.5 transition-all focus:ring-2 focus:ring-blue-500 ${
                      errors.semanaFin
                        ? 'border-red-400 bg-red-50'
                        : 'border-slate-300 bg-white'
                    }`}
                  />

                  {errors.semanaFin && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.semanaFin}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={cargarDatosGenerados}
              disabled={
                loadingDatos ||
                guardando ||
                !formData.semanaInicio ||
                (tipoPeriodo === 'RANGO' &&
                  !formData.semanaFin)
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingDatos ? 'animate-spin' : ''
                }`}
              />

              <span>
                {loadingDatos
                  ? 'Calculando gastos...'
                  : 'Obtener gastos automáticamente'}
              </span>
            </button>
          </div>

          {/* Resultado del cálculo */}
          {datosCargados && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    Datos automáticos cargados
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Se calcularon los gastos de{' '}
                    <strong>
                      {diasPeriodo}{' '}
                      {diasPeriodo === 1
                        ? 'día'
                        : 'días'}
                    </strong>{' '}
                    y se encontraron{' '}
                    <strong>
                      {totalViajes}{' '}
                      {totalViajes === 1
                        ? 'viaje'
                        : 'viajes'}
                    </strong>
                    .
                  </p>

                  <p className="mt-1 text-xs text-emerald-700">
                    La nómina incluye la nómina base del
                    período más las comisiones de los viajes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campos de gastos */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Detalle de gastos
              </h3>

              <p className="text-sm text-slate-600">
                Puedes modificar cualquier importe antes de
                guardar.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CampoMoneda
                label="IAVE"
                name="iave"
                value={formData.iave}
                onChange={handleChange}
                automatico
              />

              <CampoMoneda
                label="IMSS"
                name="imss"
                value={formData.imss}
                onChange={handleChange}
              />

              <CampoMoneda
                label="INFONAVIT"
                name="infonavit"
                value={formData.infonavit}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Diésel"
                name="diesel"
                value={formData.diesel}
                onChange={handleChange}
                automatico
              />

              <CampoMoneda
                label="Nómina"
                name="nomina"
                value={formData.nomina}
                onChange={handleChange}
                automatico
                ayuda="Incluye nómina base y comisiones"
              />

              <CampoMoneda
                label="Refacciones"
                name="refacciones"
                value={formData.refacciones}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Contador"
                name="contador"
                value={formData.contador}
                onChange={handleChange}
              />

              <CampoMoneda
                label="GPS"
                name="gps"
                value={formData.gps}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Gastos extras"
                name="gastosExtras"
                value={formData.gastosExtras}
                onChange={handleChange}
                automatico
              />

              <CampoMoneda
                label="Seguros"
                name="seguros"
                value={formData.seguros}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Créditos"
                name="creditos"
                value={formData.creditos}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Telefonía"
                name="telefonia"
                value={formData.telefonia}
                onChange={handleChange}
              />

              <CampoMoneda
                label="Gasto extraordinario"
                name="gastoExtrahordinario"
                value={formData.gastoExtrahordinario}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Observaciones
            </label>

            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre los gastos del período..."
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resumen */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">
              Total capturado
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {formatearMoneda(
                CAMPOS_AUTOMATICOS.reduce(
                  (total, campo) =>
                    total +
                    Number(formData[campo] || 0),
                  0
                ) +
                  Number(formData.refacciones || 0) +
                  Number(
                    formData.gastoExtrahordinario || 0
                  )
              )}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando || loadingDatos}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando || loadingDatos}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Save className="h-4 w-4" />

              <span>
                {guardando
                  ? 'Guardando...'
                  : 'Guardar gasto'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CampoMoneda = ({
  label,
  name,
  value,
  onChange,
  automatico = false,
  ayuda = ''
}) => {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">
          {label}
        </label>

        {automatico && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
            Automático
          </span>
        )}
      </div>

      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          className={`w-full rounded-lg border py-2.5 pl-9 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
            automatico
              ? 'border-blue-300 bg-blue-50'
              : 'border-slate-300 bg-white'
          }`}
        />
      </div>

      {ayuda && (
        <p className="mt-1 text-xs text-slate-500">
          {ayuda}
        </p>
      )}
    </div>
  )
}

export default CreateGastoSemanalModal