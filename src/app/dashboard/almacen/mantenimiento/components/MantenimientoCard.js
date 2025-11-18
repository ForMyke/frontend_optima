import { Eye, Calendar, Truck, DollarSign, Wrench, FileText } from 'lucide-react'

const MantenimientoCard = ({ mantenimiento, onViewDetails, unidades }) => {

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

  // Obtener información de la unidad
  const unidad = mantenimiento.unidad || unidades.find(u => u.id === mantenimiento.unidadId)
  const unidadInfo = unidad ? `${unidad.numeroEconomico} - ${unidad.marca} ${unidad.modelo}` : 'Sin unidad'

  // Calcular costo total de gastos
  const costoTotal = (mantenimiento.gastos || []).reduce((sum, g) => sum + (parseFloat(g.monto) || 0), 0)

  // Formatear fecha
  const fechaFormateada = mantenimiento.fecha 
    ? new Date(mantenimiento.fecha).toLocaleDateString('es-MX', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })
    : 'Sin fecha'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoConfig.color}`}>
              {tipoConfig.label}
            </span>
            <span className="text-xs text-slate-500">#{mantenimiento.id}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {mantenimiento.descripcion || 'Sin descripción'}
          </h3>
        </div>

        {/* Botón Ver detalles */}
        <button
          onClick={() => onViewDetails(mantenimiento)}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <Eye className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Unidad */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Truck className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Unidad</p>
            <p className="font-semibold text-slate-900">{unidadInfo}</p>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center space-x-3 text-sm">
          <div className="p-2 bg-green-50 rounded-lg">
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">Fecha</p>
            <p className="font-semibold text-slate-900">{fechaFormateada}</p>
          </div>
        </div>

        {/* Kilometraje */}
        {mantenimiento.kilometraje && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FileText className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Kilometraje</p>
              <p className="font-semibold text-slate-900">
                {mantenimiento.kilometraje.toLocaleString('es-MX')} km
              </p>
            </div>
          </div>
        )}

        {/* Realizado por */}
        {mantenimiento.realizadoPor && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Realizado por</p>
              <p className="font-semibold text-slate-900">{mantenimiento.realizadoPor}</p>
            </div>
          </div>
        )}

        {/* Costo total */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-600">Costo total</span>
          </div>
          <span className="text-lg font-bold text-slate-900">
            ${costoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Número de gastos */}
        {mantenimiento.gastos && mantenimiento.gastos.length > 0 && (
          <div className="text-xs text-slate-500 text-center">
            {mantenimiento.gastos.length} gasto{mantenimiento.gastos.length !== 1 ? 's' : ''} registrado{mantenimiento.gastos.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default MantenimientoCard
