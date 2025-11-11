import { apiClient } from './authService'

export const almacenService = {
  // Obtener todos los almacenes con paginación
  async getAlmacenes(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/almacenes', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener almacenes:', error)
      throw error
    }
  },

  // Obtener un almacén por ID
  async getAlmacenById(id) {
    try {
      const response = await apiClient.get(`/api/almacenes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener almacén:', error)
      const message = error.response?.data?.message || 'Error al obtener almacén'
      throw new Error(message)
    }
  },

  // Crear un nuevo almacén
  async createAlmacen(almacenData) {
    try {
      const response = await apiClient.post('/api/almacenes', almacenData)
      return response.data
    } catch (error) {
      console.error('Error al crear almacén:', error)
      const message = error.response?.data?.message || 'Error al crear almacén'
      throw new Error(message)
    }
  },

  // Actualizar un almacén existente
  async updateAlmacen(id, almacenData) {
    try {
      const response = await apiClient.put(`/api/almacenes/${id}`, almacenData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar almacén:', error)
      const message = error.response?.data?.message || 'Error al actualizar almacén'
      throw new Error(message)
    }
  },

  // Eliminar un almacén
  async deleteAlmacen(id) {
    try {
      const response = await apiClient.delete(`/api/almacenes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar almacén:', error)
      const message = error.response?.data?.message || 'Error al eliminar almacén'
      throw new Error(message)
    }
  },

  // Obtener todos los almacenes sin paginación (útil para selects)
  async getAllAlmacenes() {
    try {
      const response = await apiClient.get('/api/almacenes', {
        params: {
          page: 0,
          size: 1000 // Obtener todos
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener todos los almacenes:', error)
      throw error
    }
  }
}
