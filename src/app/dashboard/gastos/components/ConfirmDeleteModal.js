import { X, Trash2, AlertTriangle, Calendar, DollarSign } from 'lucide-react'

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, gasto, calcularTotal }) => {
  if (!isOpen || !gasto) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const total = calcularTotal(gasto)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Eliminar Gasto Semanal</h2>
          <p className="text-sm text-slate-600 mt-1">Esta acción no se puede deshacer</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">¿Está seguro de eliminar este gasto semanal?</p>
              <p>Esta acción es permanente y no podrá recuperar la información.</p>
            </div>
          </div>

          {/* Gasto Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
              <Calendar className="h-4 w-4 text-slate-600" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">Período</p>
                <p className="font-bold text-slate-900">
                  {formatDate(gasto.semanaInicio)} - {formatDate(gasto.semanaFin)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-600">Total de Gastos</span>
              </div>
              <span className="font-bold text-red-600 text-lg">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">ID de Gasto</p>
              <p className="text-sm text-slate-900 font-medium">#{gasto.id}</p>
            </div>

            {gasto.observaciones && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-1">Observaciones</p>
                <p className="text-sm text-slate-900 truncate">{gasto.observaciones}</p>
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
              onClick={() => onConfirm(gasto.id)}
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
