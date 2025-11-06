'use client'

import { Trash2 } from 'lucide-react'

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, operadorName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Eliminar operador</h2>
          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar a <span className="font-semibold">{operadorName}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 cursor-pointer px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
