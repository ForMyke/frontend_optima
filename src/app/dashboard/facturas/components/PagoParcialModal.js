'use client'

import { useState } from 'react'
import { DollarSign, Calendar, CreditCard, AlertCircle, Plus } from 'lucide-react'

const PagoParcialModal = ({ isOpen, onClose, onConfirm, factura }) => {
  const [formData, setFormData] = useState({
    fechaPago: new Date().toISOString().split('T')[0],
    metodoPago: '',
    montoParcial: '',
    observaciones: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onConfirm(factura, formData)
      setFormData({
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: '',
        montoParcial: '',
        observaciones: ''
      })
      onClose()
    } catch (error) {
      console.error('Error al procesar pago parcial:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !factura) return null

  const montoPendiente = (factura.monto || 0) - (factura.montoParcial || 0)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mx-auto mb-4">
            <Plus className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center">Agregar Pago Parcial</h2>
          <p className="text-sm text-slate-600 text-center mt-2">
            Factura: <span className="font-semibold">{factura.numeroFactura}</span>
          </p>
          <div className="mt-3 bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Monto total:</span>
              <span className="font-bold text-slate-900">
                ${(factura.monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Pagado hasta ahora:</span>
              <span className="font-semibold text-emerald-600">
                ${(factura.montoParcial || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1 pt-2 border-t border-slate-200">
              <span className="text-slate-600">Pendiente por pagar:</span>
              <span className="font-bold text-orange-600">
                ${montoPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Monto del pago parcial *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={montoPendiente}
                value={formData.montoParcial}
                onChange={(e) => setFormData({ ...formData, montoParcial: e.target.value })}
                placeholder={`Máximo: $${montoPendiente.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-slate-900"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Puedes pagar desde $0.01 hasta el monto pendiente
              </p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                Fecha de pago *
              </label>
              <input
                type="date"
                value={formData.fechaPago}
                onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                <CreditCard className="h-4 w-4 mr-2" />
                Método de pago *
              </label>
              <select
                value={formData.metodoPago}
                onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-slate-900"
                required
              >
                <option value="">Selecciona un método</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
                <option value="TARJETA_DEBITO">Tarjeta de débito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Ej: Segundo abono - 30% del total"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Pago Parcial</p>
                  <p className="text-xs text-orange-700 mt-1">
                    • Este pago se sumará al monto ya pagado<br />
                    • Si completas el monto total, la factura se marcará como PAGADA<br />
                    • Si queda saldo pendiente, seguirá en PAGO_PARCIAL
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 cursor-pointer px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PagoParcialModal
