import { apiClient } from './authService'

export const refaccionesService = {
  // Obtener todas las refacciones con paginación y ordenamiento
  async getRefacciones(page = 0, size = 10, sort = 'nombre,asc') {
    try {
      const response = await apiClient.get('/api/refacciones', {
        params: {
          page,
          size,
          sort
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener refacciones:', error)
      throw error
    }
  },

  // Obtener una refacción por ID
  async getRefaccionById(id) {
    try {
      const response = await apiClient.get(`/api/refacciones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener refacción:', error)
      const message = error.response?.data?.message || 'Error al obtener refacción'
      throw new Error(message)
    }
  },

  // Crear una nueva refacción
  async createRefaccion(refaccionData) {
    try {
      const response = await apiClient.post('/api/refacciones', refaccionData)
      return response.data
    } catch (error) {
      console.error('Error al crear refacción:', error)
      const message = error.response?.data?.message || 'Error al crear refacción'
      throw new Error(message)
    }
  },

  // Actualizar una refacción existente
  async updateRefaccion(id, refaccionData) {
    try {
      const response = await apiClient.put(`/api/refacciones/${id}`, refaccionData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar refacción:', error)
      const message = error.response?.data?.message || 'Error al actualizar refacción'
      throw new Error(message)
    }
  },

  // Eliminar una refacción
  async deleteRefaccion(id) {
    try {
      const response = await apiClient.delete(`/api/refacciones/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar refacción:', error)
      const message = error.response?.data?.message || 'Error al eliminar refacción'
      throw new Error(message)
    }
  },

  // Obtener todas las refacciones sin paginación (útil para selects)
  async getAllRefacciones() {
    try {
      const response = await apiClient.get('/api/refacciones', {
        params: {
          page: 0,
          size: 1000,
          sort: 'nombre,asc'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener todas las refacciones:', error)
      throw error
    }
  }
}
