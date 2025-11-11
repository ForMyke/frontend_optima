'use client'

import { Warehouse, MapPin, User, X } from 'lucide-react'

const ViewAlmacenModal = ({ isOpen, onClose, almacen }) => {
  if (!isOpen || !almacen) return null

  // El backend devuelve el encargado como objeto completo
  const encargado = almacen.encargado

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Detalles del almacén</h2>
            <p className="text-sm text-slate-600 mt-1">Información completa del centro de almacenamiento</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Warehouse className="h-5 w-5 mr-2" />
              Información Básica
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Nombre</p>
                <p className="text-base text-slate-900">{almacen.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Ubicación
                </p>
                <p className="text-base text-slate-900">{almacen.ubicacion}</p>
              </div>
            </div>
          </div>

          {/* Encargado */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Encargado
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              {encargado ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Nombre</p>
                    <p className="text-base text-slate-900">{encargado.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Email</p>
                    <p className="text-base text-slate-900">{encargado.email}</p>
                  </div>
                  {encargado.telefono && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Teléfono</p>
                      <p className="text-base text-slate-900">{encargado.telefono}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-2">Sin encargado asignado</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 cursor-pointer py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ViewAlmacenModal
