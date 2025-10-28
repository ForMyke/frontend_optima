'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/app/services/authService'
import { hasPermission } from '@/config/permissions'

/**
 * Componente HOC para proteger rutas según permisos del usuario
 * Uso: Envolver el contenido de cada página del dashboard
 */
export function RouteGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación y permisos
    const checkAuth = async () => {
      try {
        // 1. Verificar si está autenticado (validación local)
        if (!authService.isAuthenticated()) {
          console.log('❌ No autenticado localmente')
          router.push('/')
          return
        }

        // 2. Obtener usuario
        const user = authService.getUser()
        
        if (!user || !user.rol) {
          console.error('❌ Usuario sin rol definido')
          authService.logout()
          router.push('/')
          return
        }

        // 3. Validar token con el backend (verificar que no esté expirado)
        try {
          const response = await authService.getApiClient().get(`/api/usuarios/${user.id}`)
          
          if (response.status !== 200) {
            console.log('❌ Token inválido en el servidor')
            authService.logout()
            router.push('/')
            return
          }
          
          console.log('✅ Token válido en el servidor')
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('❌ Token expirado o sin permisos:', error.response.status)
            authService.logout()
            router.push('/')
            return
          }
          
          // Si es error de red u otro error, permitir acceso temporalmente
          console.warn('⚠️ Error al validar token, permitiendo acceso temporal:', error.message)
        }

        // 4. Verificar si tiene permiso para acceder a esta ruta
        const hasAccess = hasPermission(user.rol, pathname)
        
        if (!hasAccess) {
          console.warn(`⚠️ Usuario ${user.email} sin permisos para ${pathname}`)
          // Redirigir al dashboard principal (todos tienen acceso)
          router.push('/dashboard')
          return
        }

        // Todo OK, autorizar acceso
        console.log(`✅ Acceso autorizado a ${pathname}`)
        setAuthorized(true)
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error)
        authService.logout()
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Mientras verifica permisos, mostrar loading
  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Usuario autorizado, mostrar contenido
  return <>{children}</>
}
