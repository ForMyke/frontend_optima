'use client'

import { Users as UsersIcon, Shield, CheckCircle, XCircle, Calendar } from 'lucide-react'

const ViewUserModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalles del usuario</h2>
              <p className="text-sm text-slate-600 mt-1">Información completa del usuario</p>
            </div>
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              user.rolNombre === 'ADMIN' ? 'bg-gradient-to-br from-purple-600 to-purple-700' :
              user.rolNombre === 'MANAGER' ? 'bg-gradient-to-br from-blue-600 to-blue-700' :
              'bg-gradient-to-br from-slate-600 to-slate-700'
            }`}>
              <span className="text-white font-bold text-2xl">
                {user.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              Información personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Nombre completo</label>
                <p className="text-sm text-slate-900 mt-1">{user.nombre}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Email</label>
                <p className="text-sm text-slate-900 mt-1">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Información del Rol */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Roles y permisos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">Roles Asignados</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.rolesArray && user.rolesArray.length > 0 ? (
                    user.rolesArray.map((rol, index) => (
                      <span key={index} className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                        rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        rol === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        <Shield className="h-3 w-3 mr-1" />
                        {rol}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Sin roles asignados
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Estado</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
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
          </div>

          {/* Información del Sistema */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Información del sistema
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">ID de Usuario</label>
                <p className="text-sm text-slate-900 mt-1">#{user.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Fecha de Creación</label>
                <p className="text-sm text-slate-900 mt-1">
                  {user.creadoEn ? new Date(user.creadoEn).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
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

export default ViewUserModal
