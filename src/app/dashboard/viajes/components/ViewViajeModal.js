'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, User, Package, Truck, Camera, Eye, Clock, CheckCircle, XCircle, Navigation, FileText, Download } from 'lucide-react'
import Image from 'next/image'
import tarifasComisionesService from '@/app/services/tarifasComisionesService'
import { usersService } from '@/app/services/usersService'

const ViewViajeModal = ({ isOpen, onClose, viaje, operadores = [], clientes = [], unidades = [] }) => {
  const [rutaComision, setRutaComision] = useState(null)
  const [responsableLogistica, setResponsableLogistica] = useState(null)
  const [creadoPorUsuario, setCreadoPorUsuario] = useState(null)
  const [loadingData, setLoadingData] = useState(false)

  const ESTADOS = {
    PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    EN_CURSO: { label: 'En curso', color: 'bg-blue-100 text-blue-800', icon: Navigation },
    COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
  }

  const TIPOS_VIAJE = {
    NORMAL: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    URGENTE: { label: 'Urgente', color: 'bg-red-100 text-red-800' },
    PROGRAMADO: { label: 'Programado', color: 'bg-green-100 text-green-800' }
  }

  // Cargar datos adicionales cuando se abre el modal
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (!isOpen || !viaje) return

      setLoadingData(true)
      try {
        // Cargar ruta-comisión si existe
        if (viaje.idRutaComisiones) {
          try {
            const rutaData = await tarifasComisionesService.getRutaComisionById(viaje.idRutaComisiones)
            setRutaComision(rutaData)
          } catch (error) {
            console.error('Error al cargar ruta-comisión:', error)
            setRutaComision(null)
          }
        }

        // Cargar responsable de logística si existe
        if (viaje.responsableLogistica) {
          try {
            const usuarios = await usersService.getUsers(0, 1000)
            const responsable = usuarios.content?.find(u => u.id === viaje.responsableLogistica)
            setResponsableLogistica(responsable)
          } catch (error) {
            console.error('Error al cargar responsable logística:', error)
            setResponsableLogistica(null)
          }
        }

        // Cargar usuario que creó el viaje
        if (viaje.creadoPor) {
          try {
            const usuarios = await usersService.getUsers(0, 1000)
            const creador = usuarios.content?.find(u => u.id === viaje.creadoPor)
            setCreadoPorUsuario(creador)
          } catch (error) {
            console.error('Error al cargar usuario creador:', error)
            setCreadoPorUsuario(null)
          }
        }
      } catch (error) {
        console.error('Error al cargar datos adicionales:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadAdditionalData()
  }, [isOpen, viaje])

  if (!isOpen || !viaje) return null

  const estadoInfo = ESTADOS[viaje.estado] || ESTADOS.PENDIENTE
  const tipoInfo = TIPOS_VIAJE[viaje.tipo] || TIPOS_VIAJE.NORMAL
  const EstadoIcon = estadoInfo.icon

  // Calcular costo total si no viene del backend
  const calcularCostoTotal = () => {
    // Si viene del backend, usarlo
    if (viaje.costoTotal) {
      return parseFloat(viaje.costoTotal)
    }

    // Si no viene, calcularlo desde los campos individuales
    const casetas = parseFloat(viaje.casetas) || 0
    const dieselCostoTotal = parseFloat(viaje.dieselCostoTotal) || 0
    const comisionOperador = parseFloat(viaje.comisionOperador) || 0
    const gastosExtras = parseFloat(viaje.gastosExtras) || 0

    return casetas + dieselCostoTotal + comisionOperador + gastosExtras
  }

  const costoTotalCalculado = calcularCostoTotal()

  // Buscar datos usando IDs o usar objetos anidados si existen
  let operadorNombre = 'No disponible'
  let operadorLicencia = null
  if (viaje.operador?.nombre) {
    operadorNombre = viaje.operador.nombre
    operadorLicencia = viaje.operador.licenciaNumero
  } else if (viaje.idOperador) {
    const operador = operadores.find(op => op.id === viaje.idOperador)
    operadorNombre = operador?.nombre || 'No disponible'
    operadorLicencia = operador?.licenciaNumero
  }

  let clienteNombre = 'No disponible'
  let clienteRfc = null
  if (viaje.cliente?.nombre) {
    clienteNombre = viaje.cliente.nombre
    clienteRfc = viaje.cliente.rfc
  } else if (viaje.idCliente) {
    const cliente = clientes.find(cl => cl.id === viaje.idCliente)
    clienteNombre = cliente?.nombre || 'No disponible'
    clienteRfc = cliente?.rfc
  }

  let unidadModelo = 'No disponible'
  let unidadPlacas = null
  let unidadEconomico = null

  if (viaje.unidad) {
    unidadModelo = viaje.unidad.modelo || 'No disponible'
    unidadPlacas = viaje.unidad.placas
    unidadEconomico = viaje.unidad.numeroEconomico
  } else if (viaje.idUnidad) {
    const unidad = unidades.find(un => un.id === viaje.idUnidad)
    unidadModelo = unidad?.modelo || 'No disponible'
    unidadPlacas = unidad?.placas
    unidadEconomico = unidad?.numeroEconomico
  }

  // Los campos de ruta, tarifa y distancia vienen directamente en el viaje
  const distanciaKm = viaje.distanciaKm || 'N/A'
  const tarifa = viaje.tarifa || 'N/A'



  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Viaje #{viaje.id}</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del viaje</p>
              {viaje.folio && (
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Folio: <span className="font-semibold ml-1">{viaje.folio}</span>
                </p>
              )}
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-700">
              <Truck className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y Tipo */}
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${estadoInfo.color}`}>
              <EstadoIcon className="h-4 w-4 mr-2" />
              {estadoInfo.label}
            </span>
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${tipoInfo.color}`}>
              {tipoInfo.label}
            </span>
          </div>

          {/* Información de Tarifa y Distancia */}
          {(viaje.tarifa || viaje.distanciaKm) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Información de ruta
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {viaje.distanciaKm && (
                    <div>
                      <label className="text-xs font-medium text-slate-500">Distancia</label>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{distanciaKm} km</p>
                    </div>
                  )}
                  {viaje.tarifa && (
                    <div>
                      <label className="text-xs font-medium text-slate-500">Tarifa</label>
                      <p className="text-sm font-semibold text-slate-900 mt-1">${tarifa}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Asignaciones */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Asignaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <label className="text-xs font-medium text-blue-700">Operador</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {operadorNombre}
                </p>
                {operadorLicencia && (
                  <p className="text-xs text-slate-600 mt-1">Lic: {operadorLicencia}</p>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Package className="h-4 w-4 text-green-600 mr-2" />
                  <label className="text-xs font-medium text-green-700">Cliente</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {clienteNombre}
                </p>
                {clienteRfc && (
                  <p className="text-xs text-slate-600 mt-1">RFC: {clienteRfc}</p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Truck className="h-4 w-4 text-purple-600 mr-2" />
                  <label className="text-xs font-medium text-purple-700">Unidad</label>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {unidadEconomico ? `Eco: ${unidadEconomico}` : unidadModelo}
                </p>
                {unidadPlacas && (
                  <p className="text-xs text-slate-600 mt-1">Placas: {unidadPlacas}</p>
                )}
                {unidadModelo && unidadEconomico && (
                  <p className="text-xs text-slate-600">Modelo: {unidadModelo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Carga */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Información de carga
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="text-xs font-medium text-slate-500">Descripción</label>
              <p className="text-sm text-slate-900 mt-1">{viaje.cargaDescripcion}</p>
              {viaje.observaciones && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <label className="text-xs font-medium text-slate-500">Observaciones</label>
                  <p className="text-sm text-slate-900 mt-1">{viaje.observaciones}</p>
                </div>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Fechas
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Fecha de salida:</span>
                <span className="ml-2 font-semibold text-slate-900">{viaje.fechaSalida || 'No especificada'}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-600">Llegada estimada:</span>
                <span className="ml-2 font-semibold text-slate-900">{viaje.fechaEstimadaLlegada || 'No especificada'}</span>
              </div>
              {viaje.fechaRealLlegada && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-slate-600">Llegada real:</span>
                  <span className="ml-2 font-semibold text-slate-900">{viaje.fechaRealLlegada}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional del Viaje */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Información adicional
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Ruta-Comisión</label>
                  {loadingData ? (
                    <p className="text-sm text-slate-500 mt-1">Cargando...</p>
                  ) : rutaComision ? (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {rutaComision.origen} → {rutaComision.destino}
                      {rutaComision.kms && <span className="text-xs text-slate-600"> ({rutaComision.kms} km)</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {viaje.idRutaComisiones ? `ID: ${viaje.idRutaComisiones}` : 'No asignada'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Responsable Logística</label>
                  {loadingData ? (
                    <p className="text-sm text-slate-500 mt-1">Cargando...</p>
                  ) : responsableLogistica ? (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {responsableLogistica.nombre}
                      {responsableLogistica.email && <span className="text-xs text-slate-600 block">{responsableLogistica.email}</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {viaje.responsableLogistica ? `ID: ${viaje.responsableLogistica}` : 'No asignado'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Creado por</label>
                  {loadingData ? (
                    <p className="text-sm text-slate-500 mt-1">Cargando...</p>
                  ) : creadoPorUsuario ? (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {creadoPorUsuario.nombre}
                      {creadoPorUsuario.email && <span className="text-xs text-slate-600 block">{creadoPorUsuario.email}</span>}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {viaje.creadoPor ? `ID: ${viaje.creadoPor}` : 'N/A'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Comisión Operador</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {viaje.comisionOperador ? `$${viaje.comisionOperador}` : 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Costos y Gastos */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Costos y gastos
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500">Casetas</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {viaje.casetas ? `$${viaje.casetas}` : 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Diesel (litros)</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {viaje.dieselLitros ? `${viaje.dieselLitros} L` : 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Gastos Extras</label>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {viaje.gastosExtras ? `$${viaje.gastosExtras}` : 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Costo Total</label>
                  <p className="text-lg font-bold text-blue-600">
                    {costoTotalCalculado > 0 
                      ? `$${costoTotalCalculado.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                      : '$0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Evidencia (archivo o imagen) */}
          {viaje.evidenciaUrl && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Evidencia del viaje
              </h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                {/* Verificar si es imagen o documento */}
                {viaje.evidenciaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  // Mostrar imagen
                  <>
                    <div className="relative w-full h-64 mb-3">
                      <Image
                        src={viaje.evidenciaUrl}
                        alt={`Evidencia del viaje #${viaje.id}`}
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    </div>
                    <a
                      href={viaje.evidenciaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver imagen completa</span>
                    </a>
                  </>
                ) : (
                  // Mostrar documento
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <FileText className="h-16 w-16 text-slate-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-900 mb-1">Documento adjunto</p>
                      <p className="text-xs text-slate-500">
                        {viaje.evidenciaUrl.match(/\.pdf$/i) && 'Documento PDF'}
                        {viaje.evidenciaUrl.match(/\.(doc|docx)$/i) && 'Documento Word'}
                        {viaje.evidenciaUrl.match(/\.(xls|xlsx)$/i) && 'Hoja de cálculo Excel'}
                        {viaje.evidenciaUrl.match(/\.(txt|csv)$/i) && 'Archivo de texto'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <a
                        href={viaje.evidenciaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver archivo</span>
                      </a>
                      <a
                        href={viaje.evidenciaUrl}
                        download
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}


export default ViewViajeModal
