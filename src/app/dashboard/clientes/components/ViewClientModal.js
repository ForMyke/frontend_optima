'use client'

import {
  Building2,
  Phone,
  MapPin
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

const ViewClientModal = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null

  const direccionParsed = parseDireccion(client.direccion)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del cliente</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del cliente</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Información general
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre / Razón social</label>
                <p className="text-sm text-slate-900 mt-1">{client.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">RFC</label>
                <p className="text-sm text-slate-900 mt-1">{client.rfc}</p>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Información de contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Correo electrónico</label>
                <p className="text-sm text-slate-900 mt-1">{client.correo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Teléfono</label>
                <p className="text-sm text-slate-900 mt-1">{client.telefono}</p>
              </div>
            </div>
          </div>

          {/* Dirección */}
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

export default ViewClientModal