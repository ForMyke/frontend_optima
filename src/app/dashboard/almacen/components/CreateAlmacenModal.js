'use client'

import { useState } from 'react'
import { Warehouse, MapPin, User, AlertCircle } from 'lucide-react'

const CreateAlmacenModal = ({ isOpen, onClose, onSave, usuarios }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    encargadoId: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSend = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion
      }
      
      // Solo agregar encargadoId si tiene un valor válido
      if (formData.encargadoId && formData.encargadoId !== '') {
        dataToSend.encargadoId = parseInt(formData.encargadoId)
      }
      
      await onSave(dataToSend)
      setFormData({ nombre: '', ubicacion: '', encargadoId: '' })
      onClose()
    } catch (error) {
      console.error('Error saving almacen:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Nuevo almacén</h2>
          <p className="text-sm text-slate-600 mt-1">Registra un nuevo centro de almacenamiento</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Warehouse className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del almacén *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    placeholder="Ej: Almacén Central"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ubicación *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                      placeholder="Ej: Av. Principal #123, Ciudad"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Encargado */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Encargado (Opcional)
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar encargado
                </label>
                <select
                  value={formData.encargadoId}
                  onChange={(e) => setFormData({ ...formData, encargadoId: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                >
                  <option value="">Sin encargado asignado</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} - {usuario.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Puedes asignar un encargado ahora o hacerlo después
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 cursor-pointer py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardando...' : 'Crear almacén'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAlmacenModal
