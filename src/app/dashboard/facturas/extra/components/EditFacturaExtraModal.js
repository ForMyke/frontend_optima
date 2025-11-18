import { useState, useEffect } from 'react'
import { X, Save, Calendar, User, DollarSign, FileText, AlertCircle } from 'lucide-react'

const EditFacturaExtraModal = ({ isOpen, onClose, onSubmit, factura, clientes }) => {
  const [formData, setFormData] = useState({
    numeroFactura: '',
    fechaEmision: '',
    fechaVencimiento: '',
    clienteId: '',
    monto: '',
    concepto: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && factura) {
      setFormData({
        numeroFactura: factura.numeroFactura || '',
        fechaEmision: factura.fechaEmision || '',
        fechaVencimiento: factura.fechaVencimiento || '',
        clienteId: factura.clienteId || '',
        monto: factura.monto || '',
        concepto: factura.concepto || '',
        observaciones: factura.observaciones || ''
      })
      setErrors({})
    }
  }, [isOpen, factura])

  const validate = () => {
    const newErrors = {}

    if (!formData.numeroFactura.trim()) {
      newErrors.numeroFactura = 'El número de factura es requerido'
    }

    if (!formData.fechaEmision) {
      newErrors.fechaEmision = 'La fecha de emisión es requerida'
    }

    if (!formData.fechaVencimiento) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida'
    } else if (formData.fechaEmision && formData.fechaVencimiento < formData.fechaEmision) {
      newErrors.fechaVencimiento = 'La fecha de vencimiento debe ser posterior a la emisión'
    }

    if (!formData.clienteId) {
      newErrors.clienteId = 'Debe seleccionar un cliente'
    }

    if (!formData.monto) {
      newErrors.monto = 'El monto es requerido'
    } else if (parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0'
    }

    if (!formData.concepto.trim()) {
      newErrors.concepto = 'El concepto es requerido'
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

    const facturaData = {
      ...formData,
      clienteId: parseInt(formData.clienteId),
      monto: parseFloat(formData.monto)
    }

    await onSubmit(factura.id, facturaData)
  }

  if (!isOpen || !factura) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar Factura Extra</h2>
          <p className="text-sm text-slate-600 mt-1">
            Modificar información de {factura.numeroFactura}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Número de Factura */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Número de Factura <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                name="numeroFactura"
                value={formData.numeroFactura}
                onChange={handleChange}
                placeholder="EXTRA-001"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.numeroFactura ? 'border-red-300' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.numeroFactura && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.numeroFactura}</span>
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha de Emisión <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  name="fechaEmision"
                  value={formData.fechaEmision}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.fechaEmision ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.fechaEmision && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.fechaEmision}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha de Vencimiento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.fechaVencimiento ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.fechaVencimiento && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.fechaVencimiento}</span>
                </p>
              )}
            </div>
          </div>

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

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Monto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="5000.00"
                step="0.01"
                min="0"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.monto ? 'border-red-300' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.monto && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.monto}</span>
              </p>
            )}
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Concepto <span className="text-red-500">*</span>
            </label>
            <textarea
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Descripción del servicio o concepto de cobro..."
              rows="3"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                errors.concepto ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.concepto && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.concepto}</span>
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales..."
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
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

export default EditFacturaExtraModal
