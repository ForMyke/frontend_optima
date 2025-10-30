import { apiClient } from './authService'

export const viajesService = {
  // Obtener todos los viajes con paginación
  async getViajes(page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/viajes', {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener viajes:', error)
      throw error
    }
  },

  // Crear un nuevo viaje con el formato actualizado
  async createViaje(viajeData) {
    try {
      // Formato del body según la API actualizada
      const body = {
        idUnidad: viajeData.idUnidad,
        idOperador: viajeData.idOperador,
        idCliente: viajeData.idCliente,
        origen: viajeData.origen,
        destino: viajeData.destino,
        fechaSalida: viajeData.fechaSalida,
        fechaEstimadaLlegada: viajeData.fechaEstimadaLlegada,
        estado: viajeData.estado || 'PENDIENTE',
        cargaDescripcion: viajeData.cargaDescripcion,
        observaciones: viajeData.observaciones || null,
        tarifa: viajeData.tarifa,
        distanciaKm: viajeData.distanciaKm,
        tipo: viajeData.tipo || 'LOCAL',
        responsableLogistica: viajeData.responsableLogistica,
        evidenciaUrl: viajeData.evidenciaUrl || null,
        creadoPor: viajeData.creadoPor
      }
      
      const response = await apiClient.post('/api/viajes', body)
      return response.data
    } catch (error) {
      console.error('Error al crear viaje:', error)
      const message = error.response?.data?.message || 'Error al crear viaje'
      throw new Error(message)
    }
  },

  // Actualizar un viaje existente
  async updateViaje(id, viajeData) {
    try {
      const body = {
        idUnidad: viajeData.idUnidad,
        idOperador: viajeData.idOperador,
        idCliente: viajeData.idCliente,
        origen: viajeData.origen,
        destino: viajeData.destino,
        fechaSalida: viajeData.fechaSalida,
        fechaEstimadaLlegada: viajeData.fechaEstimadaLlegada,
        estado: viajeData.estado,
        cargaDescripcion: viajeData.cargaDescripcion,
        observaciones: viajeData.observaciones || null,
        tarifa: viajeData.tarifa,
        distanciaKm: viajeData.distanciaKm,
        tipo: viajeData.tipo,
        responsableLogistica: viajeData.responsableLogistica,
        evidenciaUrl: viajeData.evidenciaUrl || null,
        creadoPor: viajeData.creadoPor
      }
      
      const response = await apiClient.put(`/api/viajes/${id}`, body)
      return response.data
    } catch (error) {
      console.error('Error al actualizar viaje:', error)
      const message = error.response?.data?.message || 'Error al actualizar viaje'
      throw new Error(message)
    }
  },

  // Eliminar un viaje
  async deleteViaje(id) {
    try {
      const response = await apiClient.delete(`/api/viajes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar viaje:', error)
      const message = error.response?.data?.message || 'Error al eliminar viaje'
      throw new Error(message)
    }
  },

  // Obtener un viaje por ID
  async getViajeById(id) {
    try {
      const response = await apiClient.get(`/api/viajes/${id}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener viaje:', error)
      const message = error.response?.data?.message || 'Error al obtener viaje'
      throw new Error(message)
    }
  },

  // Obtener viajes por estado
  async getViajesByEstado(estado, page = 0, size = 10) {
    try {
      const response = await apiClient.get('/api/viajes/estado', {
        params: {
          estado,
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener viajes por estado:', error)
      throw error
    }
  },

  // Obtener viajes por operador
  async getViajesByOperador(operadorId, page = 0, size = 10) {
    try {
      const response = await apiClient.get(`/api/viajes/operador/${operadorId}`, {
        params: {
          page,
          size
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener viajes por operador:', error)
      throw error
    }
  },

  // Completar un viaje con evidencia fotográfica
  async completarViaje(id, archivo) {
    try {
      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      const formData = new FormData()
      formData.append('archivo', archivo)

      console.log('📤 Enviando archivo a la API:', {
        id,
        fileName: archivo.name,
        fileType: archivo.type,
        fileSize: archivo.size
      })

      const response = await apiClient.post(`/api/viajes/${id}/completar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ Respuesta del servidor:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al completar viaje:', error)
      console.error('Detalles del error:', error.response?.data)
      const message = error.response?.data?.message || error.message || 'Error al completar viaje'
      throw new Error(message)
    }
  }
}
