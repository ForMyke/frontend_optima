'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Building2,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

const ClientCard = ({ client, onEdit, onDelete, onViewDetails }) => {
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

  // NUEVO: Función para formatear la dirección desde JSON o string
  const formatearDireccion = () => {
    if (!client.direccion) return 'Sin dirección'

    try {
      const direccion = typeof client.direccion === 'string'
        ? JSON.parse(client.direccion)
        : client.direccion

      // Construir dirección compacta para el card
      const partes = []

      if (direccion.calle && direccion.numeroExterior) {
        partes.push(`${direccion.calle} ${direccion.numeroExterior}`)
      } else if (direccion.calle) {
        partes.push(direccion.calle)
      }

      if (direccion.ciudad) partes.push(direccion.ciudad)
      if (direccion.estado) partes.push(direccion.estado)

      return partes.join(', ') || 'Sin dirección'
    } catch (e) {
      // Si no es JSON, retornar el string tal cual (retrocompatibilidad)
      return client.direccion
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
      <div className="p-4 lg:p-6">
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 shrink-0">
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-900">{client.nombre}</h3>
              <p className="text-xs lg:text-sm text-slate-500 mt-1">RFC: {client.rfc}</p>
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
                    onViewDetails(client)
                    setShowMenu(false)
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>
                <button
                  onClick={() => {
                    onEdit(client)
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
                    onDelete(client)
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
          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Mail className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            <span className="truncate">{client.correo}</span>
          </div>
          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            {client.telefono}
          </div>
          <div className="flex items-start text-xs lg:text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{formatearDireccion()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCard