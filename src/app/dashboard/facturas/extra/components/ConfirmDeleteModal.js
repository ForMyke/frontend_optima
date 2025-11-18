import { X, Trash2, AlertTriangle } from 'lucide-react'

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, factura }) => {
  if (!isOpen || !factura) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Eliminar Factura</h2>
          <p className="text-sm text-slate-600 mt-1">Esta acción no se puede deshacer</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">¿Está seguro de eliminar esta factura?</p>
              <p>Esta acción es permanente y no podrá recuperar la información.</p>
            </div>
          </div>

          {/* Factura Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Número de Factura</span>
              <span className="font-bold text-slate-900">{factura.numeroFactura}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Monto</span>
              <span className="font-bold text-red-600 text-lg">
                ${parseFloat(factura.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {factura.concepto && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Concepto</p>
                <p className="text-sm text-slate-900 font-medium truncate">{factura.concepto}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(factura.id)}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
