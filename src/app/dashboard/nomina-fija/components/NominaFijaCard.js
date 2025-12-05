import { MoreVertical, Eye, Edit, Trash2, User, Calendar, DollarSign, Wallet } from 'lucide-react'
import { useState } from 'react'

const NominaFijaCard = ({ nomina, onEdit, onDelete, onViewDetails }) => {
    const [showMenu, setShowMenu] = useState(false)

    // Calcular el total neto
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
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className="p-2.5 bg-purple-50 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-lg truncate">
                                {nomina.nombre}
                            </h3>
                            {nomina.alias && (
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Alias: {nomina.alias}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <MoreVertical className="h-5 w-5 text-slate-600" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                    <button
                                        onClick={() => {
                                            onViewDetails(nomina)
                                            setShowMenu(false)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>Ver detalles</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            onEdit(nomina)
                                            setShowMenu(false)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        <span>Editar</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete(nomina)
                                            setShowMenu(false)
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                {/* Periodo */}
                <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Periodo:</span>
                    <span className="font-medium text-slate-900">
                        {formatDate(nomina.periodoInicio)} - {formatDate(nomina.periodoFin)}
                    </span>
                </div>

                {/* Detalles financieros */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-600 mb-1">Ganancia Base</p>
                        <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(nomina.gananciaBase)}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Extra</p>
                        <p className="text-sm font-semibold text-green-900">
                            {formatCurrency(nomina.extra)}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs text-red-700 mb-1">Deben</p>
                        <p className="text-sm font-semibold text-red-900">
                            -{formatCurrency(nomina.deben)}
                        </p>
                    </div>
                </div>

                {/* Información bancaria */}
                {(nomina.nombreCuenta || nomina.cuenta) && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-2">
                            <Wallet className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">Cuenta:</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                            {nomina.cuenta || 'No especificada'}
                        </span>
                    </div>
                )}
            </div>

            {/* Footer - Total */}
            <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-slate-100 rounded-b-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700">Total Neto:</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                        {formatCurrency(totalNeto)}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default NominaFijaCard
