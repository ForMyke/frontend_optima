import { NextResponse } from 'next/server'

/**
 * Decodificar JWT sin verificar firma (solo para leer expiración)
 */
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('utf-8')
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decodificando token en middleware:', error)
    return null
  }
}

/**
 * Verificar si el token está expirado
 */
function isTokenExpired(token) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  // exp está en segundos, Date.now() en milisegundos
  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  
  return currentTime >= expirationTime
}

/**
 * Middleware de Next.js para proteger rutas
 * Se ejecuta en TODAS las peticiones antes de renderizar
 */
export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Obtener el token de las cookies
  const token = request.cookies.get('token')?.value
  
  // Si está intentando acceder al dashboard sin token, redirigir a login
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('🔒 Middleware: Sin token, redirigiendo a login')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Verificar si el token está expirado
    if (isTokenExpired(token)) {
      console.log('⏰ Middleware: Token expirado, redirigiendo a login')
      
      // Crear respuesta de redirección
      const response = NextResponse.redirect(new URL('/', request.url))
      
      // Eliminar la cookie del token expirado
      response.cookies.set('token', '', {
        path: '/',
        expires: new Date(0),
      })
      
      return response
    }
    
    console.log('✅ Middleware: Token válido, permitiendo acceso a', pathname)
  }
  
  // Si está en la página de login y ya tiene token válido, redirigir al dashboard
  if (pathname === '/' && token && !isTokenExpired(token)) {
    console.log('🔄 Middleware: Ya tiene sesión válida, redirigiendo a dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Agregar headers anti-caché a todas las respuestas
  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

/**
 * Configurar en qué rutas se ejecuta el middleware
 */
export const config = {
  matcher: [
    /*
     * Match todas las rutas excepto:
     * - api (API routes)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
