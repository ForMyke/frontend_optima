"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MoreVertical,
  Plus,
  ReceiptText,
  Trash2,
  XCircle,
} from "lucide-react";
import { formatDateUTC } from "@/utils/dateUtils";

export default function FacturaCard({
  factura,
  clientes,
  onPagar,
  onViewDetails,
  onRegistrarPagoParcial,
  onDelete,
  onEdit,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const cliente = clientes.find((item) => item.id === factura.clienteId);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const saldo = Math.max(
    0,
    Number(factura.monto || 0) - Number(factura.montoParcial || 0),
  );

  const status = (() => {
    if (["PAGADA", "PAGO_PARCIAL", "POR_FACTURAR"].includes(factura.estatus)) {
      return factura.estatus;
    }
    if (factura.estatus === "FACTURADA" && factura.fechaVencimiento) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(`${factura.fechaVencimiento}T00:00:00`);
      if (due < today) return "VENCIDA";
    }
    return factura.estatus || "POR_FACTURAR";
  })();

  const styles = {
    POR_FACTURAR: "bg-amber-100 text-amber-800",
    FACTURADA: "bg-blue-100 text-blue-800",
    PAGO_PARCIAL: "bg-violet-100 text-violet-800",
    PAGADA: "bg-emerald-100 text-emerald-800",
    VENCIDA: "bg-red-100 text-red-800",
    CANCELADA: "bg-slate-200 text-slate-700",
  };

  const icon = {
    POR_FACTURAR: <Clock className="h-3.5 w-3.5" />,
    FACTURADA: <ReceiptText className="h-3.5 w-3.5" />,
    PAGO_PARCIAL: <Plus className="h-3.5 w-3.5" />,
    PAGADA: <CheckCircle className="h-3.5 w-3.5" />,
    VENCIDA: <XCircle className="h-3.5 w-3.5" />,
  }[status] || <FileText className="h-3.5 w-3.5" />;

  return (
    <article className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold text-slate-900">
                  {factura.numeroFactura || `Factura #${factura.id}`}
                </h3>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${styles[status] || styles.CANCELADA}`}>
                  {icon} {status}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {cliente?.nombre || "Sin cliente"}
              </p>
              {factura.viajeId && (
                <p className="text-xs text-slate-400">Viaje #{factura.viajeId}</p>
              )}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu((value) => !value)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
              <MoreVertical className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <button onClick={() => { onViewDetails(factura); setShowMenu(false); }} className="flex w-full items-center px-4 py-2 text-sm hover:bg-slate-50">
                  <Eye className="mr-3 h-4 w-4" /> Ver detalles
                </button>
                <button onClick={() => { onEdit(factura); setShowMenu(false); }} className="flex w-full items-center px-4 py-2 text-sm hover:bg-slate-50">
                  <Edit className="mr-3 h-4 w-4" /> Editar
                </button>
                <button onClick={() => { onDelete(factura); setShowMenu(false); }} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="mr-3 h-4 w-4" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="flex items-center text-xs text-slate-500">
              <DollarSign className="mr-1 h-3.5 w-3.5" /> Total
            </p>
            <p className="font-bold text-slate-900">
              {Number(factura.monto || 0).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Saldo pendiente</p>
            <p className="font-bold text-orange-700">
              {saldo.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
              })}
            </p>
          </div>
        </div>

        {factura.fechaEmision && (
          <p className="mt-3 text-xs text-slate-500">
            Emitida: {formatDateUTC(factura.fechaEmision)} · Vence: {formatDateUTC(factura.fechaVencimiento)}
          </p>
        )}

        <div className="mt-4">
          {factura.estatus === "POR_FACTURAR" && (
            <button onClick={() => onEdit(factura)} className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
              Capturar fecha de emisión
            </button>
          )}

          {factura.estatus === "FACTURADA" && saldo > 0 && (
            <button onClick={() => onPagar(factura)} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Registrar pago
            </button>
          )}

          {factura.estatus === "PAGO_PARCIAL" && saldo > 0 && (
            <button onClick={() => onRegistrarPagoParcial(factura)} className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              Registrar otro abono
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
