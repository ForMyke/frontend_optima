import { X, User, MapPin, DollarSign, Hash } from 'lucide-react'

const ViewRutaComisionModal = ({ isOpen, onClose, ruta, clientes }) => {
  if (!isOpen || !ruta) return null

  // El cliente ahora viene en el objeto ruta
  const clienteNombre = ruta.cliente?.nombre || 'Cliente no encontrado'
  const clienteTelefono = ruta.cliente?.telefono || 'Sin teléfono'
  const clienteEmail = ruta.cliente?.correo || 'Sin email'

  // Formatear monto
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toLocaleString('es-MX', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Detalles de Comisión</h2>
          <p className="text-sm text-slate-600 mt-1">Ruta #{ruta.id}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información de Ruta */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-3">Información de Ruta</h3>
            
            <div>
              <p className="text-xs text-slate-500 mb-1">ID de Ruta</p>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-blue-600" />
                <p className="font-semibold text-slate-900">#{ruta.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Origen</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <p className="font-semibold text-slate-900">{ruta.origen}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Destino</p>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <p className="font-semibold text-slate-900">{ruta.destino}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {ruta.tarifa && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tarifa</p>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(ruta.tarifa)}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 mb-1">Comisión</p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <p className="font-semibold text-slate-900 text-xl">
                    {formatCurrency(ruta.comision)}
                  </p>
                </div>
              </div>

              {ruta.kms && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kilómetros</p>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <p className="font-semibold text-slate-900">{parseFloat(ruta.kms).toFixed(2)} km</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Información del Cliente</span>
            </h3>
            
            <div>
              <p className="text-xs text-slate-600 mb-1">Nombre</p>
              <p className="font-semibold text-slate-900">{clienteNombre}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Teléfono</p>
                <p className="font-medium text-slate-900">{clienteTelefono}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Email</p>
                <p className="font-medium text-slate-900 text-sm truncate">{clienteEmail}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-1">ID del Cliente</p>
              <p className="font-medium text-slate-900">#{ruta.cliente?.id}</p>
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

export default ViewRutaComisionModal
