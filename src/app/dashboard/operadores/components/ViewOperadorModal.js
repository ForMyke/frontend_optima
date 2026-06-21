'use client'

import {
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  XCircle,
  DollarSign,
  Hash
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

const ViewOperadorModal = ({ isOpen, onClose, operador }) => {
  if (!isOpen || !operador) return null

  const direccionParsed = parseDireccion(operador.direccion)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del operador</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del operador</p>
            </div>

            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              operador.activo
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <User className="h-7 w-7 text-white" />
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
                <label className="text-xs font-medium text-slate-500">Nombre completo</label>
                <p className="text-sm text-slate-900 mt-1">{operador.nombre || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Teléfono</label>
                <p className="text-sm text-slate-900 mt-1">{operador.telefono || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Información laboral
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Sueldo base</label>
                <p className="text-sm text-slate-900 mt-1">{formatMoney(operador.sueldoBase)}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">ECO</label>
                <p className="text-sm text-slate-900 mt-1">{operador.eco || 'N/A'}</p>
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
                <label className="text-xs font-medium text-slate-500">Calle</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.calle || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Número Exterior</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.numeroExterior || 'N/A'}</p>
              </div>

              {direccionParsed.numeroInterior && (
                <div>
                  <label className="text-xs font-medium text-slate-500">Número Interior</label>
                  <p className="text-sm text-slate-900 mt-1">{direccionParsed.numeroInterior}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-500">Colonia</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.colonia || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Ciudad</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.ciudad || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.estado || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Código Postal</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.codigoPostal || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">País</label>
                <p className="text-sm text-slate-900 mt-1">{direccionParsed.pais || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Información de licencia
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Número de licencia</label>
                <p className="text-sm text-slate-900 mt-1">{operador.licenciaNumero || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Tipo</label>
                <p className="text-sm text-slate-900 mt-1">Tipo {operador.licenciaTipo || 'N/A'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de vencimiento</label>
                <p className="text-sm text-slate-900 mt-1">
                  {operador.licenciaVencimiento
                    ? new Date(operador.licenciaVencimiento).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>

                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                    operador.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {operador.activo ? (
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

export default ViewOperadorModal