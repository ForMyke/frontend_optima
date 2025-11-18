import { X, Calendar, DollarSign } from 'lucide-react'

const ViewGastoSemanalModal = ({ isOpen, onClose, gasto, calcularTotal }) => {
  if (!isOpen || !gasto) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString('es-MX', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`
  }

  const gastos = [
    { label: 'IAVE', value: gasto.iave, color: 'blue' },
    { label: 'IMSS', value: gasto.imss, color: 'purple' },
    { label: 'INFONAVIT', value: gasto.infonavit, color: 'indigo' },
    { label: 'Diesel', value: gasto.diesel, color: 'orange' },
    { label: 'Nómina', value: gasto.nomina, color: 'green' },
    { label: 'Refacciones', value: gasto.refacciones, color: 'red' },
    { label: 'Contador', value: gasto.contador, color: 'yellow' },
    { label: 'GPS', value: gasto.gps, color: 'teal' },
    { label: 'Gastos Extras', value: gasto.gastosExtras, color: 'pink' },
    { label: 'Seguros', value: gasto.seguros, color: 'cyan' },
    { label: 'Créditos', value: gasto.creditos, color: 'lime' },
    { label: 'Telefonía', value: gasto.telefonia, color: 'amber' }
  ]

  const total = calcularTotal(gasto)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Detalles de Gasto Semanal</h2>
          <p className="text-sm text-slate-600 mt-1">Semana #{gasto.id}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Periodo */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Período</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Inicio de Semana</p>
                <p className="font-semibold text-slate-900">{formatDate(gasto.semanaInicio)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Fin de Semana</p>
                <p className="font-semibold text-slate-900">{formatDate(gasto.semanaFin)}</p>
              </div>
            </div>
          </div>

          {/* Desglose de Gastos */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-slate-600" />
              <span>Desglose de Gastos</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gastos.map((item) => (
                <div key={item.label} className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="font-bold text-slate-900">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Gastos</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(total)}</p>
              </div>
              <div className="p-4 bg-red-100 rounded-full">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {gasto.observaciones && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="font-semibold text-slate-900 mb-2">Observaciones</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{gasto.observaciones}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              <div>
                <p className="mb-1">ID de Gasto</p>
                <p className="font-medium text-slate-700">#{gasto.id}</p>
              </div>
              {gasto.creadoPor && (
                <div>
                  <p className="mb-1">Creado por (ID)</p>
                  <p className="font-medium text-slate-700">Usuario #{gasto.creadoPor}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewGastoSemanalModal
