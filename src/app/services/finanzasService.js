import { apiClient } from './authService'

const finanzasService = {
    /**
     * Obtener finanzas del día actual
     */
    async getFinanzasDiario() {
        try {
            const response = await apiClient.get('/api/finanzas/diario')
            return response.data
        } catch (error) {
            console.error('Error al obtener finanzas diarias:', error)
            throw new Error(error.response?.data?.message || 'Error al obtener finanzas diarias')
        }
    },

    async getDiaActual() {
    try {
        const response = await apiClient.get('/api/finanzas/dia-actual')
        return response.data
    } catch (error) {
        console.error('Error al obtener día actual:', error)
        const message = error.response?.data?.message || 'Error al obtener día actual'
        throw new Error(message)
    }
    },

    /**
     * Obtener finanzas de la semana actual
     */
    async getFinanzasSemanal() {
        try {
            const response = await apiClient.get('/api/finanzas/semanal')
            return response.data
        } catch (error) {
            console.error('Error al obtener finanzas semanales:', error)
            throw new Error(error.response?.data?.message || 'Error al obtener finanzas semanales')
        }
    },

    /**
     * Obtener finanzas de un mes específico
     * @param {number} mes - Número del mes (1-12)
     * @returns {Promise<{
     *   anio: number,
     *   mes: number,
     *   inicioLogico: string,
     *   finLogico: string,
     *   ingresos: number,
     *   gastos: number,
     *   utilidad: number
     * }>}
     */
    async getFinanzasMensual(mes) {
        try {
            const response = await apiClient.get('/api/finanzas/mensual', {
                params: { mes }
            })
            return response.data
        } catch (error) {
            console.error('Error al obtener finanzas mensuales:', error)
            throw new Error(error.response?.data?.message || 'Error al obtener finanzas mensuales')
        }
    }
}

export default finanzasService
