'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  Calendar
} from 'lucide-react'

const OperadorCard = ({ operador, onEdit, onDelete, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Verificar si la licencia está por vencer (30 días o menos)
  const isLicenseExpiringSoon = () => {
    if (!operador.licenciaVencimiento) return false
    const today = new Date()
    const expirationDate = new Date(operador.licenciaVencimiento)
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0
  }

  const isLicenseExpired = () => {
    if (!operador.licenciaVencimiento) return false
    const today = new Date()
    const expirationDate = new Date(operador.licenciaVencimiento)
    return expirationDate < today
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${operador.activo
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
              }`}>
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{operador.nombre}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${operador.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
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
                {isLicenseExpired() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Licencia vencida
                  </span>
                )}
                {!isLicenseExpired() && isLicenseExpiringSoon() && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Por vencer
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                <button
                  onClick={() => {
                    onViewDetails(operador)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(operador)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-3 text-slate-400" />
                  Editar
                </button>
                <hr className="my-2 border-slate-100" />
                <button
                  onClick={() => {
                    onDelete(operador)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400" />
            {operador.telefono}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
            Licencia: {operador.licenciaNumero} - Tipo {operador.licenciaTipo}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            Vence: {operador.licenciaVencimiento ? new Date(operador.licenciaVencimiento).toLocaleDateString('es-MX') : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OperadorCard
