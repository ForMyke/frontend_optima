import { useState, useEffect } from 'react'
import { X, Save, MapPin, User, DollarSign, Hash, AlertCircle } from 'lucide-react'

const EditRutaComisionModal = ({ isOpen, onClose, onSubmit, ruta, clientes }) => {
  const [formData, setFormData] = useState({
    clienteId: '',
    origen: '',
    destino: '',
    comision: '',
    rutaTarifaId: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && ruta) {
      setFormData({
        clienteId: ruta.clienteId || '',
        origen: ruta.origen || '',
        destino: ruta.destino || '',
        comision: ruta.comision || '',
        rutaTarifaId: ruta.rutaTarifaId || ''
      })
      setErrors({})
    }
  }, [isOpen, ruta])

  const validate = () => {
    const newErrors = {}

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debe seleccionar un cliente'
    }

    if (!formData.origen.trim()) {
      newErrors.origen = 'El origen es requerido'
    }

    if (!formData.destino.trim()) {
      newErrors.destino = 'El destino es requerido'
    }

    if (!formData.comision) {
      newErrors.comision = 'La comisión es requerida'
    } else if (parseFloat(formData.comision) < 0) {
      newErrors.comision = 'La comisión debe ser mayor o igual a 0'
    }

    if (!formData.rutaTarifaId) {
      newErrors.rutaTarifaId = 'El ID de ruta tarifa es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    const rutaData = {
      ...formData,
      clienteId: parseInt(formData.clienteId),
      comision: parseFloat(formData.comision),
      rutaTarifaId: parseInt(formData.rutaTarifaId)
    }

    await onSubmit(ruta.id, rutaData)
  }

  if (!isOpen || !ruta) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar Comisión de Ruta</h2>
          <p className="text-sm text-slate-600 mt-1">
            Modificar información de la ruta #{ruta.id}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
                  errors.clienteId ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Seleccionar cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>
            {errors.clienteId && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.clienteId}</span>
              </p>
            )}
          </div>

          {/* Origen y Destino */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Origen <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="origen"
                  value={formData.origen}
                  onChange={handleChange}
                  placeholder="Ciudad de origen"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.origen ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.origen && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.origen}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Destino <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="destino"
                  value={formData.destino}
                  onChange={handleChange}
                  placeholder="Ciudad de destino"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.destino ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.destino && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.destino}</span>
                </p>
              )}
            </div>
          </div>

          {/* Comisión */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Comisión <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="comision"
                value={formData.comision}
                onChange={handleChange}
                placeholder="1800.00"
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.comision ? 'border-red-300' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.comision && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.comision}</span>
              </p>
            )}
          </div>

          {/* Ruta Tarifa ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ID de Ruta Tarifa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="rutaTarifaId"
                value={formData.rutaTarifaId}
                onChange={handleChange}
                placeholder="1"
                min="1"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.rutaTarifaId ? 'border-red-300' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.rutaTarifaId && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.rutaTarifaId}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditRutaComisionModal
