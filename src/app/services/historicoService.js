import { apiClient } from './authService'

export const historicoService = {
  // Obtener todos los movimientos de almacenes con paginación y ordenamiento
  async getMovimientos() {
    try {
      const response = await apiClient.get('/api/movimientos-almacenes', {
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener movimientos de almacenes:', error)
      throw error
    }
  },

  // Obtener un movimiento por ID (si el endpoint existe)
  async getMovimientoById(id) {
    try {
      const response = await apiClient.get(`/api/movimientos-almacenes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener movimiento:', error)
      const message = error.response?.data?.message || 'Error al obtener movimiento'
      throw new Error(message)
    }
  }
}
