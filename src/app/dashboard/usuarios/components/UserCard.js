'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react'

const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Cerrar el menú al hacer clic fuera
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
              user.rolNombre === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
              user.rolNombre === 'MANAGER' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <span className="text-white font-bold text-lg">
                {user.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{user.nombre}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {user.rolesArray && user.rolesArray.length > 0 ? (
                  user.rolesArray.map((rol, index) => (
                    <span key={index} className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      rol === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {rol}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                    <Shield className="h-3 w-3 mr-1" />
                    USER
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                  user.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.activo ? (
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
                    onViewDetails(user)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(user)
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
                    onDelete(user)
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
            <Mail className="h-4 w-4 mr-2 text-slate-400" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            Creado: {user.creadoEn ? new Date(user.creadoEn).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserCard
