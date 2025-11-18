import { apiClient } from './authService'

const tarifasComisionesService = {
  // ========== SERVICIOS DE RUTAS COMISIONES ==========

  /**
   * Obtener todas las rutas comisiones
   */
  async getRutasComisiones(page = 0, size = 15) {
    try {
      const response = await apiClient.get('/api/rutas-comisiones', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener rutas comisiones:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener rutas comisiones')
    }
  },

  /**
   * Obtener una ruta comisión por ID
   */
  async getRutaComisionById(id) {
    try {
      const response = await apiClient.get(`/api/rutas-comisiones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener ruta comisión:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener ruta comisión')
    }
  },

  /**
   * Crear una nueva ruta comisión
   */
  async createRutaComision(rutaComisionData) {
    try {
      const response = await apiClient.post('/api/rutas-comisiones', rutaComisionData)
      return response.data
    } catch (error) {
      console.error('Error al crear ruta comisión:', error)
      throw new Error(error.response?.data?.message || 'Error al crear ruta comisión')
    }
  },

  /**
   * Actualizar una ruta comisión existente
   */
  async updateRutaComision(id, rutaComisionData) {
    try {
      const response = await apiClient.put(`/api/rutas-comisiones/${id}`, rutaComisionData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar ruta comisión:', error)
      throw new Error(error.response?.data?.message || 'Error al actualizar ruta comisión')
    }
  },

  /**
   * Eliminar una ruta comisión
   */
  async deleteRutaComision(id) {
    try {
      const response = await apiClient.delete(`/api/rutas-comisiones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar ruta comisión:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar ruta comisión')
    }
  },

  /**
   * Obtener rutas comisiones por cliente
   */
  async getRutasComisionesByCliente(clienteId, page = 0, size = 15) {
    try {
      const response = await apiClient.get(`/api/rutas-comisiones/cliente/${clienteId}`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener rutas comisiones por cliente:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener rutas comisiones por cliente')
    }
  },

  /**
   * Obtener datos de ruta comisión por rutaId y clienteId
   */
  async getRutaComisionByRutaYCliente(rutaId, clienteId) {
    try {
      const response = await apiClient.get(`/api/rutas-comisiones/rutaId/${rutaId}/cliente/${clienteId}/datos`)
      return response.data
    } catch (error) {
      console.error('Error al obtener datos de ruta comisión:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener datos de ruta comisión')
    }
  }
}

export default tarifasComisionesService
