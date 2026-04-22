import { useState, useEffect } from 'react'
import { X, Save, User, Calendar, DollarSign, FileText, AlertCircle, CreditCard } from 'lucide-react'


const CreateNominaFijaModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        gananciaBase: '',
        extra: '',
        deben: '',
        observaciones: '',
        nombre: '',
        nombreCuenta: '',
        alias: '',
        cuenta: '',
        periodoInicio: '',
        periodoFin: ''
    })

    const [errors, setErrors] = useState({})
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                gananciaBase: '',
                extra: '',
                deben: '',
                observaciones: '',
                nombre: '',
                nombreCuenta: '',
                alias: '',
                cuenta: '',
                periodoInicio: '',
                periodoFin: ''
            })
            setErrors({})
            setTotal(0)
        }
    }, [isOpen])

    // Calcular total automáticamente
    useEffect(() => {
        const gananciaBase = parseFloat(formData.gananciaBase) || 0
        const extra = parseFloat(formData.extra) || 0
        const deben = parseFloat(formData.deben) || 0

        const totalCalculado = gananciaBase + extra - deben
        setTotal(totalCalculado)
    }, [formData.gananciaBase, formData.extra, formData.deben])

    const validate = () => {
        const newErrors = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.periodoInicio) {
            newErrors.periodoInicio = 'La fecha de inicio es requerida'
        }

        if (!formData.periodoFin) {
            newErrors.periodoFin = 'La fecha de fin es requerida'
        }

        if (formData.periodoInicio && formData.periodoFin && formData.periodoInicio > formData.periodoFin) {
            newErrors.periodoInicio = 'La fecha de inicio debe ser anterior o igual a la fecha de fin'
        }

        if (!formData.gananciaBase) {
            newErrors.gananciaBase = 'La ganancia base es requerida'
        } else if (parseFloat(formData.gananciaBase) < 0) {
            newErrors.gananciaBase = 'La ganancia base debe ser mayor o igual a 0'
        }

        // Validar montos numéricos
        if (formData.extra && parseFloat(formData.extra) < 0) {
            newErrors.extra = 'El extra debe ser mayor o igual a 0'
        }

        if (formData.deben && parseFloat(formData.deben) < 0) {
            newErrors.deben = 'El debe debe ser mayor o igual a 0'
        }

        // Validar cuenta (máximo 10 dígitos)
        if (formData.cuenta && formData.cuenta.length > 10) {
            newErrors.cuenta = 'La cuenta no puede tener más de 8 dígitos'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        const nominaData = {
            gananciaBase: parseFloat(formData.gananciaBase),
            extra: parseFloat(formData.extra) || 0,
            deben: parseFloat(formData.deben) || 0,
            observaciones: formData.observaciones.trim(),
            nombre: formData.nombre.trim(),
            nombreCuenta: formData.nombreCuenta.trim(),
            alias: formData.alias.trim(),
            cuenta: parseInt(formData.cuenta) || 0,
            periodoInicio: formData.periodoInicio,
            periodoFin: formData.periodoFin
        }

        await onSubmit(nominaData)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Nueva Nómina Fija</h2>
                            <p className="text-sm text-slate-600 mt-1">Registrar nómina para personal fijo</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Datos de la Persona */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.nombre ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            />
                            {errors.nombre && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.nombre}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Alias
                            </label>
                            <input
                                type="text"
                                name="alias"
                                value={formData.alias}
                                onChange={handleChange}
                                placeholder="Alias"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Datos Bancarios */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Nombre en Cuenta
                            </label>
                            <input
                                type="text"
                                name="nombreCuenta"
                                value={formData.nombreCuenta}
                                onChange={handleChange}
                                placeholder="Nombre como aparece en la cuenta"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Cuenta Bancaria
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="cuenta"
                                    value={formData.cuenta}
                                    onChange={handleChange}
                                    placeholder="Número de cuenta (máx. 10 dígitos)"
                                    maxLength={10}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.cuenta ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.cuenta && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.cuenta}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Periodo */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Periodo Inicio <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="date"
                                    name="periodoInicio"
                                    value={formData.periodoInicio}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.periodoInicio ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                />
                            </div>
                            {errors.periodoInicio && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.periodoInicio}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Periodo Fin <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="date"
                                    name="periodoFin"
                                    value={formData.periodoFin}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                        errors.periodoFin ? 'border-red-300' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.periodoFin && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.periodoFin}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Montos */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Ganancia Base <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="gananciaBase"
                                    value={formData.gananciaBase}
                                    onChange={handleChange}
                                    placeholder="15000.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.gananciaBase ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                />
                            </div>
                            {errors.gananciaBase && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.gananciaBase}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Extra
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="extra"
                                    value={formData.extra}
                                    onChange={handleChange}
                                    placeholder="2000.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.extra ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.extra && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.extra}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Deben
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="deben"
                                    value={formData.deben}
                                    onChange={handleChange}
                                    placeholder="500.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.deben ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.deben && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.deben}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Total Calculado */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Total Neto:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Observaciones */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Observaciones
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                placeholder="Notas adicionales sobre esta nómina..."
                                rows="3"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>Guardar Nómina</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNominaFijaModal
