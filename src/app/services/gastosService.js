import { apiClient } from './authService'

const gastosService = {
  // ========== SERVICIOS DE GASTOS SEMANALES ==========

  /**
   * Obtener todos los gastos semanales
   */
  async getGastosSemanales(page = 0, size = 15) {
    try {
      const response = await apiClient.get('/api/gastos-semanales', {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener gastos semanales:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener gastos semanales')
    }
  },

  /**
   * Obtener un gasto semanal por ID
   */
  async getGastoSemanalById(id) {
    try {
      const response = await apiClient.get(`/api/gastos-semanales/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener gasto semanal:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener gasto semanal')
    }
  },

  /**
   * Crear un nuevo gasto semanal
   */
  async createGastoSemanal(gastoData) {
    try {
      const response = await apiClient.post('/api/gastos-semanales', gastoData)
      return response.data
    } catch (error) {
      console.error('Error al crear gasto semanal:', error)
      throw new Error(error.response?.data?.message || 'Error al crear gasto semanal')
    }
  },

  /**
   * Actualizar un gasto semanal existente
   */
  async updateGastoSemanal(id, gastoData) {
    try {
      const response = await apiClient.put(`/api/gastos-semanales/${id}`, gastoData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar gasto semanal:', error)
      throw new Error(error.response?.data?.message || 'Error al actualizar gasto semanal')
    }
  },

  /**
   * Eliminar un gasto semanal
   */
  async deleteGastoSemanal(id) {
    try {
      const response = await apiClient.delete(`/api/gastos-semanales/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar gasto semanal:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar gasto semanal')
    }
  },

  /**
   * Obtener gastos generados automáticamente por el sistema
   * Devuelve los datos calculados de la semana actual
   */
  async getGastosGenerados() {
    try {
      const response = await apiClient.get('/api/gastos-semanales/generado')
      return response.data
    } catch (error) {
      console.error('Error al obtener gastos generados:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener gastos generados')
    }
  }
}

export default gastosService
