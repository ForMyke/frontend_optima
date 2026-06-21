import { apiClient } from './authService'

export const administrativosService = {
  async getAdministrativos(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/administrativos', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener administrativos:', error)
      const message = error.response?.data?.message || 'Error al obtener administrativos'
      throw new Error(message)
    }
  },

  async getAdministrativoById(id) {
    try {
      const response = await apiClient.get(`/api/administrativos/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener administrativo:', error)
      const message = error.response?.data?.message || 'Error al obtener administrativo'
      throw new Error(message)
    }
  },

  async createAdministrativo(administrativoData) {
    try {
      const response = await apiClient.post('/api/administrativos', administrativoData)
      return response.data
    } catch (error) {
      console.error('Error al crear administrativo:', error)
      const message = error.response?.data?.message || 'Error al crear administrativo'
      throw new Error(message)
    }
  },

  async updateAdministrativo(id, administrativoData) {
    try {
      const response = await apiClient.put(`/api/administrativos/${id}`, administrativoData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar administrativo:', error)
      const message = error.response?.data?.message || 'Error al actualizar administrativo'
      throw new Error(message)
    }
  },

  async deleteAdministrativo(id) {
    try {
      await apiClient.delete(`/api/administrativos/${id}`)
      return true
    } catch (error) {
      console.error('Error al eliminar administrativo:', error)
      const message = error.response?.data?.message || 'Error al eliminar administrativo'
      throw new Error(message)
    }
  },

  async getEstadisticasAdministrativos() {
    try {
      const response = await apiClient.get('/api/administrativos/estadisticas')
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas de administrativos:', error)
      const message = error.response?.data?.message || 'Error al obtener estadísticas de administrativos'
      throw new Error(message)
    }
  }
}