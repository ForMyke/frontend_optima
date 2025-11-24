import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { authService } from '@/app/services/authService'

const CATEGORIAS_GASTO = ['REFACCIONES', 'SERVICIO', 'MANO_OBRA', 'OTROS']

const CreateMantenimientoModal = ({ isOpen, onClose, onSave, unidades, refacciones, proveedores }) => {
  const [formData, setFormData] = useState({
    unidadId: '',
    tipo: 'PREVENTIVO',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    kilometraje: '',
    proveedorId: null,
    realizadoPor: '',
    refaccionesUsadas: [],
    gastosNuevos: []
  })

  const [nuevoGasto, setNuevoGasto] = useState({
    categoria: 'SERVICIO',
    descripcion: '',
    monto: '',
    refaccionId: null,
    cantidad: '',
    costoUnitario: ''
  })

  const [nuevaRefaccionUsada, setNuevaRefaccionUsada] = useState({
    refaccionId: '',
    cantidad: '',
    costoUnitario: ''
  })

  const [mostrarRefaccionesUsadas, setMostrarRefaccionesUsadas] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        unidadId: '',
        tipo: 'PREVENTIVO',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: '',
        kilometraje: '',
        proveedorId: null,
        realizadoPor: '',
        refaccionesUsadas: [],
        gastosNuevos: []
      })
      setNuevoGasto({
        categoria: 'SERVICIO',
        descripcion: '',
        monto: '',
        refaccionId: null,
        cantidad: '',
        costoUnitario: ''
      })
      setNuevaRefaccionUsada({
        refaccionId: '',
        cantidad: '',
        costoUnitario: ''
      })
      setMostrarRefaccionesUsadas(false)
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGastoChange = (e) => {
    const { name, value } = e.target
    setNuevoGasto(prev => {
      const updated = {
        ...prev,
        [name]: value
      }

      if (name === 'cantidad' || name === 'costoUnitario') {
        const cantidad = parseFloat(updated.cantidad) || 0
        const costoUnitario = parseFloat(updated.costoUnitario) || 0
        if (cantidad > 0 && costoUnitario > 0) {
          updated.monto = (cantidad * costoUnitario).toFixed(2)
        }
      }

      return updated
    })
  }

  const handleRefaccionUsadaChange = (e) => {
    const { name, value } = e.target
    setNuevaRefaccionUsada(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const agregarRefaccionUsada = () => {
    if (!nuevaRefaccionUsada.refaccionId || !nuevaRefaccionUsada.cantidad || !nuevaRefaccionUsada.costoUnitario) {
      return
    }

    const refaccionToAdd = {
      refaccionId: parseInt(nuevaRefaccionUsada.refaccionId),
      cantidad: parseInt(nuevaRefaccionUsada.cantidad),
      costoUnitario: parseFloat(nuevaRefaccionUsada.costoUnitario)
    }

    setFormData(prev => ({
      ...prev,
      refaccionesUsadas: [...prev.refaccionesUsadas, refaccionToAdd]
    }))

    setNuevaRefaccionUsada({
      refaccionId: '',
      cantidad: '',
      costoUnitario: ''
    })
  }

  const eliminarRefaccionUsada = (index) => {
    setFormData(prev => ({
      ...prev,
      refaccionesUsadas: prev.refaccionesUsadas.filter((_, i) => i !== index)
    }))
  }

  const agregarGasto = () => {
    if (!nuevoGasto.descripcion || !nuevoGasto.monto) {
      return
    }

    const gastoToAdd = {
      categoria: nuevoGasto.categoria,
      descripcion: nuevoGasto.descripcion,
      monto: parseFloat(nuevoGasto.monto)
    }

    if (nuevoGasto.refaccionId) {
      gastoToAdd.refaccionId = parseInt(nuevoGasto.refaccionId)
    }
    if (nuevoGasto.cantidad) {
      gastoToAdd.cantidad = parseInt(nuevoGasto.cantidad)
    }
    if (nuevoGasto.costoUnitario) {
      gastoToAdd.costoUnitario = parseFloat(nuevoGasto.costoUnitario)
    }

    setFormData(prev => ({
      ...prev,
      gastosNuevos: [...prev.gastosNuevos, gastoToAdd]
    }))

    setNuevoGasto({
      categoria: 'SERVICIO',
      descripcion: '',
      monto: '',
      refaccionId: null,
      cantidad: '',
      costoUnitario: ''
    })
  }

  const eliminarGasto = (index) => {
    setFormData(prev => ({
      ...prev,
      gastosNuevos: prev.gastosNuevos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const user = authService.getUser()

      const dataToSend = {
        unidadId: parseInt(formData.unidadId),
        tipo: formData.tipo,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        kilometraje: formData.kilometraje ? parseInt(formData.kilometraje) : null,
        proveedorId: formData.proveedorId ? parseInt(formData.proveedorId) : null,
        realizadoPor: formData.realizadoPor,
        creadoPor: user?.id || 1,
        gastosNuevos: formData.gastosNuevos
      }

      if (formData.refaccionesUsadas.length > 0) {
        dataToSend.refaccionesUsadas = formData.refaccionesUsadas
      }

      await onSave(dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setSaving(false)
    }
  }

  const costoTotalGastos = formData.gastosNuevos.reduce((sum, g) => sum + parseFloat(g.monto), 0)
  const costoTotalRefaccionesUsadas = formData.refaccionesUsadas.reduce((sum, r) => sum + (r.cantidad * r.costoUnitario), 0)

  const getRefaccionNombre = (refaccionId) => {
    const refaccion = refacciones?.find(r => r.id === refaccionId)
    return refaccion ? refaccion.nombre : 'Refacción'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Nuevo mantenimiento</h2>
              <p className="text-sm text-slate-600 mt-1">Registra un nuevo mantenimiento</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unidad *
              </label>
              <select
                name="unidadId"
                value={formData.unidadId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar unidad</option>
                {unidades.map(unidad => (
                  <option key={unidad.id} value={unidad.id}>
                    {unidad.numeroEconomico} - {unidad.marca} {unidad.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PREVENTIVO">Preventivo</option>
                <option value="CORRECTIVO">Correctivo</option>
                <option value="PREDICTIVO">Predictivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kilometraje
              </label>
              <input
                type="number"
                name="kilometraje"
                value={formData.kilometraje}
                onChange={handleChange}
                placeholder="150000"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proveedor
              </label>
              <select
                name="proveedorId"
                value={formData.proveedorId || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin proveedor</option>
                {proveedores?.map(proveedor => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Realizado por
              </label>
              <input
                type="text"
                name="realizadoPor"
                value={formData.realizadoPor}
                onChange={handleChange}
                placeholder="Taller mecánico / Nombre del técnico"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe el mantenimiento realizado..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Sección de refacciones usadas del almacén */}
          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={() => setMostrarRefaccionesUsadas(!mostrarRefaccionesUsadas)}
              className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-slate-900">Refacciones del almacén (opcional)</h3>
                {formData.refaccionesUsadas.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    {formData.refaccionesUsadas.length}
                  </span>
                )}
              </div>
              {mostrarRefaccionesUsadas ? (
                <ChevronUp className="h-5 w-5 text-slate-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-600" />
              )}
            </button>

            {mostrarRefaccionesUsadas && (
              <div className="mt-4">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Refacción
                      </label>
                      <select
                        name="refaccionId"
                        value={nuevaRefaccionUsada.refaccionId}
                        onChange={handleRefaccionUsadaChange}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar refacción</option>
                        {refacciones?.map(ref => (
                          <option key={ref.id} value={ref.id}>
                            {ref.nombre} - ${ref.costo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        name="cantidad"
                        value={nuevaRefaccionUsada.cantidad}
                        onChange={handleRefaccionUsadaChange}
                        placeholder="1"
                        min="1"
                        step="1"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Costo unitario
                      </label>
                      <input
                        type="number"
                        name="costoUnitario"
                        value={nuevaRefaccionUsada.costoUnitario}
                        onChange={handleRefaccionUsadaChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={agregarRefaccionUsada}
                    disabled={!nuevaRefaccionUsada.refaccionId || !nuevaRefaccionUsada.cantidad || !nuevaRefaccionUsada.costoUnitario}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Agregar refacción del almacén</span>
                  </button>
                </div>

                {formData.refaccionesUsadas.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.refaccionesUsadas.map((refaccion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              ALMACÉN
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                              {getRefaccionNombre(refaccion.refaccionId)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {refaccion.cantidad} x ${refaccion.costoUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-slate-900">
                            ${(refaccion.cantidad * refaccion.costoUnitario).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => eliminarRefaccionUsada(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg font-bold">
                      <span className="text-slate-900">Total refacciones del almacén</span>
                      <span className="text-xl text-slate-900">
                        ${costoTotalRefaccionesUsadas.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección de gastos */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Gastos del mantenimiento</h3>

            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Categoría
                  </label>
                  <select
                    name="categoria"
                    value={nuevoGasto.categoria}
                    onChange={handleGastoChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIAS_GASTO.map(cat => (
                      <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={nuevoGasto.descripcion}
                    onChange={handleGastoChange}
                    placeholder="Descripción del gasto"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Refacción (opcional)
                  </label>
                  <select
                    name="refaccionId"
                    value={nuevoGasto.refaccionId || ''}
                    onChange={handleGastoChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin refacción del almacén</option>
                    {refacciones?.map(ref => (
                      <option key={ref.id} value={ref.id}>
                        {ref.nombre} - ${ref.costo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={nuevoGasto.cantidad}
                    onChange={handleGastoChange}
                    placeholder="1"
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo unitario
                  </label>
                  <input
                    type="number"
                    name="costoUnitario"
                    value={nuevoGasto.costoUnitario}
                    onChange={handleGastoChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monto total
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={nuevoGasto.monto}
                    onChange={handleGastoChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={agregarGasto}
                disabled={!nuevoGasto.descripcion || !nuevoGasto.monto}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar gasto</span>
              </button>
            </div>

            {formData.gastosNuevos.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.gastosNuevos.map((gasto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          {gasto.categoria.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{gasto.descripcion}</span>
                      </div>
                      {gasto.cantidad && (
                        <p className="text-xs text-slate-500">
                          {gasto.cantidad} x ${gasto.costoUnitario?.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-slate-900">
                        ${parseFloat(gasto.monto).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarGasto(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg font-bold">
                  <span className="text-slate-900">Total de gastos</span>
                  <span className="text-xl text-slate-900">
                    ${costoTotalGastos.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Total general */}
          {(formData.gastosNuevos.length > 0 || formData.refaccionesUsadas.length > 0) && (
            <div className="border-t-2 border-slate-300 pt-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-lg font-bold text-slate-900">Total general del mantenimiento</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${(costoTotalGastos + costoTotalRefaccionesUsadas).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !formData.unidadId || !formData.descripcion}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Crear mantenimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMantenimientoModal