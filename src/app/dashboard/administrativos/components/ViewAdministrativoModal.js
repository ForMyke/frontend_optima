'use client'

import {
  User,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Briefcase,
  DollarSign,
  CreditCard,
  Calendar
} from 'lucide-react'

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value || 0))
}

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
      pais: ''
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
    pais: partes[7] || ''
  }
}

const ViewAdministrativoModal = ({ isOpen, onClose, administrativo }) => {
  if (!isOpen || !administrativo) return null

  const direccionParsed = parseDireccion(administrativo.direccion)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Detalles del administrativo
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Información completa del administrativo
              </p>
            </div>

            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              administrativo.activo
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <Briefcase className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Información personal
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Nombre completo
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.nombre || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Puesto
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.puesto || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Teléfono
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.telefono || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Correo
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.email || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Estado
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                    administrativo.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {administrativo.activo ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactivo
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Creado en
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.creadoEn
                    ? new Date(administrativo.creadoEn).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Información de sueldo
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Sueldo base
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {formatMoney(administrativo.sueldoBase)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Datos de pago
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Nombre de cuenta
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.nombreCuenta || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Alias
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.alias || 'N/A'}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500">
                  Cuenta
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {administrativo.cuenta || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Ubicación
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Calle
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.calle || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Número exterior
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.numeroExterior || 'N/A'}
                </p>
              </div>

              {direccionParsed.numeroInterior && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Número interior
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {direccionParsed.numeroInterior}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Colonia
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.colonia || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Ciudad
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.ciudad || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Estado
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.estado || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Código postal
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.codigoPostal || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  País
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.pais || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewAdministrativoModal