import { X, User, Calendar, DollarSign, FileText, CreditCard, Wallet, Hash, Briefcase } from 'lucide-react'

const ViewNominaFijaModal = ({ isOpen, onClose, nomina }) => {
    if (!isOpen || !nomina) return null

    const totalNeto = (
        parseFloat(nomina.gananciaBase || 0) +
        parseFloat(nomina.extra || 0) -
        parseFloat(nomina.deben || 0)
    )

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value || 0)
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'

        const date = new Date(`${dateString}T12:00:00`)

        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Detalles de Nómina Fija</h2>
                            <p className="text-sm text-slate-600 mt-1">Información completa del registro</p>
                        </div>

                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700">
                            <Wallet className="h-7 w-7 text-white" />
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Administrativo
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Nombre</label>
                                <p className="text-sm text-slate-900 mt-1 font-semibold">{nomina.nombre}</p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Alias</label>
                                <p className="text-sm text-slate-900 mt-1">{nomina.alias || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Administrativo ID</label>
                                <p className="text-sm text-slate-900 mt-1 flex items-center">
                                    <Briefcase className="h-3 w-3 mr-1 text-slate-400" />
                                    {nomina.administrativoId ? `#${nomina.administrativoId}` : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Nombre en Cuenta</label>
                                <p className="text-sm text-slate-900 mt-1">{nomina.nombreCuenta || 'N/A'}</p>
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500">Cuenta Bancaria</label>
                                <p className="text-sm text-slate-900 mt-1 flex items-center">
                                    <CreditCard className="h-3 w-3 mr-1 text-slate-400" />
                                    {nomina.cuenta || 'No especificada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Periodo
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <label className="text-xs font-medium text-slate-500">Fecha de Inicio</label>
                                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatDate(nomina.periodoInicio)}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <label className="text-xs font-medium text-slate-500">Fecha de Fin</label>
                                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatDate(nomina.periodoFin)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Detalles Financieros
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">Sueldo Base</label>
                                <p className="text-sm text-slate-900 mt-1 font-semibold">{formatCurrency(nomina.gananciaBase)}</p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Extra</label>
                                <p className="text-sm text-green-600 mt-1 font-semibold">{formatCurrency(nomina.extra)}</p>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-slate-500">Deben</label>
                                <p className="text-sm text-red-600 mt-1 font-semibold">-{formatCurrency(nomina.deben)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">Total Neto</p>
                                <p className="text-xs text-slate-500 mt-0.5">Sueldo Base + Extra - Deben</p>
                            </div>

                            <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalNeto)}</p>
                        </div>
                    </div>

                    {nomina.observaciones && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Observaciones
                            </h3>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{nomina.observaciones}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <Hash className="h-4 w-4 mr-2" />
                            Información del Sistema
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500">ID de Nómina</label>
                                <p className="text-sm text-slate-900 mt-1">#{nomina.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="w-full cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewNominaFijaModal