'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  MapPin,
  Calendar,
  Truck,
  DollarSign,
  Package,
  User,
  Fuel
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'

const EditBitacoraModal = ({ isOpen, onClose, onSave, bitacora, viajes, operadores, clientes, unidades }) => {
  const [formData, setFormData] = useState({
    viajeId: '',
    folio: '',
    clienteId: '',
    origen: '',
    destino: '',
    fechaCarga: '',
    fechaEntrega: '',
    horaEntrega: '',
    operadorId: '',
    unidadId: '',
    caja: '',
    casetas: '',
    dieselLitros: '',
    precioDiesel: '', // Nuevo campo para precio por litro
    comisionOperador: '',
    gastosExtras: '',
    costoTotal: '',
    comentarios: '',
    numeroFactura: '',
    creadoPor: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [costoDiesel, setCostoDiesel] = useState(0) // Estado para mostrar el cálculo

  // Obtener usuario autenticado al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const user = authService.getUser()
      setCurrentUser(user)
    }
  }, [isOpen])

  // Calcular costo de diesel cuando cambien litros o precio
  useEffect(() => {
    const litros = parseFloat(formData.dieselLitros) || 0
    const precio = parseFloat(formData.precioDiesel) || 0
    const costo = litros * precio
    setCostoDiesel(costo)
  }, [formData.dieselLitros, formData.precioDiesel])

  useEffect(() => {
    if (bitacora) {
      // El campo dieselLitros en el backend almacena el COSTO TOTAL en pesos
      // Necesitamos calcular los litros reales si tenemos el precio
      const costoDieselTotal = parseFloat(bitacora.dieselLitros) || 0
      const precioDelDiesel = parseFloat(bitacora.precioDiesel) || 0

      // Si tenemos precio, calculamos los litros; si no, dejamos el costo como litros (para retrocompatibilidad)
      const litrosCalculados = precioDelDiesel > 0 ? (costoDieselTotal / precioDelDiesel) : costoDieselTotal

      setFormData({
        viajeId: bitacora.viajeId || '',
        folio: bitacora.folio || '',
        clienteId: bitacora.clienteId || '',
        origen: bitacora.origen || '',
        destino: bitacora.destino || '',
        fechaCarga: bitacora.fechaCarga || '',
        fechaEntrega: bitacora.fechaEntrega || '',
        horaEntrega: bitacora.horaEntrega || '',
        operadorId: bitacora.operadorId || '',
        unidadId: bitacora.unidadId || '',
        caja: bitacora.caja || '',
        casetas: bitacora.casetas || '',
        dieselLitros: litrosCalculados.toFixed(2), // Mostrar litros reales calculados
        precioDiesel: precioDelDiesel || '', // Cargar precio diesel existente
        comisionOperador: bitacora.comisionOperador || '',
        gastosExtras: bitacora.gastosExtras || '',
        costoTotal: bitacora.costoTotal || '',
        comentarios: bitacora.comentarios || '',
        numeroFactura: bitacora.numeroFactura || '',
        creadoPor: bitacora.creadoPor || ''
      })
    }
  }, [bitacora])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentUser?.id) {
      toast.error('No se pudo obtener el usuario autenticado')
      return
    }

    setIsLoading(true)
    try {
      // Calcular el costo total del diesel (litros × precio)
      const litros = parseFloat(formData.dieselLitros) || 0
      const precio = parseFloat(formData.precioDiesel) || 0
      const costoDieselTotal = litros * precio

      const dataToSend = {
        ...formData,
        viajeId: parseInt(formData.viajeId),
        clienteId: parseInt(formData.clienteId),
        operadorId: parseInt(formData.operadorId),
        unidadId: parseInt(formData.unidadId),
        casetas: parseFloat(formData.casetas) || 0,
        dieselLitros: costoDieselTotal, // Enviar el costo total del diesel (litros × precio)
        comisionOperador: parseFloat(formData.comisionOperador) || 0,
        gastosExtras: parseFloat(formData.gastosExtras) || 0,
        costoTotal: parseFloat(formData.costoTotal) || 0,
        creadoPor: currentUser.id // Usar el ID del usuario autenticado
      }
      await onSave(bitacora.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving bitácora:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar bitácora de viaje</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del viaje</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Información General */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Viaje *
                  </label>
                  <select
                    value={formData.viajeId}
                    onChange={(e) => setFormData({ ...formData, viajeId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="">Selecciona un viaje</option>
                    {viajes && viajes.map((viaje) => (
                      <option key={viaje.id} value={viaje.id}>
                        #{viaje.id} - {viaje.origen} → {viaje.destino}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Folio *
                  </label>
                  <input
                    type="text"
                    value={formData.folio}
                    onChange={(e) => setFormData({ ...formData, folio: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cliente *
                  </label>
                  <select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientes && clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    value={formData.numeroFactura}
                    onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Ruta */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Ruta
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
              </div>
            </div>

            {/* Fechas y Horarios */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Fechas y Horarios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Carga *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaCarga}
                    onChange={(e) => setFormData({ ...formData, fechaCarga: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora de Entrega *
                  </label>
                  <input
                    type="time"
                    value={formData.horaEntrega}
                    onChange={(e) => setFormData({ ...formData, horaEntrega: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Recursos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Operador *
                  </label>
                  <select
                    value={formData.operadorId}
                    onChange={(e) => setFormData({ ...formData, operadorId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="">Selecciona un operador</option>
                    {operadores && operadores.map((operador) => (
                      <option key={operador.id} value={operador.id}>
                        {operador.nombre} - {operador.licencia}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unidad *
                  </label>
                  <select
                    value={formData.unidadId}
                    onChange={(e) => setFormData({ ...formData, unidadId: e.target.value })}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Caja *
                  </label>
                  <input
                    type="text"
                    value={formData.caja}
                    onChange={(e) => setFormData({ ...formData, caja: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Costos */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Costos y Gastos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Casetas ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.casetas}
                    onChange={(e) => setFormData({ ...formData, casetas: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diesel (Litros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.dieselLitros}
                    onChange={(e) => setFormData({ ...formData, dieselLitros: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Precio Diesel ($/Litro)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precioDiesel}
                    onChange={(e) => setFormData({ ...formData, precioDiesel: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="24.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo Total Diesel (calculado)
                  </label>
                  <div className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-semibold flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-amber-600" />
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN'
                    }).format(costoDiesel)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.dieselLitros && formData.precioDiesel
                      ? `${formData.dieselLitros} L × $${formData.precioDiesel} = $${costoDiesel.toFixed(2)}`
                      : 'Ingresa litros y precio para calcular'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comisión Operador ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comisionOperador}
                    onChange={(e) => setFormData({ ...formData, comisionOperador: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gastos Extras ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.gastosExtras}
                    onChange={(e) => setFormData({ ...formData, gastosExtras: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo Total ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costoTotal}
                    onChange={(e) => setFormData({ ...formData, costoTotal: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Adicional */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Información Adicional
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Comentarios
                  </label>
                  <textarea
                    value={formData.comentarios}
                    onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    rows={3}
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
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
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
              {isLoading ? 'Actualizando...' : 'Actualizar bitácora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBitacoraModal