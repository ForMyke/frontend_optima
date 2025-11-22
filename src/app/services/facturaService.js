import { apiClient } from './authService'

export const facturaService = {
  // Obtener todas las facturas con paginación
  async getFacturas(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas:', error)
      throw error
    }
  },

  // Obtener facturas por estatus
  async getFacturasByEstatus(estatus, page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas/estatus', {
        params: {
          estatus,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas por estatus:', error)
      throw error
    }
  },

  // Obtener una factura por ID
  async getFacturaById(id) {
    try {
      const response = await apiClient.get(`/api/facturas/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener factura:', error)
      const message = error.response?.data?.message || 'Error al obtener factura'
      throw new Error(message)
    }
  },

  // Actualizar el estatus de una factura (marcar como pagada)
  async updateFacturaEstatus(id, facturaData) {
    try {
      const response = await apiClient.put(`/api/facturas/${id}`, facturaData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar factura:', error)
      const message = error.response?.data?.message || 'Error al actualizar factura'
      throw new Error(message)
    }
  },

  // Registrar pago de factura (con soporte para pagos parciales)
  async registrarPago(id, pagoData) {
    try {
      // pagoData contiene: montoParcial, metodoPago, fechaPago, observaciones
      // Si es EFECTIVO, tipo = SIN_FACTURA, otros métodos = FACTURADO
      const tipo = pagoData.metodoPago === 'EFECTIVO' ? 'SIN_FACTURA' : 'FACTURADO'
      
      const facturaData = {
        montoParcial: parseFloat(pagoData.montoParcial),
        metodoPago: pagoData.metodoPago,
        fechaPago: pagoData.fechaPago,
        tipo
      }

      // Agregar observaciones si existen
      if (pagoData.observaciones && pagoData.observaciones.trim()) {
        facturaData.observaciones = pagoData.observaciones.trim()
      }

      return await this.updateFacturaEstatus(id, facturaData)
    } catch (error) {
      console.error('Error al registrar pago:', error)
      throw error
    }
  },

  // Método legacy - mantener compatibilidad
  async marcarComoPagada(id, fechaPago, metodoPago) {
    try {
      const tipo = metodoPago === 'EFECTIVO' ? 'SIN_FACTURA' : 'FACTURADO'
      
      const facturaData = {
        estatus: 'PAGADA',
        fechaPago,
        metodoPago,
        tipo
      }
      return await this.updateFacturaEstatus(id, facturaData)
    } catch (error) {
      console.error('Error al marcar factura como pagada:', error)
      throw error
    }
  },

  // Obtener facturas por tipo (SIN_FACTURA o FACTURADO)
  async getFacturasByTipo(tipo, page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas/tipo', {
        params: {
          tipo,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas por tipo:', error)
      throw error
    }
  },

  // ========== SERVICIOS DE FACTURAS EXTRA ==========

  // Obtener todas las facturas extra con paginación
  async getFacturasExtra(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas-extra', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas extra:', error)
      throw error
    }
  },

  // Obtener una factura extra por ID
  async getFacturaExtraById(id) {
    try {
      const response = await apiClient.get(`/api/facturas-extra/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener factura extra:', error)
      const message = error.response?.data?.message || 'Error al obtener factura extra'
      throw new Error(message)
    }
  },

  // Crear una nueva factura extra
  async createFacturaExtra(facturaData) {
    try {
      const response = await apiClient.post('/api/facturas-extra', facturaData)
      return response.data
    } catch (error) {
      console.error('Error al crear factura extra:', error)
      const message = error.response?.data?.message || 'Error al crear factura extra'
      throw new Error(message)
    }
  },

  // Actualizar una factura extra
  async updateFacturaExtra(id, facturaData) {
    try {
      const response = await apiClient.put(`/api/facturas-extra/${id}`, facturaData)
      return response.data
    } catch (error) {
      console.error('Error al actualizar factura extra:', error)
      const message = error.response?.data?.message || 'Error al actualizar factura extra'
      throw new Error(message)
    }
  },

  // Eliminar una factura extra
  async deleteFacturaExtra(id) {
    try {
      const response = await apiClient.delete(`/api/facturas-extra/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar factura extra:', error)
      const message = error.response?.data?.message || 'Error al eliminar factura extra'
      throw new Error(message)
    }
  },

  // Obtener facturas extra por estatus
  async getFacturasExtraByEstatus(estatus, page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas-extra/estatus', {
        params: {
          estatus,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas extra por estatus:', error)
      throw error
    }
  },

  // Obtener facturas extra por cliente
  async getFacturasExtraByCliente(clienteId, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`/api/facturas-extra/cliente/${clienteId}`, {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas extra por cliente:', error)
      throw error
    }
  },

  // Obtener facturas extra vencidas
  async getFacturasExtraVencidas(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/facturas-extra/vencidas', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener facturas extra vencidas:', error)
      throw error
    }
  },

  // Marcar factura extra como pagada
  async marcarFacturaExtraComoPagada(id, fechaPago, metodoPago) {
    try {
      const facturaData = {
        estatus: 'PAGADA',
        fechaPago,
        metodoPago
      }
      return await this.updateFacturaExtra(id, facturaData)
    } catch (error) {
      console.error('Error al marcar factura extra como pagada:', error)
      throw error
    }
  }
}
