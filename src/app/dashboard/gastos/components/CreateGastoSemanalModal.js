'use client'

import { useState, useEffect } from 'react'
import { X, Save, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { authService } from '@/app/services/authService'
import gastosService from '@/app/services/gastosService'
import toast from 'react-hot-toast'

const CreateGastoSemanalModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    semanaInicio: '',
    semanaFin: '',
    iave: '',
    imss: '',
    infonavit: '',
    diesel: '',
    nomina: '',
    refacciones: '',
    contador: '',
    gps: '',
    gastosExtras: '',
    seguros: '',
    creditos: '',
    telefonia: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState({})
  const [totalViajes, setTotalViajes] = useState(0)
  const [loadingDatos, setLoadingDatos] = useState(false)

  useEffect(() => {
    const loadDatosGenerados = async () => {
      if (isOpen) {
        setLoadingDatos(true)
        try {
          // Cargar datos generados por la API
          const datosGenerados = await gastosService.getGastosGenerados()
          
          setFormData({
            semanaInicio: datosGenerados.fechaInicio || '',
            semanaFin: datosGenerados.fechaFin || '',
            iave: datosGenerados.iave || '',
            imss: '',
            infonavit: '',
            diesel: datosGenerados.diesel || '',
            nomina: datosGenerados.nomina || '',
            refacciones: '',
            contador: '',
            gps: '',
            gastosExtras: datosGenerados.gastosExtras || '',
            seguros: '',
            creditos: '',
            telefonia: '',
            observaciones: ''
          })
          
          setTotalViajes(datosGenerados.totalViajes || 0)
          setErrors({})
        } catch (error) {
          console.error('Error al cargar datos generados:', error)
          toast.error('Error al cargar datos automáticos')
          // Resetear a valores vacíos si falla
          setFormData({
            semanaInicio: '',
            semanaFin: '',
            iave: '',
            imss: '',
            infonavit: '',
            diesel: '',
            nomina: '',
            refacciones: '',
            contador: '',
            gps: '',
            gastosExtras: '',
            seguros: '',
            creditos: '',
            telefonia: '',
            observaciones: ''
          })
          setTotalViajes(0)
        } finally {
          setLoadingDatos(false)
        }
      } else {
        // Limpiar cuando se cierra
        setFormData({
          semanaInicio: '',
          semanaFin: '',
          iave: '',
          imss: '',
          infonavit: '',
          diesel: '',
          nomina: '',
          refacciones: '',
          contador: '',
          gps: '',
          gastosExtras: '',
          seguros: '',
          creditos: '',
          telefonia: '',
          observaciones: ''
        })
        setTotalViajes(0)
        setErrors({})
      }
    }

    loadDatosGenerados()
  }, [isOpen])

  const validate = () => {
    const newErrors = {}

    if (!formData.semanaInicio) {
      newErrors.semanaInicio = 'La fecha de inicio es requerida'
    }

    if (!formData.semanaFin) {
      newErrors.semanaFin = 'La fecha de fin es requerida'
    } else if (formData.semanaInicio && formData.semanaFin < formData.semanaInicio) {
      newErrors.semanaFin = 'La fecha de fin debe ser posterior al inicio'
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

    const user = authService.getUser()
    const creadoPor = user?.id || 1

    const gastoData = {
      ...formData,
      iave: parseFloat(formData.iave || 0),
      imss: parseFloat(formData.imss || 0),
      infonavit: parseFloat(formData.infonavit || 0),
      diesel: parseFloat(formData.diesel || 0),
      nomina: parseFloat(formData.nomina || 0),
      refacciones: parseFloat(formData.refacciones || 0),
      contador: parseFloat(formData.contador || 0),
      gps: parseFloat(formData.gps || 0),
      gastosExtras: parseFloat(formData.gastosExtras || 0),
      seguros: parseFloat(formData.seguros || 0),
      creditos: parseFloat(formData.creditos || 0),
      telefonia: parseFloat(formData.telefonia || 0),
      creadoPor
    }

    await onSubmit(gastoData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo Gasto Semanal</h2>
          <p className="text-sm text-slate-600 mt-1">Registrar gastos de la semana</p>
          
          {/* Mostrar total de viajes si está disponible */}
          {totalViajes > 0 && (
            <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Total de viajes: {totalViajes}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loadingDatos && (
          <div className="p-6">
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              <span>Cargando datos automáticos...</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fechas de Semana */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Inicio de Semana <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  name="semanaInicio"
                  value={formData.semanaInicio}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.semanaInicio ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.semanaInicio && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.semanaInicio}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fin de Semana <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  name="semanaFin"
                  value={formData.semanaFin}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.semanaFin ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.semanaFin && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.semanaFin}</span>
                </p>
              )}
            </div>
          </div>

          {/* Gastos - Grid 3 columnas */}
          <div className="grid grid-cols-3 gap-4">
            {/* IAVE */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                IAVE
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="iave"
                  value={formData.iave}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* IMSS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">IMSS</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="imss"
                  value={formData.imss}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* INFONAVIT */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">INFONAVIT</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="infonavit"
                  value={formData.infonavit}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Diesel */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                Diesel
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="diesel"
                  value={formData.diesel}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Nómina */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                Nómina
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="nomina"
                  value={formData.nomina}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Refacciones */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Refacciones</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="refacciones"
                  value={formData.refacciones}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Contador */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contador</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="contador"
                  value={formData.contador}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* GPS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">GPS</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="gps"
                  value={formData.gps}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Gastos Extras */}
            <div>
              <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                Gastos Extras
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="gastosExtras"
                  value={formData.gastosExtras}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-blue-300 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Seguros */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Seguros</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="seguros"
                  value={formData.seguros}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Créditos */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Créditos</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="creditos"
                  value={formData.creditos}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Telefonía */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefonía</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="telefonia"
                  value={formData.telefonia}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales sobre los gastos de la semana..."
              rows="3"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
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
              <span>Guardar Gasto Semanal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGastoSemanalModal
