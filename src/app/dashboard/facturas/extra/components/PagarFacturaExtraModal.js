import { useState } from 'react'
import { X, CheckCircle, Calendar, CreditCard, AlertCircle } from 'lucide-react'

const PagarFacturaExtraModal = ({ isOpen, onClose, onConfirm, factura }) => {
  const [formData, setFormData] = useState({
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: ''
  })

  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!formData.fechaPago) {
      newErrors.fechaPago = 'La fecha de pago es requerida'
    }

    if (!formData.metodoPago) {
      newErrors.metodoPago = 'Debe seleccionar un método de pago'
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

    await onConfirm(factura, formData.fechaPago, formData.metodoPago)
  }

  if (!isOpen || !factura) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Marcar como Pagada</h2>
          <p className="text-sm text-slate-600 mt-1">{factura.numeroFactura}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información de la Factura */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Monto a pagar:</span>
              <span className="text-xl font-bold text-slate-900">
                ${parseFloat(factura.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Cliente:</span>
              <span className="font-medium text-slate-900">{factura.clienteNombre || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Vencimiento:</span>
              <span className="font-medium text-slate-900">
                {factura.fechaVencimiento 
                  ? new Date(factura.fechaVencimiento).toLocaleDateString('es-MX')
                  : 'N/A'
                }
              </span>
            </div>
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha de Pago <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="date"
                name="fechaPago"
                value={formData.fechaPago}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                  errors.fechaPago ? 'border-red-300' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.fechaPago && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.fechaPago}</span>
              </p>
            )}
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all appearance-none ${
                  errors.metodoPago ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Seleccionar método...</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                <option value="DEPOSITO">Depósito Bancario</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            {errors.metodoPago && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.metodoPago}</span>
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Confirmación de pago</p>
              <p>Al confirmar, la factura será marcada como <strong>PAGADA</strong> y se registrará la fecha y método de pago.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Confirmar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PagarFacturaExtraModal
