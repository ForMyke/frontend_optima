'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Phone,
  MapPin,
  Mail,
  Briefcase,
  DollarSign,
  CreditCard
} from 'lucide-react'

const parseDireccion = (direccionString) => {
  if (!direccionString) {
    return {
      calle: '',
      numeroExterior: '',
      numeroInterior: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      pais: 'México'
    }
  }

  const partes = direccionString.split(',').map(p => p.trim())

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

const EditAdministrativoModal = ({ isOpen, onClose, onSave, administrativo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    puesto: '',
    telefono: '',
    email: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    pais: 'México',
    sueldoBase: '',
    nombreCuenta: '',
    alias: '',
    cuenta: '',
    activo: true
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (administrativo) {
      const direccionParsed = parseDireccion(administrativo.direccion)

      setFormData({
        nombre: administrativo.nombre || '',
        puesto: administrativo.puesto || '',
        telefono: administrativo.telefono || '',
        email: administrativo.email || '',
        ...direccionParsed,
        sueldoBase: administrativo.sueldoBase ?? '',
        nombreCuenta: administrativo.nombreCuenta || '',
        alias: administrativo.alias || '',
        cuenta: administrativo.cuenta || '',
        activo: administrativo.activo ?? true
      })
    }
  }, [administrativo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
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
        puesto: formData.puesto,
        telefono: formData.telefono,
        direccion: direccionCompleta,
        email: formData.email,
        sueldoBase: Number(formData.sueldoBase || 0),
        nombreCuenta: formData.nombreCuenta,
        alias: formData.alias,
        cuenta: formData.cuenta,
        activo: formData.activo
      }

      await onSave(administrativo.id, dataToSend)
      onClose()
    } catch (error) {
      console.error('Error saving administrativo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !administrativo) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Editar administrativo</h2>
          <p className="text-sm text-slate-600 mt-1">
            Actualiza la información del administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Puesto
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

                <input
                  type="text"
                  value={formData.puesto}
                  onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Información de sueldo
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sueldo base *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.sueldoBase}
                onChange={(e) => setFormData({ ...formData, sueldoBase: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                required
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Datos de pago
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de cuenta
              </label>
              <input
                type="text"
                value={formData.nombreCuenta}
                onChange={(e) => setFormData({ ...formData, nombreCuenta: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Alias
              </label>
              <input
                type="text"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cuenta
              </label>
              <input
                type="text"
                value={formData.cuenta}
                onChange={(e) => setFormData({ ...formData, cuenta: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Dirección
              </h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calle
              </label>
              <input
                type="text"
                value={formData.calle}
                onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Números Exterior / Interior
              </label>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.numeroExterior}
                  onChange={(e) => setFormData({ ...formData, numeroExterior: e.target.value })}
                  placeholder="Ext."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
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
                Colonia
              </label>
              <input
                type="text"
                value={formData.colonia}
                onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estado
              </label>
              <input
                type="text"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                País
              </label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-900"
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

                <span className="text-sm font-medium text-slate-700">
                  Administrativo activo
                </span>
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
              {isLoading ? 'Actualizando...' : 'Actualizar administrativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditAdministrativoModal