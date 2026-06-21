import { useState, useEffect } from 'react'
import { X, Save, User, Calendar, DollarSign, FileText, AlertCircle, CreditCard, Info } from 'lucide-react'
import { administrativosService } from '@/app/services/administrativosService'
import toast from 'react-hot-toast'
import AdministrativoSelector from './AdministrativoSelector'

const initialFormData = {
    administrativoId: '',
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
}

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(Number(value || 0))
}

const EditNominaFijaModal = ({ isOpen, onClose, onSubmit, nomina }) => {
    const [formData, setFormData] = useState(initialFormData)
    const [administrativos, setAdministrativos] = useState([])
    const [errors, setErrors] = useState({})
    const [total, setTotal] = useState(0)
    const [loadingAdministrativos, setLoadingAdministrativos] = useState(false)

    useEffect(() => {
        const loadAdministrativos = async () => {
            if (!isOpen) return

            try {
                setLoadingAdministrativos(true)

                const response = await administrativosService.getAdministrativos(0, 1000)
                const data = response.content || response || []

                setAdministrativos(data.filter(admin => admin.activo !== false))
            } catch (error) {
                console.error('Error al cargar administrativos:', error)
                toast.error('Error al cargar administrativos')
            } finally {
                setLoadingAdministrativos(false)
            }
        }

        loadAdministrativos()
    }, [isOpen])

    useEffect(() => {
        if (isOpen && nomina) {
            setFormData({
                administrativoId: nomina.administrativoId || '',
                gananciaBase: nomina.gananciaBase || '',
                extra: nomina.extra || '',
                deben: nomina.deben || '',
                observaciones: nomina.observaciones || '',
                nombre: nomina.nombre || '',
                nombreCuenta: nomina.nombreCuenta || '',
                alias: nomina.alias || '',
                cuenta: nomina.cuenta?.toString() || '',
                periodoInicio: nomina.periodoInicio || '',
                periodoFin: nomina.periodoFin || ''
            })

            setErrors({})
        }

        if (!isOpen) {
            setFormData(initialFormData)
            setErrors({})
            setTotal(0)
            setAdministrativos([])
        }
    }, [isOpen, nomina])

    useEffect(() => {
        if (!isOpen || !nomina || !administrativos.length) return

        if (formData.administrativoId) return

        const adminPorNombre = administrativos.find(admin => {
            return (admin.nombre || '').trim().toLowerCase() === (nomina.nombre || '').trim().toLowerCase()
        })

        if (adminPorNombre) {
            setFormData(prev => ({
                ...prev,
                administrativoId: adminPorNombre.id,
                gananciaBase: Number(adminPorNombre.sueldoBase || prev.gananciaBase || 0).toFixed(2),
                nombre: adminPorNombre.nombre || prev.nombre,
                nombreCuenta: adminPorNombre.nombreCuenta || prev.nombreCuenta,
                alias: adminPorNombre.alias || prev.alias,
                cuenta: adminPorNombre.cuenta?.toString() || prev.cuenta
            }))
        }
    }, [isOpen, nomina, administrativos, formData.administrativoId])

    useEffect(() => {
        const gananciaBase = parseFloat(formData.gananciaBase) || 0
        const extra = parseFloat(formData.extra) || 0
        const deben = parseFloat(formData.deben) || 0

        setTotal(gananciaBase + extra - deben)
    }, [formData.gananciaBase, formData.extra, formData.deben])

    const handleAdministrativoSelect = (admin) => {
        if (!admin) return

        setFormData(prev => ({
            ...prev,
            administrativoId: admin.id,
            nombre: admin.nombre || '',
            nombreCuenta: admin.nombreCuenta || '',
            alias: admin.alias || '',
            cuenta: admin.cuenta?.toString() || '',
            gananciaBase: Number(admin.sueldoBase || 0).toFixed(2)
        }))

        setErrors(prev => ({
            ...prev,
            administrativoId: '',
            gananciaBase: ''
        }))
    }

    const validate = () => {
        const newErrors = {}

        if (!formData.administrativoId) {
            newErrors.administrativoId = 'Selecciona un administrativo'
        }

        if (!formData.periodoInicio) {
            newErrors.periodoInicio = 'La fecha de inicio es requerida'
        }

        if (!formData.periodoFin) {
            newErrors.periodoFin = 'La fecha de fin es requerida'
        }

        if (formData.periodoInicio && formData.periodoFin && formData.periodoInicio > formData.periodoFin) {
            newErrors.periodoFin = 'La fecha de fin debe ser posterior o igual a la fecha de inicio'
        }

        if (!formData.gananciaBase) {
            newErrors.gananciaBase = 'El sueldo base es requerido'
        } else if (parseFloat(formData.gananciaBase) < 0) {
            newErrors.gananciaBase = 'El sueldo base debe ser mayor o igual a 0'
        }

        if (formData.extra && parseFloat(formData.extra) < 0) {
            newErrors.extra = 'El extra debe ser mayor o igual a 0'
        }

        if (formData.deben && parseFloat(formData.deben) < 0) {
            newErrors.deben = 'El debe debe ser mayor o igual a 0'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) return

        const nominaData = {
            administrativoId: Number(formData.administrativoId),

            gananciaBase: parseFloat(formData.gananciaBase) || 0,
            extra: parseFloat(formData.extra) || 0,
            deben: parseFloat(formData.deben) || 0,

            observaciones: formData.observaciones.trim(),

            nombre: formData.nombre.trim(),
            nombreCuenta: formData.nombreCuenta.trim(),
            alias: formData.alias.trim(),
            cuenta: formData.cuenta?.toString().trim() || '',

            periodoInicio: formData.periodoInicio,
            periodoFin: formData.periodoFin
        }

        await onSubmit(nomina.id, nominaData)
    }

    if (!isOpen || !nomina) return null

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Editar Nómina Fija</h2>
                            <p className="text-sm text-slate-600 mt-1">
                                Cambia el administrativo para actualizar automáticamente el sueldo base
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Administrativo <span className="text-red-500">*</span>
                        </label>

                        <AdministrativoSelector
                            administrativos={administrativos}
                            value={formData.administrativoId}
                            onChange={handleAdministrativoSelect}
                            loading={loadingAdministrativos}
                            error={errors.administrativoId}
                        />
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-purple-900">
                                Sueldo base sincronizado
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                Si seleccionas otro administrativo, se cargará su sueldo base actual.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Datos del administrativo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    readOnly
                                    placeholder="Se carga automáticamente"
                                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Alias
                                </label>
                                <input
                                    type="text"
                                    name="alias"
                                    value={formData.alias}
                                    readOnly
                                    placeholder="Se carga automáticamente"
                                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Datos bancarios
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre en Cuenta
                                </label>
                                <input
                                    type="text"
                                    name="nombreCuenta"
                                    value={formData.nombreCuenta}
                                    readOnly
                                    placeholder="Se carga automáticamente"
                                    className="w-full px-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-700"
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
                                        readOnly
                                        placeholder="Se carga automáticamente"
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Periodo
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                            errors.periodoInicio ? 'border-red-300' : 'border-slate-300'
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
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
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
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Montos
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Sueldo Base
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="number"
                                        name="gananciaBase"
                                        value={formData.gananciaBase}
                                        readOnly
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-slate-50 text-slate-700 ${
                                            errors.gananciaBase ? 'border-red-300' : 'border-slate-300'
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
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                            errors.extra ? 'border-red-300' : 'border-slate-300'
                                        }`}
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
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${
                                            errors.deben ? 'border-red-300' : 'border-slate-300'
                                        }`}
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
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-sm font-semibold text-slate-700">Total Neto</span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Sueldo Base + Extra - Deben
                                </p>
                            </div>

                            <span className="text-3xl font-bold text-purple-600">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>

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
                                placeholder="Notas adicionales..."
                                rows="3"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                            />
                        </div>
                    </div>

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
                            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        >
                            <Save className="h-4 w-4" />
                            <span>Actualizar Nómina</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditNominaFijaModal