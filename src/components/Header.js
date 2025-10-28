'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, LogOut, ChevronDown, Menu } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/app/services/authService'
import { getRoleDisplayName } from '@/config/permissions'

export function Header({ onMenuClick }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const router = useRouter()
  const userMenuRef = useRef(null)

  // Cargar usuario de forma memoizada
  const user = useMemo(() => {
    if (typeof window !== 'undefined') {
      return authService.getUser()
    }
    return null
  }, [])

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleSignOut = () => {
    authService.logout()
    toast.success('Sesión cerrada correctamente')
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-end px-4 lg:px-6 py-3 lg:py-4">
        {/* Botón menú móvil */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-6 w-6 text-slate-600" />
        </button>



        <div className="flex items-center space-x-2 lg:space-x-4 ml-auto lg:ml-6">
          <button className="relative p-2 lg:p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 lg:top-2 lg:right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-all group"
              suppressHydrationWarning
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-linear-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="text-left hidden lg:block" suppressHydrationWarning>
                <p className="text-sm font-semibold text-slate-700">
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.rol ? getRoleDisplayName(user.rol) : 'Usuario'}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'usuario@optima.com'}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {user?.rol ? getRoleDisplayName(user.rol) : 'Usuario'}
                  </p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex cursor-pointer items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  )
}
