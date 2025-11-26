'use client'

import { useState, useEffect } from 'react'
import { Truck, Settings, Wrench, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const EditUnidadModal = ({ isOpen, onClose, onSave, unidad }) => {
  const [formData, setFormData] = useState({
    placas: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    tipo: 'TRACTOCAMION',
    kilometrajeActual: '',
    fechaUltimoMto: '',
    estado: 'ACTIVA',
    creadoPorId: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (unidad) {
      setFormData({
        placas: unidad.placas || '',
        marca: unidad.marca || '',
        modelo: unidad.modelo || '',
        anio: unidad.anio || new Date().getFullYear(),
        tipo: unidad.tipo || 'TRACTOCAMION',
        kilometrajeActual: unidad.kilometrajeActual || '',
        fechaUltimoMto: unidad.fechaUltimoMto || '',
        estado: unidad.estado || 'ACTIVA',
        creadoPorId: unidad.creadoPorId || 1
      })
    }
  }, [unidad])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const dataToSend = {
        ...formData,
        anio: parseInt(formData.anio),
        kilometrajeActual: parseFloat(formData.kilometrajeActual) || 0,
        creadoPorId: parseInt(formData.creadoPorId)
      }
      await onSave(unidad.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving unidad:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full my-8">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar unidad</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información de la unidad</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Número Económico *
                  </label>
                  <input
                    type="text"
                    value={formData.placas}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                      setFormData({ ...formData, placas: value })
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Especificaciones */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Especificaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de unidad *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="TRACTOCAMION">Tractocamión</option>
                    <option value="CAMION">Camión</option>
                    <option value="CAMIONETA">Camioneta</option>
                    <option value="REMOLQUE">Remolque</option>
                    <option value="SEMIREMOLQUE">Semiremolque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  >
                    <option value="ACTIVA">Activa</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVA">Inactiva</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Mantenimiento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Kilometraje actual *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.kilometrajeActual}
                    onChange={(e) => {
                      const value = Math.max(0, parseFloat(e.target.value) || 0)
                      setFormData({ ...formData, kilometrajeActual: value.toString() })
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha último mantenimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.fechaUltimoMto}
                    onChange={(e) => setFormData({ ...formData, fechaUltimoMto: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Usuario */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Información de registro
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Creado por (ID Usuario) *
                  </label>
                  <input
                    type="number"
                    value={formData.creadoPorId}
                    onChange={(e) => setFormData({ ...formData, creadoPorId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                    required
                  />
                </div>
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
              {isLoading ? 'Actualizando...' : 'Actualizar unidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditUnidadModal
