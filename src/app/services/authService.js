import axios from 'axios'

// Configuración de la URL del backend
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://transportes-backend-formyke.fly.dev' // URL para pruebas QA
// const API_URL = 'http://localhost:8080' // URL local para desarrollo
const API_URL = 'https://transportes-backend.fly.dev' // URL para producción

// Función para decodificar el JWT y obtener la expiración real
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error al decodificar JWT:', error)
    return null
  }
}

// Función para verificar si el token está expirado
const isTokenExpired = (token) => {
  if (!token) return true
  
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  // exp está en segundos, Date.now() en milisegundos
  const expirationTime = decoded.exp * 1000
  const currentTime = Date.now()
  
  // Agregar un margen de 30 segundos para evitar problemas de sincronización
  const isExpired = currentTime >= (expirationTime - 30000)
  
  if (isExpired) {
    console.log('⏰ Token expirado:', new Date(expirationTime).toLocaleString())
  }
  
  return isExpired
}

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Headers para evitar caché
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 30000, // 30 segundos timeout
})

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Solo en el cliente (navegador)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      
      // Verificar si el token está expirado ANTES de hacer la petición
      if (token && isTokenExpired(token)) {
        console.log('❌ Token expirado detectado. Limpiando sesión...')
        authService.logout()
        
        // Rechazar la petición
        return Promise.reject({
          response: {
            status: 401,
          }
        })
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error
    
    // Si el error es de un upload de archivo (FormData), no cerrar sesión automáticamente
    // Los uploads pueden fallar por tamaño, timeout, etc. sin ser problemas de autenticación
    const isFileUpload = config?.headers?.['Content-Type']?.includes('multipart/form-data')
    
    // Solo cerrar sesión en errores 401 (no autenticado)
    // NO cerrar sesión en 403 (sin permisos) - eso es un problema de autorización, no de autenticación
    if (response?.status === 401) {
      // Si NO es un upload de archivo, hacer logout (es un problema real de autenticación)
      if (!isFileUpload) {
        console.warn('🔒 Sesión expirada. Redirigiendo a login...')
        authService.logout()
        window.location.href = '/'
      } else {
        // Si ES un upload de archivo, solo logear el error sin hacer logout
        console.error('❌ Error en upload de archivo (NO se cierra sesión):', {
          status: response.status,
          url: config.url,
          error: response.data
        })
      }
    } else if (response?.status === 403) {
      // 403 = Forbidden - el usuario está autenticado pero no tiene permisos
      console.error('❌ Sin permisos para acceder a:', config.url)
      console.error('Necesitas los permisos adecuados para esta operación')
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  async login(email, password) {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: email,
        password: password,
      })

      const data = response.data
      
      // Guardar datos en localStorage de forma segura
      if (typeof window !== 'undefined') {
        this.saveAuthData(data)
      }
      
      return data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      throw new Error(message)
    }
  },

  saveAuthData(data) {
    if (typeof window === 'undefined') return
    
    try {
      const token = data.token
      
      // Decodificar el token para obtener la expiración real
      const decoded = decodeJWT(token)
      
      if (!decoded || !decoded.exp) {
        throw new Error('Token inválido: no se pudo decodificar')
      }
      
      // Guardar token en localStorage
      localStorage.setItem('token', token)
      
      // Guardar la fecha de expiración REAL del token (en milisegundos)
      const expirationDate = new Date(decoded.exp * 1000)
      localStorage.setItem('tokenExpiration', expirationDate.toISOString())
      
      // Guardar token en cookies para que el middleware pueda leerlo
      const maxAge = Math.floor((decoded.exp * 1000 - Date.now()) / 1000) // Segundos restantes
      document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`
      
      // Normalizar el rol
      let userRole = data.rol
      if (Array.isArray(userRole)) {
        userRole = userRole[0]
      }
      if (typeof userRole === 'string' && userRole.startsWith('ROLE_')) {
        userRole = userRole.replace('ROLE_', '')
      }
      
      // Guardar información del usuario
      const userData = {
        id: data.id || data.userId,
        email: data.email || data.correo || decoded.sub,
        nombre: data.nombre,
        rol: userRole,
      }
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      
      console.log('✅ Sesión guardada. Expira:', expirationDate.toLocaleString())
      console.log('📧 Usuario:', userData.email)
      console.log('⏰ Tiempo de vida del token:', Math.floor(maxAge / 60), 'minutos')
      
      // Configurar auto-logout cuando expire el token
      this.setupAutoLogout(decoded.exp * 1000)
      
    } catch (error) {
      console.error('Error saving auth data:', error)
      throw error
    }
  },

  setupAutoLogout(expirationTime) {
    if (typeof window === 'undefined') return
    
    // Limpiar timeout anterior si existe
    if (window.logoutTimeout) {
      clearTimeout(window.logoutTimeout)
    }
    
    const timeUntilExpiration = expirationTime - Date.now()
    
    if (timeUntilExpiration > 0) {
      // Configurar logout automático 30 segundos antes de que expire
      const logoutTime = timeUntilExpiration - 30000
      
      window.logoutTimeout = setTimeout(() => {
        console.log('⏰ Token a punto de expirar. Cerrando sesión...')
        this.logout()
        window.location.href = '/'
      }, logoutTime > 0 ? logoutTime : 0)
    }
  },

  logout() {
    if (typeof window === 'undefined') return
    
    try {
      console.log('🚪 Cerrando sesión...')
      
      // Limpiar timeout de auto-logout
      if (window.logoutTimeout) {
        clearTimeout(window.logoutTimeout)
        delete window.logoutTimeout
      }
      
      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiration')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      // Eliminar cookie del token
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
      
      // Limpiar caché del navegador
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name)
          })
        })
      }
      
      console.log('✅ Sesión cerrada y caché limpiado')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  },

  getToken() {
    if (typeof window === 'undefined') return null
    try {
      const token = localStorage.getItem('token')
      
      // Verificar si el token está expirado
      if (token && isTokenExpired(token)) {
        console.log('⏰ Token expirado al obtenerlo. Limpiando...')
        this.logout()
        return null
      }
      
      return token
    } catch (error) {
      console.error('Error getting token:', error)
      return null
    }
  },

  getUser() {
    if (typeof window === 'undefined') return null
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false
    
    try {
      const token = this.getToken()
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      
      if (!token || !isAuth) {
        return false
      }
      
      // Verificar si el token ha expirado usando la decodificación JWT
      if (isTokenExpired(token)) {
        console.log('⏰ Token expirado detectado en isAuthenticated. Limpiando sesión...')
        this.logout()
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error checking authentication:', error)
      this.logout()
      return false
    }
  },

  // Obtener información del token decodificado
  getTokenInfo() {
    const token = this.getToken()
    if (!token) return null
    
    return decodeJWT(token)
  },

  // Obtener tiempo restante del token en minutos
  getTokenTimeRemaining() {
    const token = this.getToken()
    if (!token) return 0
    
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return 0
    
    const expirationTime = decoded.exp * 1000
    const currentTime = Date.now()
    const timeRemaining = expirationTime - currentTime
    
    return Math.max(0, Math.floor(timeRemaining / 60000)) // Minutos restantes
  },

  // Helper para hacer peticiones autenticadas (usando la instancia configurada)
  getApiClient() {
    return apiClient
  }
}

// Exportar también la instancia de axios configurada
export { apiClient }
