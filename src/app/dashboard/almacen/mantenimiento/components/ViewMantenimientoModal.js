import { X, Calendar, Truck, DollarSign, FileText, Wrench, Package } from 'lucide-react'

const ViewMantenimientoModal = ({ isOpen, onClose, mantenimiento }) => {
  if (!isOpen || !mantenimiento) return null

  const getTipoConfig = (tipo) => {
    const tipoUpper = tipo?.toUpperCase()
    switch (tipoUpper) {
      case 'PREVENTIVO':
        return { color: 'bg-blue-100 text-blue-800', label: 'Preventivo' }
      case 'CORRECTIVO':
        return { color: 'bg-orange-100 text-orange-800', label: 'Correctivo' }
      case 'PREDICTIVO':
        return { color: 'bg-purple-100 text-purple-800', label: 'Predictivo' }
      default:
        return { color: 'bg-gray-100 text-gray-800', label: tipo || 'N/A' }
    }
  }

  const tipoConfig = getTipoConfig(mantenimiento.tipo)

  // Calcular costo total
  const costoTotal = (mantenimiento.gastos || []).reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)

  // Formatear fecha
  const fechaFormateada = mantenimiento.fecha 
    ? new Date(mantenimiento.fecha).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Sin fecha'

  const unidadInfo = mantenimiento.unidad 
    ? `${mantenimiento.unidad.numeroEconomico} - ${mantenimiento.unidad.marca} ${mantenimiento.unidad.modelo}`
    : 'Sin unidad'

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoConfig.color}`}>
                  {tipoConfig.label}
                </span>
                <span className="text-sm text-slate-500">Mantenimiento #{mantenimiento.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {mantenimiento.descripcion || 'Sin descripción'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Unidad</p>
                <p className="font-semibold text-slate-900">{unidadInfo}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Fecha</p>
                <p className="font-semibold text-slate-900">{fechaFormateada}</p>
              </div>
            </div>

            {mantenimiento.kilometraje && (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Kilometraje</p>
                  <p className="font-semibold text-slate-900">
                    {mantenimiento.kilometraje.toLocaleString('es-MX')} km
                  </p>
                </div>
              </div>
            )}

            {mantenimiento.realizadoPor && (
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Realizado por</p>
                  <p className="font-semibold text-slate-900">{mantenimiento.realizadoPor}</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción completa */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Descripción completa</h3>
            <p className="text-slate-900 bg-slate-50 p-4 rounded-lg">
              {mantenimiento.descripcion || 'Sin descripción'}
            </p>
          </div>

          {/* Gastos */}
          {mantenimiento.gastos && mantenimiento.gastos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Gastos del mantenimiento</span>
              </h3>
              
              <div className="space-y-3">
                {mantenimiento.gastos.map((gasto, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {gasto.categoria?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900">{gasto.descripcion}</p>
                      </div>
                      <span className="text-xl font-bold text-slate-900">
                        ${parseFloat(gasto.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Detalles de refacción */}
                    {gasto.refaccion && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-slate-200">
                        <Package className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">
                            Refacción: <span className="font-medium">{gasto.refaccion.nombre}</span>
                          </p>
                          {gasto.cantidad && gasto.costoUnitario && (
                            <p className="text-xs text-slate-500">
                              {gasto.cantidad} unidades × ${parseFloat(gasto.costoUnitario).toFixed(2)} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Solo cantidad y costo si no hay refacción */}
                    {!gasto.refaccion && gasto.cantidad && gasto.costoUnitario && (
                      <p className="text-sm text-slate-500 mt-2">
                        {gasto.cantidad} unidades × ${parseFloat(gasto.costoUnitario).toFixed(2)} c/u
                      </p>
                    )}
                  </div>
                ))}

                {/* Total */}
                <div className="bg-slate-900 text-white rounded-lg p-4 flex items-center justify-between">
                  <span className="text-lg font-semibold">Total del mantenimiento</span>
                  <span className="text-2xl font-bold">
                    ${costoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(!mantenimiento.gastos || mantenimiento.gastos.length === 0) && (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No hay gastos registrados para este mantenimiento</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewMantenimientoModal
