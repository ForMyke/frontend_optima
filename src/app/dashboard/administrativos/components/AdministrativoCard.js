'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User,
  Briefcase,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  CreditCard
} from 'lucide-react'

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value || 0))
}

const AdministrativoCard = ({ administrativo, onEdit, onDelete, onViewDetails }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              administrativo.activo
                ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                : 'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <Briefcase className="h-6 w-6 text-white" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {administrativo.nombre}
              </h3>

              <p className="text-sm text-slate-500 mt-0.5">
                {administrativo.puesto || 'Sin puesto asignado'}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
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
                    onViewDetails(administrativo)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>

                <button
                  onClick={() => {
                    onEdit(administrativo)
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
                    onDelete(administrativo)
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
            {administrativo.telefono || 'Sin teléfono'}
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Mail className="h-4 w-4 mr-2 text-slate-400" />
            {administrativo.email || 'Sin correo'}
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <DollarSign className="h-4 w-4 mr-2 text-slate-400" />
            Sueldo base: {formatMoney(administrativo.sueldoBase)}
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <CreditCard className="h-4 w-4 mr-2 text-slate-400" />
            Alias: {administrativo.alias || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdministrativoCard