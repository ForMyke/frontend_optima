import axios from 'axios'

// Configuración de la URL del backend
const API_URL = process.env.NEXT_PUBLIC_API_URL


// 🔍 LOGS TEMPORALES - Eliminar después de verificar
console.log('🔍 Backend URL configurada:', API_URL)
console.log('🔍 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
if (!API_URL) {
  console.error('❌ ERROR: La variable NEXT_PUBLIC_API_URL no está definida!')
  console.error('❌ Asegúrate de tener el archivo .env.local en la raíz del proyecto')
}
// 🔍 FIN LOGS TEMPORALES

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
    if (error.response?.status === 401) {
      // Token expirado o inválido - solo en el cliente
      if (typeof window !== 'undefined') {
        authService.logout()
        window.location.href = '/'
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
      // Guardar token
      localStorage.setItem('token', data.token)
      
      // Guardar información del usuario
      const userData = {
        email: data.email || data.correo,
        nombre: data.nombre,
        rol: data.rol,
      }
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
    } catch (error) {
      console.error('Error saving auth data:', error)
    }
  },

  logout() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
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
      return localStorage.getItem('isAuthenticated') === 'true' && this.getToken()
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