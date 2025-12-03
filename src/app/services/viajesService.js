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

  // Crear un nuevo viaje con FormData (dto + archivo)
  async createViaje(viajeData, archivo = null) {
    try {
      // Crear FormData
      const formData = new FormData()

      // Preparar el DTO como objeto JSON
      const dto = {
        idUnidad: viajeData.idUnidad,
        idOperador: viajeData.idOperador,
        idCliente: viajeData.idCliente,
        idRutaComisiones: viajeData.idRutaComisiones || null,
        fechaSalida: viajeData.fechaSalida,
        fechaEstimadaLlegada: viajeData.fechaEstimadaLlegada,
        fechaRealLlegada: viajeData.fechaRealLlegada || null,
        tipo: viajeData.tipo || 'NORMAL',
        estado: viajeData.estado || 'PENDIENTE',
        cargaDescripcion: viajeData.cargaDescripcion,
        observaciones: viajeData.observaciones || null,
        responsableLogistica: viajeData.responsableLogistica,
        creadoPor: viajeData.creadoPor,
        tarifa: viajeData.tarifa || null,
        distanciaKm: viajeData.distanciaKm || null,
        casetas: viajeData.casetas || null,
        dieselLitros: viajeData.dieselLitros || null, // Contiene el costo total del diesel (litros × precio)
        comisionOperador: viajeData.comisionOperador || null,
        gastosExtras: viajeData.gastosExtras || null,
        costoTotal: viajeData.costoTotal || null,
        folio: viajeData.folio || null
      }

      // Agregar el DTO como Blob con tipo application/json
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })
      formData.append('dto', dtoBlob)

      // Agregar el archivo si existe
      if (archivo) {
        formData.append('archivo', archivo)
      }

      const response = await apiClient.post('/api/viajes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
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
        creadoPor: viajeData.creadoPor,
        folio: viajeData.folio || null
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

  // Completar un viaje con evidencia (archivo o imagen)
  async completarViaje(id, archivo) {
    try {
      // Validar tipos de archivo permitidos
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ]

      if (!allowedTypes.includes(archivo.type)) {
        throw new Error('Formato no permitido. Puedes subir imágenes, PDF, Word, Excel, TXT o CSV')
      }

      // Validar tamaño máximo (1MB estricto)
      const maxSize = 1 * 1024 * 1024 // 1MB
      const sizeMB = (archivo.size / 1024 / 1024).toFixed(2)

      if (archivo.size > maxSize) {
        throw new Error(`⚠️ El archivo (${sizeMB}MB) supera el límite de 1MB permitido por el servidor.\n\nPor favor reduce el tamaño del archivo antes de subirlo.`)
      }

      const formData = new FormData()
      formData.append('archivo', archivo)

      console.log('📤 Enviando archivo a la API:', {
        id,
        fileName: archivo.name,
        fileType: archivo.type,
        fileSize: `${sizeMB}MB`,
        límite: '1MB'
      })

      const response = await apiClient.post(`/api/viajes/${id}/completar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 segundos timeout
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`📊 Progreso de subida: ${percentCompleted}%`)
        }
      })

      console.log('✅ Respuesta del servidor:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Error al completar viaje:', error)
      console.error('Detalles del error:', error.response?.data)

      // Manejar diferentes tipos de errores
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('⏱️ La subida tardó demasiado tiempo. Por favor intenta con una imagen más pequeña (menor a 1MB).')
      }

      if (error.response?.status === 413) {
        throw new Error('🚫 La imagen es demasiado grande para el servidor. Máximo permitido: 1MB.')
      }

      if (error.response?.status === 403) {
        throw new Error('🚫 Acceso denegado. El servidor rechazó la imagen (posiblemente supera 1MB).')
      }

      // Si ya es un error personalizado nuestro, pasarlo tal cual
      if (error.message.includes('⚠️') || error.message.includes('🚫')) {
        throw error
      }

      const message = error.response?.data?.message || error.message || 'Error al completar viaje'
      throw new Error(message)
    }
  },

  // Cambiar el estado de un viaje
  async cambiarEstado(id, nuevoEstado, archivo = null, fechaRealLlegada = null) {
    try {
      console.log('🔄 Cambiar estado:', { id, nuevoEstado, tieneArchivo: !!archivo, fechaRealLlegada })

      // Si hay archivo, siempre usar el endpoint de completar (que maneja la evidencia)
      // independientemente del estado
      if (archivo) {
        console.log('📸 Subiendo evidencia con cambio de estado...')
        // El endpoint /completar maneja la subida de evidencia Y cambia el estado a COMPLETADO
        // Pero nosotros queremos cambiar a cualquier estado, así que:
        // 1. Subimos la evidencia
        const result = await this.completarViaje(id, archivo)

        // 2. Si el estado deseado NO es COMPLETADO o hay fechaRealLlegada, hacemos otro update
        if (nuevoEstado !== 'COMPLETADO' || fechaRealLlegada) {
          console.log(`📝 Cambiando estado a ${nuevoEstado} después de subir evidencia...`)
          // Obtener el viaje actual para mantener los datos originales
          const viaje = await this.getViajeById(id)

          // Construir el DTO exactamente como lo requiere el backend
          const dto = {
            unidadId: viaje.unidad?.id || viaje.idUnidad,
            operadorId: viaje.operador?.id || viaje.idOperador,
            clienteId: viaje.cliente?.id || viaje.idCliente,
            origen: viaje.origen,
            destino: viaje.destino,
            fechaSalida: viaje.fechaSalida,
            fechaEstimadaLlegada: viaje.fechaEstimadaLlegada,
            fechaRealLlegada: fechaRealLlegada || viaje.fechaRealLlegada || null,
            estado: nuevoEstado,
            cargaDescripcion: viaje.cargaDescripcion,
            tarifa: viaje.tarifa,
            distanciaKm: viaje.distanciaKm,
            tipoViaje: viaje.tipo || viaje.tipoViaje,
            folio: viaje.folio
          }

          // Crear FormData con dto y archivo (aunque archivo ya se subió, el backend puede requerirlo)
          const formData = new FormData()
          const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })
          formData.append('dto', dtoBlob)
          // El archivo ya se subió en el paso anterior, aquí solo actualizamos el estado

          return await apiClient.put(`/api/viajes/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => res.data)
        }

        return result
      }

      // Para otros estados sin archivo, hacer un simple cambio de estado
      console.log('📝 Actualizando estado sin evidencia...')
      const viaje = await this.getViajeById(id)

      // Construir el DTO exactamente como lo requiere el backend
      const dto = {
        unidadId: viaje.unidad?.id || viaje.idUnidad,
        operadorId: viaje.operador?.id || viaje.idOperador,
        clienteId: viaje.cliente?.id || viaje.idCliente,
        origen: viaje.origen,
        destino: viaje.destino,
        fechaSalida: viaje.fechaSalida,
        fechaEstimadaLlegada: viaje.fechaEstimadaLlegada,
        fechaRealLlegada: fechaRealLlegada || viaje.fechaRealLlegada || null,
        estado: nuevoEstado,
        cargaDescripcion: viaje.cargaDescripcion,
        tarifa: viaje.tarifa,
        distanciaKm: viaje.distanciaKm,
        tipoViaje: viaje.tipo || viaje.tipoViaje,
        folio: viaje.folio
      }

      // Crear FormData con dto (sin archivo)
      const formData = new FormData()
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' })
      formData.append('dto', dtoBlob)

      const response = await apiClient.put(`/api/viajes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error al cambiar estado del viaje:', error)
      const message = error.response?.data?.message || error.message || 'Error al cambiar estado'
      throw new Error(message)
    }
  }
}
