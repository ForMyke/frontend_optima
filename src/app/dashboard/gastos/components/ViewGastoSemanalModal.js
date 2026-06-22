import { X, DollarSign, FileText, User } from 'lucide-react'

const ViewGastoSemanalModal = ({ isOpen, onClose, gasto, calcularTotal }) => {
  if (!isOpen || !gasto) return null

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  const gastos = [
    { label: 'IAVE', value: gasto.iave },
    { label: 'IMSS', value: gasto.imss },
    { label: 'INFONAVIT', value: gasto.infonavit },
    { label: 'Diesel', value: gasto.diesel },
    { label: 'Nómina', value: gasto.nomina },
    { label: 'Refacciones', value: gasto.refacciones },
    { label: 'Contador', value: gasto.contador },
    { label: 'GPS', value: gasto.gps },
    { label: 'Gastos Extras', value: gasto.gastosExtras },
    { label: 'Seguros', value: gasto.seguros },
    { label: 'Créditos', value: gasto.creditos },
    { label: 'Telefonía', value: gasto.telefonia },
    { label: 'Gasto Extraordinario', value: gasto.gastoExtrahordinario }
  ]

  const total = calcularTotal(gasto)

  const observaciones =
    gasto.observaciones ||
    gasto.observacion ||
    gasto.comentarios ||
    gasto.comentario ||
    ''

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Detalles de Gasto
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Gasto #{gasto.id}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Desglose de Gastos */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-slate-600" />
              <span>Desglose de Gastos</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gastos.map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-lg p-3 border border-slate-200"
                >
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className="font-bold text-slate-900">
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Gastos</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="p-4 bg-red-100 rounded-full">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <span>Observaciones</span>
            </h3>

            {observaciones && observaciones.trim() !== '' ? (
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {observaciones}
              </p>
            ) : (
              <div className="bg-white/70 border border-amber-100 rounded-lg px-4 py-3">
                <p className="text-sm text-slate-500 italic">
                  Sin observaciones registradas para este gasto.
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
              {gasto.creadoPor && (
                <div>
                  <p className="mb-1 flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Creado por
                  </p>

                  <p className="font-medium text-slate-700">
                    {typeof gasto.creadoPor === 'object'
                      ? gasto.creadoPor.nombre ||
                        gasto.creadoPor.email ||
                        `Usuario #${gasto.creadoPor.id}`
                      : `Usuario #${gasto.creadoPor}`}
                  </p>
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