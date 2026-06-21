import { apiClient } from './authService'

const gastosFijosService = {
  async getGastosFijos() {
    try {
      const response = await apiClient.get('/api/gastos-fijos')
      return response.data
    } catch (error) {
      console.error('Error al obtener gastos fijos:', error)
      const message = error.response?.data?.message || 'Error al obtener gastos fijos'
      throw new Error(message)
    }
  },

  async getGastoFijoByNombre(nombre) {
    try {
      const response = await apiClient.get(`/api/gastos-fijos/${encodeURIComponent(nombre)}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener gasto fijo:', error)
      const message = error.response?.data?.message || 'Error al obtener gasto fijo'
      throw new Error(message)
    }
  },

  async createGastoFijo(gastoData) {
    try {
      const response = await apiClient.post('/api/gastos-fijos', gastoData)
      return response.data
    } catch (error) {
      console.error('Error al crear gasto fijo:', error)
      const message = error.response?.data?.message || 'Error al crear gasto fijo'
      throw new Error(message)
    }
  },

  async updateGastoFijo(nombre, gastoData) {
    try {
      const response = await apiClient.put(`/api/gastos-fijos/${encodeURIComponent(nombre)}`, gastoData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar gasto fijo:', error)
      const message = error.response?.data?.message || 'Error al actualizar gasto fijo'
      throw new Error(message)
    }
  },

  async deleteGastoFijo(nombre) {
    try {
      await apiClient.delete(`/api/gastos-fijos/${encodeURIComponent(nombre)}`)
      return true
    } catch (error) {
      console.error('Error al eliminar gasto fijo:', error)
      const message = error.response?.data?.message || 'Error al eliminar gasto fijo'
      throw new Error(message)
    }
  },

  async calcularGastosFijos(dias = 7) {
    try {
      const response = await apiClient.get('/api/gastos-fijos/calcular', {
        params: { dias }
      })
      return response.data
    } catch (error) {
      console.error('Error al calcular gastos fijos:', error)
      const message = error.response?.data?.message || 'Error al calcular gastos fijos'
      throw new Error(message)
    }
  }
}

export default gastosFijosService