import { apiClient } from './authService'

export const unidadesService = {
  // Obtener todas las unidades
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/api/unidades', { params })
      return response.data
    } catch (error) {
      console.error('Error al obtener unidades:', error)
      throw error
    }
  },

  // Obtener una unidad por ID
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/unidades/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener unidad:', error)
      const message = error.response?.data?.message || 'Error al obtener unidad'
      throw new Error(message)
    }
  },

  // Crear una nueva unidad
  async create(unidadData) {
    try {
      const response = await apiClient.post('/api/unidades', unidadData)
      return response.data
    } catch (error) {
      console.error('Error al crear unidad:', error)
      const message = error.response?.data?.message || 'Error al crear unidad'
      throw new Error(message)
    }
  },

  // Actualizar una unidad existente
  async update(id, unidadData) {
    try {
      const response = await apiClient.put(`/api/unidades/${id}`, unidadData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar unidad:', error)
      const message = error.response?.data?.message || 'Error al actualizar unidad'
      throw new Error(message)
    }
  },

  // Eliminar una unidad
  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/unidades/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar unidad:', error)
      const message = error.response?.data?.message || 'Error al eliminar unidad'
      throw new Error(message)
    }
  }
}
