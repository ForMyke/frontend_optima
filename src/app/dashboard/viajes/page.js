'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  User,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Filter,
  Camera,
  Upload,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { viajesService } from '@/app/services/viajesService'
import { operadoresService } from '@/app/services/operadoresService'
import { clientsService } from '@/app/services/clientsService'
import { unidadesService } from '@/app/services/unidadesService'
import { authService } from '@/app/services/authService'
import Image from 'next/image'

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EN_CURSO: { label: 'En curso', color: 'bg-blue-100 text-blue-800', icon: Navigation },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle }
}

const TIPOS_VIAJE = {
  LOCAL: { label: 'Local', color: 'bg-purple-100 text-purple-800' },
  FORANEO: { label: 'Foráneo', color: 'bg-indigo-100 text-indigo-800' },
  INTERNACIONAL: { label: 'Internacional', color: 'bg-pink-100 text-pink-800' }
}

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
)

const ViajeCard = ({ viaje, onEdit, onDelete, onViewDetails, operadores, clientes, unidades, onEstadoChange }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const estadoInfo = ESTADOS[viaje.estado] || ESTADOS.PENDIENTE
  const tipoInfo = TIPOS_VIAJE[viaje.tipoViaje] || TIPOS_VIAJE.LOCAL
  const EstadoIcon = estadoInfo.icon

  // Buscar operador en el array si solo tenemos el ID
  let operadorNombre = viaje.operador?.nombre
  if (!operadorNombre && (viaje.idOperador || viaje.operadorId)) {
    const operadorId = viaje.idOperador || viaje.operadorId
    const operadorEncontrado = operadores?.find(op => op.id === operadorId)
    operadorNombre = operadorEncontrado?.nombre
  }

  // Buscar cliente en el array si solo tenemos el ID
  let clienteNombre = viaje.cliente?.nombre
  if (!clienteNombre && (viaje.idCliente || viaje.clienteId)) {
    const clienteId = viaje.idCliente || viaje.clienteId
    const clienteEncontrado = clientes?.find(cl => cl.id === clienteId)
    clienteNombre = clienteEncontrado?.nombre
  }

  // Buscar unidad en el array si solo tenemos el ID
  let unidadNumero = viaje.unidad?.numeroEconomico
  if (!unidadNumero && (viaje.idUnidad || viaje.unidadId)) {
    const unidadId = viaje.idUnidad || viaje.unidadId
    const unidadEncontrada = unidades?.find(un => un.id === unidadId)
    unidadNumero = unidadEncontrada?.numeroEconomico || unidadEncontrada?.placas
  }

  const handleEstadoChange = (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado !== viaje.estado) {
      onEstadoChange(viaje, nuevoEstado)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-slate-900">Viaje #{viaje.id}</h3>
              </div>
              <div className="flex items-center text-sm text-slate-500 space-x-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{viaje.origen} → {viaje.destino}</span>
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                <button
                  onClick={() => {
                    onViewDetails(viaje)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(viaje)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-3 text-slate-400" />
                  Editar
                </button>
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={() => {
                    onDelete(viaje)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Select de estado - NUEVO */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-2">
            Estado del viaje
          </label>
          <select
            value={viaje.estado}
            onChange={handleEstadoChange}
            className={`w-full px-3 py-2 rounded-lg border-2 transition-all font-medium text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${viaje.estado === 'PENDIENTE' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
              viaje.estado === 'EN_CURSO' ? 'border-blue-200 bg-blue-50 text-blue-800' :
                viaje.estado === 'COMPLETADO' ? 'border-green-200 bg-green-50 text-green-800' :
                  'border-red-200 bg-red-50 text-red-800'
              }`}
          >
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_CURSO">En curso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Operador:
            </span>
            <span className="font-medium text-slate-900">
              {operadorNombre || 'No asignado'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Package className="h-3.5 w-3.5 mr-1.5" />
              Cliente:
            </span>
            <span className="font-medium text-slate-900">
              {clienteNombre || 'No asignado'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center">
              <Truck className="h-3.5 w-3.5 mr-1.5" />
              Unidad:
            </span>
            <span className="font-medium text-slate-900">
              {unidadNumero || 'No asignada'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {viaje.fechaSalida}
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoInfo.color}`}>
            {tipoInfo.label}
          </span>
        </div>
      </div>
    </div>
  )
}

const CreateViajeModal = ({ isOpen, onClose, onSave, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    idUnidad: '',
    idOperador: '',
    idCliente: '',
    origen: '',
    destino: '',
    fechaSalida: '',
    fechaEstimadaLlegada: '',
    estado: 'PENDIENTE',
    cargaDescripcion: '',
    observaciones: '',
    tarifa: '',
    distanciaKm: '',
    tipo: 'LOCAL',
    responsableLogistica: '',
    evidenciaUrl: '',
    creadoPor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
      if (user?.id) {
        setFormData(prev => ({
          ...prev,
          creadoPor: user.id.toString(),
          responsableLogistica: user.id.toString()
        }))
      }
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.id) {
      toast.error('No se pudo obtener el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      await onSave({
        idUnidad: parseInt(formData.idUnidad),
        idOperador: parseInt(formData.idOperador),
        idCliente: parseInt(formData.idCliente),
        origen: formData.origen,
        destino: formData.destino,
        fechaSalida: formData.fechaSalida,
        fechaEstimadaLlegada: formData.fechaEstimadaLlegada,
        estado: formData.estado,
        cargaDescripcion: formData.cargaDescripcion,
        observaciones: formData.observaciones || null,
        tarifa: parseFloat(formData.tarifa),
        distanciaKm: parseFloat(formData.distanciaKm),
        tipo: formData.tipo,
        responsableLogistica: parseInt(formData.responsableLogistica),
        evidenciaUrl: formData.evidenciaUrl || null,
        creadoPor: currentUser.id
      })
      setFormData({
        idUnidad: '',
        idOperador: '',
        idCliente: '',
        origen: '',
        destino: '',
        fechaSalida: '',
        fechaEstimadaLlegada: '',
        estado: 'PENDIENTE',
        cargaDescripcion: '',
        observaciones: '',
        tarifa: '',
        distanciaKm: '',
        tipo: 'LOCAL',
        responsableLogistica: '',
        evidenciaUrl: '',
        creadoPor: ''
      })
      onClose()
    } catch (error) {
      console.error('Error saving viaje:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Registra un nuevo viaje con todos sus detalles</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección: Asignaciones */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Asignaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Operador *
                </label>
                <select
                  value={formData.idOperador}
                  onChange={(e) => setFormData({ ...formData, idOperador: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un operador</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} - {op.licencia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.idCliente}
                  onChange={(e) => setFormData({ ...formData, idCliente: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unidad *
                </label>
                <select
                  value={formData.idUnidad}
                  onChange={(e) => setFormData({ ...formData, idUnidad: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona una unidad</option>
                  {unidades && unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.numeroEconomico} - {unidad.placas}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Ruta */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Ruta del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="Ej: CDMX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="Ej: Guadalajara"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distancia (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanciaKm}
                  onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="550.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de viaje *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="LOCAL">Local</option>
                  <option value="FORANEO">Foráneo</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Fechas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Fechas del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de salida *
                </label>
                <input
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha estimada de llegada *
                </label>
                <input
                  type="date"
                  value={formData.fechaEstimadaLlegada}
                  onChange={(e) => setFormData({ ...formData, fechaEstimadaLlegada: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Carga y Costos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Carga y Tarifas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción de la carga *
                </label>
                <textarea
                  value={formData.cargaDescripcion}
                  onChange={(e) => setFormData({ ...formData, cargaDescripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="Descripción detallada de la carga..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tarifa}
                  onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="4500.50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Información Adicional */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Información Adicional
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="Entrega prioritaria, cuidado con carga frágil, etc..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de evidencia (opcional)
                </label>
                <input
                  type="url"
                  value={formData.evidenciaUrl}
                  onChange={(e) => setFormData({ ...formData, evidenciaUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="https://ejemplo.com/evidencia.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registrado por
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium">{currentUser?.nombre || 'Cargando...'}</span>
                    <span className="ml-2 text-sm text-slate-500">({currentUser?.email})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Usuario autenticado actualmente</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !currentUser}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Crear viaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const EditViajeModal = ({ isOpen, onClose, onSave, viaje, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    idUnidad: '',
    idOperador: '',
    idCliente: '',
    origen: '',
    destino: '',
    fechaSalida: '',
    fechaEstimadaLlegada: '',
    estado: 'PENDIENTE',
    cargaDescripcion: '',
    observaciones: '',
    tarifa: '',
    distanciaKm: '',
    tipo: 'LOCAL',
    responsableLogistica: '',
    evidenciaUrl: '',
    creadoPor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
    }
  }, [isOpen])

  useEffect(() => {
    if (viaje) {
      setFormData({
        idUnidad: viaje.idUnidad || viaje.unidadId || '',
        idOperador: viaje.idOperador || viaje.operadorId || '',
        idCliente: viaje.idCliente || viaje.clienteId || '',
        origen: viaje.origen || '',
        destino: viaje.destino || '',
        fechaSalida: viaje.fechaSalida || '',
        fechaEstimadaLlegada: viaje.fechaEstimadaLlegada || '',
        estado: viaje.estado || 'PENDIENTE',
        cargaDescripcion: viaje.cargaDescripcion || '',
        observaciones: viaje.observaciones || '',
        tarifa: viaje.tarifa || '',
        distanciaKm: viaje.distanciaKm || '',
        tipo: viaje.tipo || viaje.tipoViaje || 'LOCAL',
        responsableLogistica: viaje.responsableLogistica || '',
        evidenciaUrl: viaje.evidenciaUrl || '',
        creadoPor: viaje.creadoPor || ''
      })
    }
  }, [viaje])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.id) {
      toast.error('No se pudo obtener el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      await onSave(viaje.id, {
        idUnidad: parseInt(formData.idUnidad),
        idOperador: parseInt(formData.idOperador),
        idCliente: parseInt(formData.idCliente),
        origen: formData.origen,
        destino: formData.destino,
        fechaSalida: formData.fechaSalida,
        fechaEstimadaLlegada: formData.fechaEstimadaLlegada,
        estado: formData.estado,
        cargaDescripcion: formData.cargaDescripcion,
        observaciones: formData.observaciones || null,
        tarifa: parseFloat(formData.tarifa),
        distanciaKm: parseFloat(formData.distanciaKm),
        tipo: formData.tipo,
        responsableLogistica: parseInt(formData.responsableLogistica),
        evidenciaUrl: formData.evidenciaUrl || null,
        creadoPor: currentUser.id
      })
      onClose()
    } catch (error) {
      console.error('Error saving viaje:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">Editar viaje #{viaje?.id}</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sección: Asignaciones */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Asignaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Operador *
                </label>
                <select
                  value={formData.idOperador}
                  onChange={(e) => setFormData({ ...formData, idOperador: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un operador</option>
                  {operadores.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre} - {op.licencia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.idCliente}
                  onChange={(e) => setFormData({ ...formData, idCliente: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unidad *
                </label>
                <select
                  value={formData.idUnidad}
                  onChange={(e) => setFormData({ ...formData, idUnidad: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona una unidad</option>
                  {unidades && unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.numeroEconomico} - {unidad.placas}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Ruta */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Ruta del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  value={formData.origen}
                  onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  value={formData.destino}
                  onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distancia (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanciaKm}
                  onChange={(e) => setFormData({ ...formData, distanciaKm: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de viaje *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="LOCAL">Local</option>
                  <option value="FORANEO">Foráneo</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Fechas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Fechas del Viaje
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha de salida *
                </label>
                <input
                  type="date"
                  value={formData.fechaSalida}
                  onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha estimada de llegada *
                </label>
                <input
                  type="date"
                  value={formData.fechaEstimadaLlegada}
                  onChange={(e) => setFormData({ ...formData, fechaEstimadaLlegada: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Carga y Costos */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Carga y Tarifas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción de la carga *
                </label>
                <textarea
                  value={formData.cargaDescripcion}
                  onChange={(e) => setFormData({ ...formData, cargaDescripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tarifa}
                  onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_CURSO">En curso</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección: Información Adicional */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
              Información Adicional
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de evidencia (opcional)
                </label>
                <input
                  type="url"
                  value={formData.evidenciaUrl}
                  onChange={(e) => setFormData({ ...formData, evidenciaUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="https://ejemplo.com/evidencia.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Actualizado por
                </label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium">{currentUser?.nombre || 'Cargando...'}</span>
                    <span className="ml-2 text-sm text-slate-500">({currentUser?.email})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Usuario autenticado actualmente</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !currentUser}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar viaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViewViajeModal = ({ isOpen, onClose, viaje }) => {
  if (!isOpen || !viaje) return null

  const estadoInfo = ESTADOS[viaje.estado] || ESTADOS.PENDIENTE
  const tipoInfo = TIPOS_VIAJE[viaje.tipo || viaje.tipoViaje] || TIPOS_VIAJE.LOCAL
  const EstadoIcon = estadoInfo.icon

  // Obtener información de operador - SIEMPRE mostrar el nombre
  const operadorNombre = viaje.operador?.nombre || 'No disponible'
  const operadorLicencia = viaje.operador?.licenciaNumero || viaje.operador?.licencia

  // Obtener información de cliente - SIEMPRE mostrar el nombre
  const clienteNombre = viaje.cliente?.nombre || 'No disponible'
  const clienteRfc = viaje.cliente?.rfc

  // Obtener información de unidad - SIEMPRE mostrar el número económico
  const unidadNumero = viaje.unidad?.modelo || 'No disponible'
  const unidadPlacas = viaje.unidad?.placas

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Viaje #{viaje.id}</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del viaje</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
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

          {/* Ruta */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Información de ruta
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500">Origen</label>
                  <p className="text-base font-semibold text-slate-900 mt-1">{viaje.origen}</p>
                </div>
                <div className="flex-shrink-0">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <label className="text-xs font-medium text-slate-500">Destino</label>
                  <p className="text-base font-semibold text-slate-900 mt-1">{viaje.destino}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-500">Distancia</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{viaje.distanciaKm} km</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Tarifa</label>
                    <p className="text-sm font-semibold text-slate-900 mt-1">${viaje.tarifa}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                  {unidadNumero}
                </p>
                {unidadPlacas && (
                  <p className="text-xs text-slate-600 mt-1">Placas: {unidadPlacas}</p>
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

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, viaje }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar viaje</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar el <span className="font-semibold">Viaje #{viaje?.id}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-slate-600">
              <strong>Ruta:</strong> {viaje?.origen} → {viaje?.destino}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const EvidenciaModal = ({ isOpen, onClose, onSave, viaje, nuevoEstado }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [comentarios, setComentarios] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Limpiar preview cuando se cierre el modal
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }

      setSelectedFile(file)

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Por favor selecciona una imagen')
      return
    }

    setUploading(true)
    try {
      // Aquí normalmente subirías la imagen a un servicio como S3, Cloudinary, etc.
      // Por ahora simulamos la URL
      const evidenciaUrl = previewUrl // En producción sería la URL del servidor

      await onSave({
        evidenciaUrl,
        comentarios,
        nuevoEstado
      })

      toast.success('Evidencia cargada exitosamente')
      handleClose()
    } catch (error) {
      toast.error('Error al cargar la evidencia')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setComentarios('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  const estadoInfo = ESTADOS[nuevoEstado] || ESTADOS.PENDIENTE
  const EstadoIcon = estadoInfo.icon

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Subir evidencia fotográfica</h2>
              <p className="text-sm text-slate-600 mt-1">
                Viaje #{viaje?.id} - Cambio a estado:
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                  <EstadoIcon className="h-3 w-3 mr-1" />
                  {estadoInfo.label}
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Área de carga de imagen */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Fotografía de evidencia *
            </label>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
              >
                <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium mb-1">Click para seleccionar una imagen</p>
                <p className="text-sm text-slate-500">PNG, JPG o JPEG (máx. 5MB)</p>
              </div>
            ) : (
              <div className="relative">
                <Image
                  height={64}
                  width={64}
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl border-2 border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Cambiar imagen</span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              rows={4}
              placeholder="Agrega notas o comentarios sobre este cambio de estado..."
            />
          </div>

          {/* Información del viaje */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Información del viaje</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Origen:</span>
                <span className="ml-2 font-medium text-slate-900">{viaje?.origen}</span>
              </div>
              <div>
                <span className="text-slate-500">Destino:</span>
                <span className="ml-2 font-medium text-slate-900">{viaje?.destino}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Subir evidencia</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViajesPage = () => {
  const [viajes, setViajes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [clientes, setClientes] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('TODOS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false)
  const [selectedViaje, setSelectedViaje] = useState(null)
  const [viajeToDelete, setViajeToDelete] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enCurso: 0,
    completados: 0
  })

  const loadViajes = async () => {
    try {
      let response
      if (estadoFilter === 'TODOS') {
        response = await viajesService.getViajes(0, 100)
      } else {
        response = await viajesService.getViajesByEstado(estadoFilter, 0, 100)
      }

      const viajesData = response.content || []
      setViajes(viajesData)

      // Calcular estadísticas
      const pendientes = viajesData.filter(v => v.estado === 'PENDIENTE').length
      const enCurso = viajesData.filter(v => v.estado === 'EN_CURSO').length
      const completados = viajesData.filter(v => v.estado === 'COMPLETADO').length

      setStats({
        total: response.totalElements || viajesData.length,
        pendientes,
        enCurso,
        completados
      })
    } catch (error) {
      console.error('Error loading viajes:', error)
      toast.error('Error al cargar viajes')
    }
  }

  const loadOperadores = async () => {
    try {
      const response = await operadoresService.getOperadores(0, 100)
      setOperadores(response.content || [])
    } catch (error) {
      console.error('Error loading operadores:', error)
    }
  }

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      setClientes(response.content || [])
    } catch (error) {
      console.error('Error loading clientes:', error)
    }
  }

  const loadUnidades = async () => {
    try {
      const response = await unidadesService.getAll()
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setUnidades(data)
    } catch (error) {
      console.error('Error loading unidades:', error)
      setUnidades([])
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          loadViajes(),
          loadOperadores(),
          loadClientes(),
          loadUnidades()
        ])
      } catch (error) {
        console.error('Error loading initial data:', error)
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [estadoFilter])

  const handleCreateViaje = async (viajeData) => {
    try {
      await viajesService.createViaje(viajeData)
      toast.success('Viaje creado exitosamente')
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al crear viaje')
      throw error
    }
  }

  const handleEditViaje = async (viaje) => {
    try {
      const fullViaje = await viajesService.getViajeById(viaje.id)
      setSelectedViaje(fullViaje)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del viaje')
    }
  }

  const handleUpdateViaje = async (viajeId, viajeData) => {
    try {
      await viajesService.updateViaje(viajeId, viajeData)
      toast.success('Viaje actualizado exitosamente')
      setShowEditModal(false)
      setSelectedViaje(null)
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar viaje')
      throw error
    }
  }

  const handleDeleteViaje = async (viaje) => {
    setViajeToDelete(viaje)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!viajeToDelete) return

    try {
      await viajesService.deleteViaje(viajeToDelete.id)
      toast.success(`Viaje #${viajeToDelete.id} eliminado`)
      setShowDeleteModal(false)
      setViajeToDelete(null)
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar viaje')
    }
  }

  const handleViewDetails = async (viaje) => {
    try {
      const fullViaje = await viajesService.getViajeById(viaje.id)

      // Si la API individual solo retorna IDs, buscar la información completa
      let viajeCompleto = { ...fullViaje }

      // Buscar operador si solo tenemos el ID
      if (fullViaje.idOperador && !fullViaje.operador) {
        const operadorEncontrado = operadores.find(op => op.id === fullViaje.idOperador)
        if (operadorEncontrado) {
          viajeCompleto.operador = operadorEncontrado
        }
      }

      // Buscar cliente si solo tenemos el ID
      if (fullViaje.idCliente && !fullViaje.cliente) {
        const clienteEncontrado = clientes.find(cl => cl.id === fullViaje.idCliente)
        if (clienteEncontrado) {
          viajeCompleto.cliente = clienteEncontrado
        }
      }

      // Buscar unidad si solo tenemos el ID
      if (fullViaje.idUnidad && !fullViaje.unidad) {
        const unidadEncontrada = unidades.find(un => un.id === fullViaje.idUnidad)
        if (unidadEncontrada) {
          viajeCompleto.unidad = unidadEncontrada
        }
      }

      setSelectedViaje(viajeCompleto)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del viaje')
    }
  }

  const handleEstadoChange = (viaje, nuevoEstado) => {
    setSelectedViaje(viaje)
    setNuevoEstado(nuevoEstado)
    setShowEvidenciaModal(true)
  }

  const handleSaveEvidencia = async ({ evidenciaUrl, comentarios, nuevoEstado }) => {
    try {
      await viajesService.updateViaje(selectedViaje.id, {
        ...selectedViaje,
        evidenciaUrl,
        comentarios,
        estado: nuevoEstado
      })
      toast.success('Estado del viaje actualizado')
      setShowEvidenciaModal(false)
      setSelectedViaje(null)
      setNuevoEstado(null)
      loadViajes()
    } catch (error) {
      toast.error('Error al actualizar el estado del viaje')
      console.error(error)
    }
  }

  const filteredViajes = viajes.filter(viaje => {
    const matchesSearch =
      viaje.origen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.operador?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.id?.toString().includes(searchTerm)

    return matchesSearch
  })

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de viajes</h1>
            <p className="text-slate-600 mt-2">Administra los viajes y rutas de transporte</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo viaje</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de viajes"
          value={stats.total}
          icon={Truck}
          color="bg-blue-600"
          description="Viajes registrados"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-yellow-600"
          description="Por iniciar"
        />
        <StatCard
          title="En curso"
          value={stats.enCurso}
          icon={Navigation}
          color="bg-indigo-600"
          description="En tránsito"
        />
        <StatCard
          title="Completados"
          value={stats.completados}
          icon={CheckCircle}
          color="bg-green-600"
          description="Finalizados"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por origen, destino, operador, cliente o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_CURSO">En curso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Viajes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredViajes.map((viaje) => (
          <ViajeCard
            key={viaje.id}
            viaje={viaje}
            onEdit={handleEditViaje}
            onDelete={handleDeleteViaje}
            onViewDetails={handleViewDetails}
            operadores={operadores}
            onEstadoChange={handleEstadoChange}
            clientes={clientes}
            unidades={unidades}
          />
        ))}
      </div>

      {filteredViajes.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron viajes</p>
        </div>
      )}

      {/* Modals */}
      <CreateViajeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateViaje}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <EditViajeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedViaje(null)
        }}
        onSave={handleUpdateViaje}
        viaje={selectedViaje}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ViewViajeModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedViaje(null)
        }}
        viaje={selectedViaje}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setViajeToDelete(null)
        }}
        onConfirm={confirmDelete}
        viaje={viajeToDelete}
      />

      <EvidenciaModal
        isOpen={showEvidenciaModal}
        onClose={() => {
          setShowEvidenciaModal(false)
          setSelectedViaje(null)
          setNuevoEstado(null)
        }}
        onSave={handleSaveEvidencia}
        viaje={selectedViaje}
        nuevoEstado={nuevoEstado}
      />
    </div>
  )
}

export default ViajesPage;