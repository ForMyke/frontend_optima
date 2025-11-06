'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Shield
} from 'lucide-react'

const parseDireccion = (direccionString) => {
  if (!direccionString) return {
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México'
  }

  const partes = direccionString.split(',').map(p => p.trim())

  // Debug: mostrar cómo viene la dirección
  console.log('Dirección guardada:', direccionString)
  console.log('Partes encontradas:', partes.length, partes)

  return {
    calle: partes[0] || '',
    numeroExterior: partes[1] || '',
    numeroInterior: partes[2] || '',
    colonia: partes[3] || '',
    ciudad: partes[4] || '',
    estado: partes[5] || '',
    codigoPostal: partes[7] || '',
    pais: partes[8] || 'México'
  }
}

const EditOperadorModal = ({ isOpen, onClose, onSave, operador, users }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México',
    licenciaNumero: '',
    licenciaTipo: 'A',
    licenciaVencimiento: '',
    usuarioId: '',
    activo: true
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (operador) {
      const direccionParsed = parseDireccion(operador.direccion)
      setFormData({
        nombre: operador.nombre || '',
        telefono: operador.telefono || '',
        ...direccionParsed,
        licenciaNumero: operador.licenciaNumero || '',
        licenciaTipo: operador.licenciaTipo || 'A',
        licenciaVencimiento: operador.licenciaVencimiento || '',
        usuarioId: operador.usuarioId || '',
        activo: operador.activo ?? true
      })
    }
  }, [operador])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Concatenar dirección manteniendo el orden exacto (sin filtrar vacíos)
      const direccionCompleta = [
        formData.calle || '',
        formData.numeroExterior || '',
        formData.numeroInterior || '',
        formData.colonia || '',
        formData.ciudad || '',
        formData.estado || '',
        formData.codigoPostal || '',
        formData.pais || 'México'
      ].join(', ')

      const dataToSend = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        direccion: direccionCompleta,
        licenciaNumero: formData.licenciaNumero,
        licenciaTipo: formData.licenciaTipo,
        licenciaVencimiento: formData.licenciaVencimiento,
        usuarioId: formData.usuarioId ? parseInt(formData.usuarioId) : null,
        activo: formData.activo
      }

      await onSave(operador.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving operador:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar operador</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del operador</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Personal */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Información personal
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario asociado
              </label>
              <select
                value={formData.usuarioId}
                onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              >
                <option value="">Sin usuario asociado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombre} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Dirección */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Dirección
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calle *
              </label>
              <input
                type="text"
                value={formData.calle}
                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Números Exterior / Interior *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.numeroExterior}
                  onChange={(e) => setFormData({ ...formData, numeroExterior: e.target.value })}
                  placeholder="Ext.*"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                  required
                />
                <input
                  type="text"
                  value={formData.numeroInterior}
                  onChange={(e) => setFormData({ ...formData, numeroInterior: e.target.value })}
                  placeholder="Int."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Colonia *
              </label>
              <input
                type="text"
                value={formData.colonia}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado *
              </label>
              <input
                type="text"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código Postal *
              </label>
              <input
                type="text"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                País *
              </label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            {/* Información de Licencia */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Información de licencia
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Número de licencia *
              </label>
              <input
                type="text"
                value={formData.licenciaNumero}
                onChange={(e) => setFormData({ ...formData, licenciaNumero: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de licencia *
              </label>
              <select
                value={formData.licenciaTipo}
                onChange={(e) => setFormData({ ...formData, licenciaTipo: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              >
                <option value="A">A - Motocicletas</option>
                <option value="B">B - Automóviles</option>
                <option value="C">C - Camiones ligeros</option>
                <option value="D">D - Camiones pesados</option>
                <option value="E">E - Transporte de pasajeros</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={formData.licenciaVencimiento}
                onChange={(e) => setFormData({ ...formData, licenciaVencimiento: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Operador activo</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              {isLoading ? 'Actualizando...' : 'Actualizar operador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditOperadorModal