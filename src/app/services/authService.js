import axios from 'axios'

// Configuración de la URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://transportes-backend.fly.dev'

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
})

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Solo en el cliente (navegador)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
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

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores 401 (No autorizado) y 403 (Prohibido)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Solo hacer logout si estamos en el cliente
      if (typeof window !== 'undefined') {
        console.log(`❌ Error ${error.response.status}: Token inválido o expirado`)
        
        // Limpiar autenticación
        authService.logout()
        
        // Redirigir al login solo si no estamos ya en la página de login
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }
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
      // Guardar token en localStorage Y en cookies para el middleware
      localStorage.setItem('token', data.token)
      
      // Calcular fecha de expiración (10 horas desde ahora)
      const expirationDate = new Date()
      expirationDate.setHours(expirationDate.getHours() + 10)
      localStorage.setItem('tokenExpiration', expirationDate.toISOString())
      
      // Guardar token en cookies para que el middleware pueda leerlo
      const maxAge = 36000 // 10 horas en segundos
      document.cookie = `token=${data.token}; path=/; max-age=${maxAge}; SameSite=Strict; Secure`
      
      // Normalizar el rol: extraer el primer rol y quitar el prefijo "ROLE_"
      let userRole = data.rol
      if (Array.isArray(userRole)) {
        userRole = userRole[0] // Tomar el primer rol del array
      }
      if (typeof userRole === 'string' && userRole.startsWith('ROLE_')) {
        userRole = userRole.replace('ROLE_', '') // Quitar el prefijo "ROLE_"
      }
      
      // Guardar información del usuario
      const userData = {
        id: data.id || data.userId,
        email: data.email || data.correo,
        nombre: data.nombre,
        rol: userRole, // Rol normalizado sin prefijo
      }
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      
      console.log('✅ Sesión guardada. Expira:', expirationDate.toLocaleString())
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  },

  logout() {
    if (typeof window === 'undefined') return
    
    try {
      console.log('🚪 Cerrando sesión...')
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpiration')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
      
      // Eliminar cookie del token
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict'
    } catch (error) {
      console.error('Error during logout:', error)
    }
  },

  getToken() {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('token')
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
      
      // Verificar si el token ha expirado
      const expirationStr = localStorage.getItem('tokenExpiration')
      if (expirationStr) {
        const expiration = new Date(expirationStr)
        const now = new Date()
        
        if (now >= expiration) {
          console.log('⏰ Token expirado. Limpiando sesión...')
          this.logout()
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  },

  // Helper para hacer peticiones autenticadas (usando la instancia configurada)
  getApiClient() {
    return apiClient
  }
}

// Exportar también la instancia de axios configurada
export { apiClient }
