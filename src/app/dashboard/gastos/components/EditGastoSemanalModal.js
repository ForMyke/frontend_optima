import { useState, useEffect } from 'react'
import { X, Save, Calendar, DollarSign, AlertCircle } from 'lucide-react'

const EditGastoSemanalModal = ({ isOpen, onClose, onSubmit, gasto }) => {
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

  useEffect(() => {
    if (isOpen && gasto) {
      setFormData({
        semanaInicio: gasto.semanaInicio || '',
        semanaFin: gasto.semanaFin || '',
        iave: gasto.iave || '',
        imss: gasto.imss || '',
        infonavit: gasto.infonavit || '',
        diesel: gasto.diesel || '',
        nomina: gasto.nomina || '',
        refacciones: gasto.refacciones || '',
        contador: gasto.contador || '',
        gps: gasto.gps || '',
        gastosExtras: gasto.gastosExtras || '',
        seguros: gasto.seguros || '',
        creditos: gasto.creditos || '',
        telefonia: gasto.telefonia || '',
        observaciones: gasto.observaciones || ''
      })
      setErrors({})
    }
  }, [isOpen, gasto])

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
      telefonia: parseFloat(formData.telefonia || 0)
    }

    await onSubmit(gasto.id, gastoData)
  }

  if (!isOpen || !gasto) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar Gasto Semanal</h2>
          <p className="text-sm text-slate-600 mt-1">Modificar gastos de la semana #{gasto.id}</p>
        </div>

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
            {[
              { name: 'iave', label: 'IAVE' },
              { name: 'imss', label: 'IMSS' },
              { name: 'infonavit', label: 'INFONAVIT' },
              { name: 'diesel', label: 'Diesel' },
              { name: 'nomina', label: 'Nómina' },
              { name: 'refacciones', label: 'Refacciones' },
              { name: 'contador', label: 'Contador' },
              { name: 'gps', label: 'GPS' },
              { name: 'gastosExtras', label: 'Gastos Extras' },
              { name: 'seguros', label: 'Seguros' },
              { name: 'creditos', label: 'Créditos' },
              { name: 'telefonia', label: 'Telefonía' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            ))}
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
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditGastoSemanalModal
