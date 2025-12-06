import { useState, useEffect } from 'react'
import { X, Save, User, Calendar, DollarSign, Hash, FileText, AlertCircle, CreditCard } from 'lucide-react'
import { authService } from '@/app/services/authService'
import { viajesService } from '@/app/services/viajesService'

// Función para obtener la fecha de ayer en formato YYYY-MM-DD
const getYesterdayDate = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
}

const CreateNominaModal = ({ isOpen, onClose, onSubmit, operadores }) => {
    const [currentUserId, setCurrentUserId] = useState(null)
    const [loadingViajes, setLoadingViajes] = useState(false)
    const [loadingComisiones, setLoadingComisiones] = useState(false)
    const [formData, setFormData] = useState({
        operadorId: '',
        periodoInicio: '',
        periodoFin: getYesterdayDate(), // Fecha de ayer automáticamente
        sueldoBase: '',
        comisionViajes: '',
        bono: '',
        compensacion: '',
        descuentos: '',
        numeroViajes: '',
        alias: '',
        cuenta: '',
        observaciones: ''
    })

    // Obtener el usuario logueado al montar el componente
    useEffect(() => {
        const user = authService.getUser()
        if (user && user.id) {
            setCurrentUserId(user.id)
        }
    }, [])

    // Llamar a la API de comisiones cuando se selecciona un operador y ambas fechas
    useEffect(() => {
        const obtenerComisiones = async () => {
            // Solo llamar si tenemos operador y ambas fechas
            if (!formData.operadorId || !formData.periodoInicio || !formData.periodoFin) {
                return
            }

            try {
                setLoadingComisiones(true)
                const comisionTotal = await viajesService.getComisionesByOperador(
                    formData.operadorId,
                    formData.periodoInicio,
                    formData.periodoFin
                )

                console.log('Comisión recibida de API:', comisionTotal)

                // La API devuelve directamente el número de comisión (ej: 700.00)
                if (comisionTotal !== null && comisionTotal !== undefined) {
                    setFormData(prev => ({
                        ...prev,
                        comisionViajes: comisionTotal.toString()
                    }))
                }
            } catch (error) {
                console.error('Error al obtener comisiones del operador:', error)
                // No mostramos error, simplemente no se auto-completan las comisiones
            } finally {
                setLoadingComisiones(false)
            }
        }

        obtenerComisiones()
    }, [formData.operadorId, formData.periodoInicio, formData.periodoFin])

    // Calcular SOLO el número de viajes (la comisión viene de la API anterior)
    useEffect(() => {
        const calcularNumeroViajes = async () => {
            // Solo calcular si tenemos operador y ambas fechas
            if (!formData.operadorId || !formData.periodoInicio || !formData.periodoFin) {
                return
            }

            try {
                setLoadingViajes(true)
                // Obtener todos los viajes del operador (sin paginación para contar todos)
                const response = await viajesService.getViajesByOperador(formData.operadorId, 0, 1000)
                const viajes = response.content || response || []

                // Filtrar viajes que estén dentro del periodo
                const fechaInicio = new Date(formData.periodoInicio)
                const fechaFin = new Date(formData.periodoFin)

                const viajesEnPeriodo = viajes.filter(viaje => {
                    if (!viaje.fechaSalida) return false
                    const fechaSalida = new Date(viaje.fechaSalida)
                    return fechaSalida >= fechaInicio && fechaSalida <= fechaFin
                })

                // Actualizar SOLO el número de viajes (NO la comisión, esa viene de la API)
                setFormData(prev => ({
                    ...prev,
                    numeroViajes: viajesEnPeriodo.length.toString()
                    // NO sobrescribir comisionViajes aquí
                }))
            } catch (error) {
                console.error('Error al calcular número de viajes:', error)
            } finally {
                setLoadingViajes(false)
            }
        }

        calcularNumeroViajes()
    }, [formData.operadorId, formData.periodoInicio, formData.periodoFin])

    const [errors, setErrors] = useState({})
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                operadorId: '',
                periodoInicio: '',
                periodoFin: getYesterdayDate(), // Siempre la fecha de ayer
                sueldoBase: '',
                comisionViajes: '',
                bono: '',
                compensacion: '',
                descuentos: '',
                numeroViajes: '',
                alias: '',
                cuenta: '',
                observaciones: ''
            })
            setErrors({})
            setTotal(0)
        }
    }, [isOpen])

    // Calcular total automáticamente
    useEffect(() => {
        const sueldoBase = parseFloat(formData.sueldoBase) || 0
        const comisionViajes = parseFloat(formData.comisionViajes) || 0
        const bono = parseFloat(formData.bono) || 0
        const compensacion = parseFloat(formData.compensacion) || 0
        const descuentos = parseFloat(formData.descuentos) || 0

        const totalCalculado = sueldoBase + comisionViajes + bono + compensacion - descuentos
        setTotal(totalCalculado)
    }, [formData.sueldoBase, formData.comisionViajes, formData.bono, formData.compensacion, formData.descuentos])

    // Auto-rellenar datos del operador cuando se selecciona
    useEffect(() => {
        if (formData.operadorId) {
            const operador = operadores.find(op => op.id === parseInt(formData.operadorId))
            if (operador) {
                setFormData(prev => ({
                    ...prev,
                    alias: operador.alias || '',
                    cuenta: operador.cuenta || ''
                }))
            }
        }
    }, [formData.operadorId, operadores])

    const validate = () => {
        const newErrors = {}

        if (!formData.operadorId) {
            newErrors.operadorId = 'Debe seleccionar un operador'
        }

        if (!formData.periodoInicio) {
            newErrors.periodoInicio = 'La fecha de inicio es requerida'
        }

        // periodoFin ya no se valida porque se establece automáticamente (día anterior)

        if (formData.periodoInicio && formData.periodoFin && formData.periodoInicio > formData.periodoFin) {
            newErrors.periodoInicio = 'La fecha de inicio debe ser anterior al día de ayer'
        }

        if (!formData.sueldoBase) {
            newErrors.sueldoBase = 'El sueldo base es requerido'
        } else if (parseFloat(formData.sueldoBase) < 0) {
            newErrors.sueldoBase = 'El sueldo base debe ser mayor o igual a 0'
        }

        // Validar montos numéricos
        if (formData.comisionViajes && parseFloat(formData.comisionViajes) < 0) {
            newErrors.comisionViajes = 'La comisión debe ser mayor o igual a 0'
        }

        if (formData.bono && parseFloat(formData.bono) < 0) {
            newErrors.bono = 'El bono debe ser mayor o igual a 0'
        }

        if (formData.compensacion && parseFloat(formData.compensacion) < 0) {
            newErrors.compensacion = 'La compensación debe ser mayor o igual a 0'
        }

        if (formData.descuentos && parseFloat(formData.descuentos) < 0) {
            newErrors.descuentos = 'Los descuentos deben ser mayor o igual a 0'
        }

        if (formData.numeroViajes && parseInt(formData.numeroViajes) < 0) {
            newErrors.numeroViajes = 'El número de viajes debe ser mayor o igual a 0'
        }

        // Validar cuenta (máximo 8 dígitos)
        if (formData.cuenta && formData.cuenta.length > 8) {
            newErrors.cuenta = 'La cuenta no puede tener más de 8 dígitos'
        }

        if (!currentUserId) {
            newErrors.general = 'No se pudo obtener el usuario actual'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validate()) {
            return
        }

        // Crear la fecha actual en formato ISO
        const now = new Date()
        const creadoEn = now.toISOString()

        const nominaData = {
            operadorId: parseInt(formData.operadorId),
            periodoInicio: formData.periodoInicio,
            periodoFin: formData.periodoFin,
            sueldoBase: parseFloat(formData.sueldoBase),
            comisionViajes: parseFloat(formData.comisionViajes) || 0,
            total: total.toString(),
            bono: parseFloat(formData.bono) || 0,
            compensacion: parseFloat(formData.compensacion) || 0,
            descuentos: parseFloat(formData.descuentos) || 0,
            numeroViajes: parseInt(formData.numeroViajes) || 0,
            alias: formData.alias.trim(),
            cuenta: parseInt(formData.cuenta) || 0,
            observaciones: formData.observaciones.trim(),
            creadoPor: currentUserId,
            creadoEn: creadoEn
        }

        await onSubmit(nominaData)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white p-6 border-b border-slate-200 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Nueva Nómina Operativa</h2>
                            <p className="text-sm text-slate-600 mt-1">Registrar nómina para un operador</p>
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
                    {/* Operador */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Operador <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                name="operadorId"
                                value={formData.operadorId}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${errors.operadorId ? 'border-red-300' : 'border-slate-300'
                                    }`}
                            >
                                <option value="">Seleccionar operador...</option>
                                {operadores.map((operador) => (
                                    <option key={operador.id} value={operador.id}>
                                        {operador.nombre} {operador.alias ? `(${operador.alias})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.operadorId && (
                            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errors.operadorId}</span>
                            </p>
                        )}
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
                                Periodo Fin <span className="text-xs text-blue-600 font-normal">(Automático: día anterior)</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="date"
                                    name="periodoFin"
                                    value={formData.periodoFin}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Se establece automáticamente como el día anterior a hoy
                            </p>
                        </div>
                    </div>

                    {/* Datos del Operador */}
                    <div className="grid grid-cols-2 gap-4">
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
                                    placeholder="Número de cuenta (máx. 8 dígitos)"
                                    maxLength={8}
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

                    {/* Montos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Sueldo Base <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="sueldoBase"
                                    value={formData.sueldoBase}
                                    onChange={handleChange}
                                    placeholder="8000.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.sueldoBase ? 'border-red-300' : 'border-slate-300'
                                        }`}
                                />
                            </div>
                            {errors.sueldoBase && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.sueldoBase}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Comisión por Viajes
                                {loadingComisiones && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                        Cargando desde API...
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="comisionViajes"
                                    value={formData.comisionViajes}
                                    onChange={handleChange}
                                    placeholder="Se carga automáticamente"
                                    step="0.01"
                                    min="0"
                                    disabled={loadingComisiones}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${loadingComisiones ? 'bg-slate-50 cursor-not-allowed' : errors.comisionViajes ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.comisionViajes ? (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.comisionViajes}</span>
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-slate-500">
                                    Se obtiene automáticamente al seleccionar un operador
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Bonos
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="bono"
                                    value={formData.bono}
                                    onChange={handleChange}
                                    placeholder="500.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.bono ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.bono && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.bono}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Compensación
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="compensacion"
                                    value={formData.compensacion}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.compensacion ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.compensacion && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.compensacion}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Descuentos
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="descuentos"
                                    value={formData.descuentos}
                                    onChange={handleChange}
                                    placeholder="200.00"
                                    step="0.01"
                                    min="0"
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.descuentos ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.descuentos && (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.descuentos}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Número de Viajes
                                {loadingViajes && (
                                    <span className="ml-2 text-xs text-blue-600 font-normal">
                                        Calculando...
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="number"
                                    name="numeroViajes"
                                    value={formData.numeroViajes}
                                    onChange={handleChange}
                                    placeholder="Se calcula automáticamente"
                                    min="0"
                                    disabled={loadingViajes}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${loadingViajes ? 'bg-slate-50 cursor-not-allowed' : errors.numeroViajes ? 'border-red-300' : 'border-slate-300'}`}
                                />
                            </div>
                            {errors.numeroViajes ? (
                                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.numeroViajes}</span>
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-slate-500">
                                    Se calcula automáticamente según el operador y periodo
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

export default CreateNominaModal
