'use client'

import { useState, useEffect } from 'react'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText
} from 'lucide-react'

// Función auxiliar para parsear dirección desde string a objeto
const parseDireccion = (direccionString) => {
  const defaultDireccion = {
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México'
  }

  if (!direccionString) return defaultDireccion

  try {
    // Intentar parsear como JSON primero (nuevos registros)
    const direccionObj = JSON.parse(direccionString)
    return { ...defaultDireccion, ...direccionObj }
  } catch (e) {
    // Si falla, es un registro antiguo con formato de string concatenado
    console.log('Parseando dirección legacy:', direccionString)

    const partes = direccionString.split(',').map(p => p.trim())

    // Manejar diferentes longitudes del array
    if (partes.length >= 8) {
      return {
        calle: partes[0] || '',
        numeroExterior: partes[1] || '',
        numeroInterior: partes[2] || '',
        colonia: partes[3] || '',
        ciudad: partes[4] || '',
        estado: partes[5] || '',
        codigoPostal: partes[6] || '',
        pais: partes[7] || 'México'
      }
    }

    // Si tiene menos partes, retornar default
    console.warn('Formato de dirección no reconocido:', direccionString)
    return defaultDireccion
  }
}

const EditClientModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México',
    telefono: '',
    correo: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (client) {
      const direccionParsed = parseDireccion(client.direccion)
      setFormData({
        nombre: client.nombre || '',
        rfc: client.rfc || '',
        ...direccionParsed,
        telefono: client.telefono || '',
        correo: client.correo || ''
      })
    }
  }, [client])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Guardar como JSON en lugar de string concatenado
      const direccionJSON = JSON.stringify({
        calle: formData.calle || '',
        numeroExterior: formData.numeroExterior || '',
        numeroInterior: formData.numeroInterior || '',
        colonia: formData.colonia || '',
        ciudad: formData.ciudad || '',
        estado: formData.estado || '',
        codigoPostal: formData.codigoPostal || '',
        pais: formData.pais || 'México'
      })

      const dataToSend = {
        nombre: formData.nombre,
        rfc: formData.rfc,
        direccion: direccionJSON,
        telefono: formData.telefono,
        correo: formData.correo
      }

      console.log('Actualizando cliente:', dataToSend)
      await onSave(client.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar cliente</h2>
          <p className="text-sm text-slate-600 mt-1">Actualiza la información del cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información General */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Información general
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre / Razón social *
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
                RFC *
              </label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
                maxLength={13}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
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
              {isLoading ? 'Actualizando...' : 'Actualizar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditClientModal