import { apiClient } from "./authService";

function apiMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    (typeof error.response?.data === "string" ? error.response.data : null) ||
    fallback
  );
}

export const facturaService = {
  async getFacturas(page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas", {
      params: { page, size },
    });
    return response.data;
  },

  async getFacturasByEstatus(estatus, page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas/estatus", {
      params: { estatus, page, size },
    });
    return response.data;
  },

  async getFacturaById(id) {
    try {
      const response = await apiClient.get(`/api/facturas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al obtener factura"));
    }
  },

  async updateFacturaEstatus(id, facturaData) {
    try {
      const response = await apiClient.put(`/api/facturas/${id}`, facturaData);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al actualizar factura"));
    }
  },

  async updateFactura(id, facturaData) {
    return this.updateFacturaEstatus(id, facturaData);
  },

  async deleteFactura(id) {
    try {
      const response = await apiClient.delete(`/api/facturas/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al eliminar factura"));
    }
  },

  /**
   * montoParcial representa el NUEVO abono, no el acumulado histórico.
   * El backend lo suma a factura.montoParcial.
   */
  async registrarPago(id, pagoData) {
    try {
      const payload = {
        monto: Number(pagoData.montoParcial),
        fechaPago: pagoData.fechaPago,
        metodoPago: pagoData.metodoPago,
        referencia: pagoData.referencia?.trim() || null,
        observaciones: pagoData.observaciones?.trim() || null,
        creadoPor: pagoData.creadoPor || null,
      };

      const response = await apiClient.post(
        `/api/facturas/${id}/pagos`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al registrar pago"));
    }
  },

  async marcarComoPagada(id, fechaPago, metodoPago) {
    const factura = await this.getFacturaById(id);
    const saldo = Math.max(
      0,
      Number(factura.monto || 0) - Number(factura.montoParcial || 0),
    );

    if (saldo <= 0) return factura;

    return this.registrarPago(id, {
      montoParcial: saldo,
      fechaPago,
      metodoPago,
    });
  },

  async getFacturasByTipo(tipo, page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas/tipo", {
      params: { tipo, page, size },
    });
    return response.data;
  },

  async getFacturasExtra(page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas-extra", {
      params: { page, size },
    });
    return response.data;
  },

  async getFacturaExtraById(id) {
    try {
      const response = await apiClient.get(`/api/facturas-extra/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al obtener factura extra"));
    }
  },

  async createFacturaExtra(facturaData) {
    try {
      const response = await apiClient.post("/api/facturas-extra", facturaData);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al crear factura extra"));
    }
  },

  async updateFacturaExtra(id, facturaData) {
    try {
      const response = await apiClient.put(
        `/api/facturas-extra/${id}`,
        facturaData,
      );
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al actualizar factura extra"));
    }
  },

  async deleteFacturaExtra(id) {
    try {
      const response = await apiClient.delete(`/api/facturas-extra/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiMessage(error, "Error al eliminar factura extra"));
    }
  },

  async getFacturasExtraByEstatus(estatus, page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas-extra/estatus", {
      params: { estatus, page, size },
    });
    return response.data;
  },

  async getFacturasExtraByCliente(clienteId, page = 0, size = 10) {
    const response = await apiClient.get(
      `/api/facturas-extra/cliente/${clienteId}`,
      { params: { page, size } },
    );
    return response.data;
  },

  async getFacturasExtraVencidas(page = 0, size = 10) {
    const response = await apiClient.get("/api/facturas-extra/vencidas", {
      params: { page, size },
    });
    return response.data;
  },

  async marcarFacturaExtraComoPagada(id, fechaPago, metodoPago) {
    return this.updateFacturaExtra(id, {
      estatus: "PAGADA",
      fechaPago,
      metodoPago,
    });
  },

  async getDashboard(diasHistorial = null, diasCompletadas = null) {
    const params = {};
    if (diasHistorial !== null) params.diasHistorial = diasHistorial;
    if (diasCompletadas !== null) params.diasCompletadas = diasCompletadas;

    const response = await apiClient.get("/api/facturas/dashboard", { params });
    return response.data;
  },
};

export default facturaService;

