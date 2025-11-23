'use client'

import { Wrench, FileText, Package, DollarSign, Warehouse, X, User, Calendar } from 'lucide-react'

const ViewRefaccionModal = ({ isOpen, onClose, refaccion }) => {
  if (!isOpen || !refaccion) return null

  const almacen = refaccion.almacen
  const valorTotal = (refaccion.stockActual || 0) * (refaccion.costoUnitario || 0)

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Detalles de la refacción</h2>
            <p className="text-sm text-slate-600 mt-1">Información completa del artículo</p>
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
              <Wrench className="h-5 w-5 mr-2" />
              Información Básica
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Nombre</p>
                <p className="text-base text-slate-900">{refaccion.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Descripción
                </p>
                <p className="text-base text-slate-900">{refaccion.descripcion || 'Sin descripción'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 font-medium mb-1">Unidad de medida</p>
                <p className="text-base text-slate-900 capitalize">{refaccion.unidadMedida}</p>
              </div>
            </div>
          </div>

          {/* Inventario y Costo */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Inventario y Costo
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Stock actual</p>
                  <p className="text-base text-slate-900 font-semibold">
                    {refaccion.stockActual} {refaccion.unidadMedida}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Costo unitario
                  </p>
                  <p className="text-base text-slate-900 font-semibold">
                    ${(refaccion.costoUnitario || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-sm text-slate-600 font-medium mb-1">Valor total en inventario</p>
                <p className="text-xl text-blue-600 font-bold">
                  ${valorTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Almacén */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Warehouse className="h-5 w-5 mr-2" />
              Ubicación
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              {almacen ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Almacén</p>
                    <p className="text-base text-slate-900">{almacen.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 font-medium mb-1">Ubicación</p>
                    <p className="text-base text-slate-900">{almacen.ubicacion}</p>
                  </div>
                  {almacen.encargado && (
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">Encargado</p>
                      <p className="text-base text-slate-900">{almacen.encargado.nombre}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-2">Sin almacén asignado</p>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Información adicional
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              {refaccion.nombreVendedor && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Vendedor
                  </span>
                  <span className="text-base text-slate-900 font-medium">
                    {refaccion.nombreVendedor}
                  </span>
                </div>
              )}
              {refaccion.fechaCreacion && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha de creación
                  </span>
                  <span className="text-base text-slate-900 font-medium">
                    {new Date(refaccion.fechaCreacion).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {!refaccion.nombreVendedor && !refaccion.fechaCreacion && (
                <p className="text-slate-500 text-center py-2">Sin información adicional</p>
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

export default ViewRefaccionModal
