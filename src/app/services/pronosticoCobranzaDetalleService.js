import { apiClient } from "./authService";

export const pronosticoCobranzaDetalleService = {
  async getResumen(inicio, fin) {
    const response = await apiClient.get(
      "/api/pronostico-cobranza-detalle/resumen",
      { params: { inicio, fin } },
    );
    return response.data;
  },

  async getDetalles(clienteId, fechaCredito) {
    const response = await apiClient.get(
      "/api/pronostico-cobranza-detalle/detalles",
      { params: { clienteId, fechaCredito } },
    );
    return response.data;
  },

  async registrarPagoGlobal(payload) {
    const response = await apiClient.post(
      "/api/pronostico-cobranza-detalle/pagos/global",
      payload,
    );
    return response.data;
  },

  async pagarViajeCompleto(detalleId, payload) {
    const response = await apiClient.post(
      `/api/pronostico-cobranza-detalle/detalles/${detalleId}/pagar-completo`,
      payload,
    );
    return response.data;
  },

  async rebuild() {
    await apiClient.post("/api/pronostico-cobranza-detalle/rebuild");
  },
};

export default pronosticoCobranzaDetalleService;