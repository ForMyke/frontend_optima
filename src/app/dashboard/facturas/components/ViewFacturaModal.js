'use client'

import { FileText, User, DollarSign, Calendar, CheckCircle, Clock, X } from 'lucide-react'

const ViewFacturaModal = ({ isOpen, onClose, factura, clientes = [] }) => {
  if (!isOpen || !factura) return null

  // Buscar el cliente por ID
  const cliente = clientes.find(c => c.id === factura.clienteId)

  const getEstatusColor = (estatus) => {
    switch (estatus) {
      case 'PAGADA':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'PAGO_PARCIAL':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PENDIENTE':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'VENCIDA':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Detalles de la factura</h2>
            <p className="text-sm text-slate-600 mt-1">Información completa</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la Factura */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información de la Factura
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Número de factura</p>
                  <p className="text-base text-slate-900 font-bold">{factura.numeroFactura}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getEstatusColor(factura.estatus)}`}>
                  {factura.estatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Observaciones</p>
                <p className="text-base text-slate-900">{factura.observaciones || 'Sin observaciones'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Monto Total
                  </p>
                  <p className="text-2xl text-blue-600 font-bold">
                    ${(factura.monto || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Pagado</p>
                  <p className="text-2xl text-emerald-600 font-bold">
                    ${(factura.montoParcial || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {factura.montoParcial > 0 && factura.montoParcial < factura.monto && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Por pagar</p>
                  <p className="text-xl text-orange-600 font-bold">
                    ${((factura.monto || 0) - (factura.montoParcial || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  {/* Barra de progreso */}
                  <div className="mt-3 w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-emerald-600 h-3 rounded-full transition-all"
                      style={{ width: `${((factura.montoParcial || 0) / (factura.monto || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    {((factura.montoParcial || 0) / (factura.monto || 1) * 100).toFixed(1)}% pagado
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Cliente
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              {cliente ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Nombre</p>
                    <p className="text-base text-slate-900">{cliente.nombre}</p>
                  </div>
                  {cliente.email && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                      <p className="text-base text-slate-900">{cliente.email}</p>
                    </div>
                  )}
                  {cliente.telefono && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Teléfono</p>
                      <p className="text-base text-slate-900">{cliente.telefono}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-2">Sin cliente asignado</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Fechas
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Fecha de emisión</p>
                  <p className="text-base text-slate-900">
                    {factura.fechaEmision ? new Date(factura.fechaEmision).toLocaleDateString('es-MX') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Fecha de vencimiento</p>
                  <p className="text-base text-slate-900">
                    {factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toLocaleDateString('es-MX') : 'N/A'}
                  </p>
                </div>
              </div>
              
              {factura.estatus === 'PAGADA' && factura.fechaPago && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                      <p className="text-sm font-semibold text-emerald-900">Factura Pagada</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-emerald-600 font-medium mb-1">Fecha de pago</p>
                        <p className="text-sm text-emerald-900 font-semibold">
                          {new Date(factura.fechaPago).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      {factura.metodoPago && (
                        <div>
                          <p className="text-xs text-emerald-600 font-medium mb-1">Método de pago</p>
                          <p className="text-sm text-emerald-900 font-semibold">{factura.metodoPago}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {factura.estatus === 'PENDIENTE' && (
                <div className="pt-3 border-t border-slate-200">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-orange-600 mr-2" />
                      <p className="text-sm font-semibold text-orange-900">Pago pendiente</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewFacturaModal
