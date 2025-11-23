'use client'

import { useState, useEffect } from 'react'
import { Wrench, FileText, Package, DollarSign, Warehouse, AlertCircle } from 'lucide-react'

const EditRefaccionModal = ({ isOpen, onClose, onSave, refaccion, almacenes }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidadMedida: 'pieza',
    costoUnitario: '',
    stockActual: '',
    almacenId: '',
    nombreVendedor: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (refaccion) {
      setFormData({
        nombre: refaccion.nombre || '',
        descripcion: refaccion.descripcion || '',
        unidadMedida: refaccion.unidadMedida || 'pieza',
        costoUnitario: refaccion.costoUnitario || '',
        stockActual: refaccion.stockActual || '',
        almacenId: refaccion.almacen?.id || '',
        nombreVendedor: refaccion.nombreVendedor || ''
      })
    }
  }, [refaccion])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        unidadMedida: formData.unidadMedida,
        costoUnitario: parseFloat(formData.costoUnitario),
        stockActual: parseInt(formData.stockActual),
        almacenId: parseInt(formData.almacenId),
        nombreVendedor: formData.nombreVendedor || null
      }
      
      await onSave(refaccion.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error updating refaccion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !refaccion) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar refacción</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información de la refacción</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la refacción *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="Ej: Filtro de aceite"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900 resize-none"
                    placeholder="Ej: Filtro Cummins ISX15"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del vendedor
                  </label>
                  <input
                    type="text"
                    value={formData.nombreVendedor}
                    onChange={(e) => setFormData({ ...formData, nombreVendedor: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="Ej: AutoPartes México"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unidad de medida *
                  </label>
                  <select
                    value={formData.unidadMedida}
                    onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="pieza">Pieza</option>
                    <option value="litro">Litro</option>
                    <option value="galon">Galón</option>
                    <option value="kilo">Kilo</option>
                    <option value="caja">Caja</option>
                    <option value="metro">Metro</option>
                    <option value="paquete">Paquete</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inventario y Costo */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Inventario y Costo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stock actual *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockActual}
                    onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Costo unitario *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costoUnitario}
                      onChange={(e) => setFormData({ ...formData, costoUnitario: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Almacén */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Warehouse className="h-5 w-5 mr-2" />
                Ubicación
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Almacén *
                </label>
                <select
                  value={formData.almacenId}
                  onChange={(e) => setFormData({ ...formData, almacenId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                >
                  <option value="">Selecciona un almacén</option>
                  {almacenes.map((almacen) => (
                    <option key={almacen.id} value={almacen.id}>
                      {almacen.nombre} - {almacen.ubicacion}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Selecciona el almacén donde se guardará esta refacción
                </p>
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
              disabled={isLoading}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRefaccionModal
