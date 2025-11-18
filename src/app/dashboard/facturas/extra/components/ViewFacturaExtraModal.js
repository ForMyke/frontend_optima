import { X, User, Calendar, DollarSign, FileText, MessageSquare } from 'lucide-react'

const ViewFacturaExtraModal = ({ isOpen, onClose, factura, clientes }) => {
    if (!isOpen || !factura) return null

    // Buscar el cliente por ID
    const cliente = clientes.find(c => c.id === factura.clienteId)
    const clienteNombre = cliente?.nombre || 'Cliente no encontrado'
    const clienteTelefono = cliente?.telefono || 'Sin teléfono'
    const clienteEmail = cliente?.email || 'Sin email'

    // Formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha'
        return new Date(dateString).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    // Formatear monto
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    }

    // Configuración de estatus
    const getEstatusConfig = (estatus) => {
        switch (estatus) {
            case 'PAGADA':
                return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Pagada' }
            case 'PENDIENTE':
                return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Pendiente' }
            case 'VENCIDA':
                return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Vencida' }
            case 'CANCELADA':
                return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Cancelada' }
            default:
                return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: estatus || 'N/A' }
        }
    }

    const estatusConfig = getEstatusConfig(factura.estatus)

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">Detalles de Factura Extra</h2>
                    <p className="text-sm text-slate-600 mt-1">{factura.numeroFactura}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${estatusConfig.color}`}>
                            {estatusConfig.label}
                        </span>
                    </div>

                    {/* Información General */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                        <h3 className="font-semibold text-slate-900 mb-3">Información General</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Número de Factura</p>
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <p className="font-semibold text-slate-900">{factura.numeroFactura}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 mb-1">Monto Total</p>
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <p className="font-semibold text-slate-900 text-lg">
                                        {formatCurrency(factura.monto)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Fecha de Emisión</p>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-purple-600" />
                                    <p className="font-semibold text-slate-900">{formatDate(factura.fechaEmision)}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 mb-1">Fecha de Vencimiento</p>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-orange-600" />
                                    <p className="font-semibold text-slate-900">{formatDate(factura.fechaVencimiento)}</p>
                                </div>
                            </div>
                        </div>

                        {factura.estatus === 'PAGADA' && factura.fechaPago && (
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Fecha de Pago</p>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <p className="font-semibold text-slate-900">{formatDate(factura.fechaPago)}</p>
                                </div>
                            </div>
                        )}

                        {factura.estatus === 'PAGADA' && factura.metodoPago && (
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Método de Pago</p>
                                <p className="font-semibold text-slate-900">{factura.metodoPago}</p>
                            </div>
                        )}
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
                    </div>

                    {/* Concepto */}
                    <div className="bg-purple-50 rounded-xl p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <span>Concepto</span>
                        </h3>
                        <p className="text-slate-700 whitespace-pre-wrap">{factura.concepto || 'Sin concepto'}</p>
                    </div>

                    {/* Observaciones */}
                    {factura.observaciones && (
                        <div className="bg-amber-50 rounded-xl p-4">
                            <h3 className="font-semibold text-slate-900 mb-2 flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5 text-amber-600" />
                                <span>Observaciones</span>
                            </h3>
                            <p className="text-slate-700 whitespace-pre-wrap">{factura.observaciones}</p>
                        </div>
                    )}

                    {/* Metadatos */}
                    <div className="border-t border-slate-200 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-500">
                            <div>
                                <p className="mb-1">ID de Factura</p>
                                <p className="font-medium text-slate-700">#{factura.id}</p>
                            </div>
                            {factura.creadoPor && (
                                <div>
                                    <p className="mb-1">Creado por (ID)</p>
                                    <p className="font-medium text-slate-700">Usuario #{factura.creadoPor}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
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

export default ViewFacturaExtraModal
