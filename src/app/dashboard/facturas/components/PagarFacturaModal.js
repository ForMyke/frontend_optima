"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle, CreditCard } from "lucide-react";

const hoyIso = () => new Date().toISOString().split("T")[0];

export default function PagarFacturaModal({
  isOpen,
  onClose,
  onConfirm,
  factura,
}) {
  const [formData, setFormData] = useState({
    fechaPago: hoyIso(),
    metodoPago: "",
    montoParcial: "",
    referencia: "",
    observaciones: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const saldo = useMemo(() => {
    if (!factura) return 0;
    return Math.max(
      0,
      Number(factura.monto || 0) - Number(factura.montoParcial || 0),
    );
  }, [factura]);

  useEffect(() => {
    if (isOpen && factura) {
      setFormData({
        fechaPago: hoyIso(),
        metodoPago: "",
        montoParcial: String(saldo),
        referencia: "",
        observaciones: "",
      });
    }
  }, [isOpen, factura, saldo]);

  if (!isOpen || !factura) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const abono = Number(formData.montoParcial);

    if (!Number.isFinite(abono) || abono <= 0 || abono > saldo) return;

    try {
      setIsLoading(true);
      await onConfirm(factura, formData);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Registrar abono</h2>
          <p className="mt-1 text-sm text-slate-600">
            {factura.numeroFactura || `Factura #${factura.id}`}
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Saldo pendiente</span>
              <strong className="text-orange-600">
                {saldo.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                })}
              </strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Monto del nuevo abono
            </span>
            <input
              type="number"
              min="0.01"
              max={saldo}
              step="0.01"
              value={formData.montoParcial}
              onChange={(e) =>
                setFormData({ ...formData, montoParcial: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center text-sm font-medium text-slate-700">
              <Calendar className="mr-2 h-4 w-4" /> Fecha de pago
            </span>
            <input
              type="date"
              max={hoyIso()}
              value={formData.fechaPago}
              onChange={(e) =>
                setFormData({ ...formData, fechaPago: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center text-sm font-medium text-slate-700">
              <CreditCard className="mr-2 h-4 w-4" /> Método
            </span>
            <select
              value={formData.metodoPago}
              onChange={(e) =>
                setFormData({ ...formData, metodoPago: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
              required
            >
              <option value="">Selecciona</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="TARJETA_CREDITO">Tarjeta de crédito</option>
              <option value="TARJETA_DEBITO">Tarjeta de débito</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="Referencia opcional"
            value={formData.referencia}
            onChange={(e) =>
              setFormData({ ...formData, referencia: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <textarea
            rows={3}
            placeholder="Observaciones"
            value={formData.observaciones}
            onChange={(e) =>
              setFormData({ ...formData, observaciones: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />

          <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            El backend sumará este abono al monto ya pagado. No reemplazará el acumulado.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {isLoading ? "Procesando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
