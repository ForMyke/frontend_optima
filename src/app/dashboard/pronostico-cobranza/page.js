"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  RefreshCw,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import pronosticoCobranzaDetalleService from "@/app/services/pronosticoCobranzaDetalleService";

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function startOfFridayWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const daysSinceFriday = (copy.getDay() - 5 + 7) % 7;
  copy.setDate(copy.getDate() - daysSinceFriday);
  return copy;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHumanDate(date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function dayName(date) {
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][
    date.getDay()
  ];
}

function buildSixWeeks(baseDate) {
  const start = startOfFridayWeek(baseDate);
  const weeks = Array.from({ length: 6 }, (_, weekIndex) => {
    const weekStart = addDays(start, weekIndex * 7);
    const days = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(weekStart, dayIndex);
      return {
        key: formatIsoDate(date),
        date,
        label: dayName(date),
        shortDate: formatHumanDate(date),
      };
    });

    return {
      index: weekIndex,
      title: `Semana ${weekIndex + 1}`,
      start: formatIsoDate(weekStart),
      end: formatIsoDate(addDays(weekStart, 6)),
      days,
    };
  });

  return {
    start,
    end: addDays(start, 41),
    weeks,
  };
}

function normalizeResumen(items) {
  return (items || []).map((item) => ({
    clienteId: Number(item.clienteId),
    clienteNombre: item.clienteNombre || `Cliente ${item.clienteId}`,
    fechaCredito: item.fechaCredito,
    saldoTotal: Number(item.saldoTotal || 0),
    cantidadViajes: Number(item.cantidadViajes || 0),
  }));
}

function buildRows(resumen) {
  const map = new Map();

  for (const group of resumen) {
    if (!map.has(group.clienteId)) {
      map.set(group.clienteId, {
        clienteId: group.clienteId,
        clienteNombre: group.clienteNombre,
        fechas: {},
      });
    }

    map.get(group.clienteId).fechas[group.fechaCredito] = group;
  }

  return [...map.values()].sort((a, b) =>
    a.clienteNombre.localeCompare(b.clienteNombre, "es", {
      sensitivity: "base",
    }),
  );
}

function PaymentModal({ mode, group, detail, onClose, onSubmit }) {
  const isGlobal = mode === "GLOBAL";
  const maxAmount = isGlobal
    ? Number(group?.saldoTotal || 0)
    : Number(detail?.saldoPendiente || 0);

  const [form, setForm] = useState({
    monto: String(maxAmount),
    fechaPago: formatIsoDate(new Date()),
    metodoPago: "",
    referencia: "",
    observaciones: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      monto: String(maxAmount),
      fechaPago: formatIsoDate(new Date()),
      metodoPago: "",
      referencia: "",
      observaciones: "",
    });
  }, [maxAmount, mode]);

  if (!mode) return null;

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.monto);

    if (!Number.isFinite(amount) || amount <= 0 || amount > maxAmount) {
      toast.error("El monto del pago no es válido");
      return;
    }

    try {
      setSaving(true);
      await onSubmit({ ...form, monto: amount });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isGlobal ? "Registrar abono global" : "Pagar viaje completo"}
            </h3>
            <p className="text-sm text-slate-500">
              Saldo disponible: {formatMoney(maxAmount)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Monto
            </span>
            <input
              type="number"
              min="0.01"
              max={maxAmount}
              step="0.01"
              disabled={!isGlobal}
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 disabled:bg-slate-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Fecha de pago
            </span>
            <input
              type="date"
              max={formatIsoDate(new Date())}
              value={form.fechaPago}
              onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Método de pago
            </span>
            <select
              value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
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
            value={form.referencia}
            onChange={(e) => setForm({ ...form, referencia: e.target.value })}
            placeholder="Referencia opcional"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

          <textarea
            rows={3}
            value={form.observaciones}
            onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            placeholder="Observaciones"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
          />

          {isGlobal && Number(form.monto || 0) < maxAmount && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Es un abono parcial global. El saldo restante se moverá a la
              siguiente fecha del cliente o a fecha de pago + días de crédito.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Procesando..." : "Confirmar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailsModal({ group, details, loading, onClose, onGlobal, onIndividual }) {
  if (!group) return null;

  const total = details.reduce(
    (sum, detail) => sum + Number(detail.saldoPendiente || 0),
    0,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {group.clienteNombre}
            </h2>
            <p className="text-sm text-slate-500">
              Cobro programado: {group.fechaCredito}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Saldo pendiente</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatMoney(total)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Viajes incluidos</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {details.length}
              </p>
            </div>
            <button
              onClick={onGlobal}
              disabled={loading || total <= 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-4 font-semibold text-white disabled:opacity-50"
            >
              <CreditCard className="h-5 w-5" />
              Registrar abono global
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Cargando viajes...
            </div>
          ) : details.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              El grupo ya no tiene saldo pendiente.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[900px] w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Viaje</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Ruta</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Monto</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Pagado</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Pendiente</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail) => (
                    <tr key={detail.detalleId} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {detail.folio || `#${detail.viajeId}`}
                        </p>
                        <p className="text-xs text-slate-500">{detail.fechaViaje || "Sin fecha"}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {detail.origen || "—"} → {detail.destino || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">{formatMoney(detail.monto)}</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-700">{formatMoney(detail.montoPagado)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-700">{formatMoney(detail.saldoPendiente)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {detail.estadoCobranza}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onIndividual(detail)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                        >
                          Pagar viaje
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, onDetails }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
      <p className="text-lg font-bold text-slate-900">
        {formatMoney(group.saldoTotal)}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        {group.cantidadViajes} viaje{group.cantidadViajes === 1 ? "" : "s"}
      </p>
      <button
        onClick={() => onDetails(group)}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200"
      >
        <Eye className="h-4 w-4" /> Ver detalles
      </button>
    </div>
  );
}

function WeekTable({ week, rows, onDetails }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4">
        <h2 className="font-semibold text-slate-900">{week.title}</h2>
        <p className="text-sm text-slate-500">
          Viernes {week.start} a jueves {week.end}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[1500px] w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold">
                Cliente
              </th>
              {week.days.map((day) => (
                <th key={day.key} className="min-w-[175px] border-b border-r border-slate-200 px-3 py-3 text-center">
                  <div className="text-sm font-semibold">{day.label}</div>
                  <div className="text-xs text-slate-500">{day.shortDate}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${week.index}-${row.clienteId}`} className="align-top">
                <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">{row.clienteNombre}</p>
                </td>
                {week.days.map((day) => {
                  const group = row.fechas[day.key];
                  return (
                    <td key={`${row.clienteId}-${day.key}`} className="h-[150px] border-b border-r border-slate-200 p-2 align-top">
                      {group ? (
                        <GroupCard group={group} onDetails={onDetails} />
                      ) : (
                        <div className="pt-12 text-center text-xs text-slate-300">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function PronosticoCobranzaPage() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [details, setDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const calendar = useMemo(() => buildSixWeeks(baseDate), [baseDate]);
  const rows = useMemo(() => buildRows(resumen), [resumen]);
  const totalPeriod = useMemo(
    () => resumen.reduce((sum, item) => sum + item.saldoTotal, 0),
    [resumen],
  );

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pronosticoCobranzaDetalleService.getResumen(
        formatIsoDate(calendar.start),
        formatIsoDate(calendar.end),
      );
      setResumen(normalizeResumen(data));
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el pronóstico de cobranza");
    } finally {
      setLoading(false);
    }
  }, [calendar.start, calendar.end]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const loadDetails = async (group) => {
    try {
      setDetailsLoading(true);
      const data = await pronosticoCobranzaDetalleService.getDetalles(
        group.clienteId,
        group.fechaCredito,
      );
      setDetails(data || []);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los viajes");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDetails = async (group) => {
    setSelectedGroup(group);
    setDetails([]);
    await loadDetails(group);
  };

  const refreshAfterPayment = async () => {
    await loadSummary();
    if (selectedGroup) {
      await loadDetails(selectedGroup);
    }
  };

  const submitPayment = async (form) => {
    try {
      let result;

      if (paymentMode === "GLOBAL") {
        result = await pronosticoCobranzaDetalleService.registrarPagoGlobal({
          clienteId: selectedGroup.clienteId,
          fechaCredito: selectedGroup.fechaCredito,
          fechaPago: form.fechaPago,
          monto: form.monto,
          metodoPago: form.metodoPago,
          referencia: form.referencia || null,
          observaciones: form.observaciones || null,
        });
      } else {
        result = await pronosticoCobranzaDetalleService.pagarViajeCompleto(
          selectedDetail.detalleId,
          {
            monto: Number(selectedDetail.saldoPendiente),
            fechaPago: form.fechaPago,
            metodoPago: form.metodoPago,
            referencia: form.referencia || null,
            observaciones: form.observaciones || null,
          },
        );
      }

      toast.success(result.mensaje || "Pago registrado");
      setPaymentMode(null);
      setSelectedDetail(null);
      await refreshAfterPayment();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "No se pudo registrar el pago",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pronóstico de cobranza</h1>
          <p className="text-sm text-slate-600">
            Solo muestra el saldo pendiente agrupado por cliente y fecha.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setBaseDate((date) => addDays(date, -42))} className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
            <ChevronLeft className="h-4 w-4" /> 6 semanas antes
          </button>
          <button onClick={() => setBaseDate(new Date())} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">Hoy</button>
          <button onClick={() => setBaseDate((date) => addDays(date, 42))} className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm">
            6 semanas después <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={loadSummary} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-blue-200">
            <RefreshCw className="h-4 w-4" /> Recargar
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <CalendarDays className="h-5 w-5 text-slate-500" />
          <p className="mt-2 text-sm text-slate-500">Rango</p>
          <p className="font-semibold">{formatIsoDate(calendar.start)} al {formatIsoDate(calendar.end)}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Truck className="h-5 w-5 text-slate-500" />
          <p className="mt-2 text-sm text-slate-500">Grupos de cobro</p>
          <p className="text-xl font-bold">{resumen.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <Wallet className="h-5 w-5 text-slate-500" />
          <p className="mt-2 text-sm text-slate-500">Saldo del periodo</p>
          <p className="text-xl font-bold">{formatMoney(totalPeriod)}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Cargando...</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">No hay saldos pendientes en este rango.</div>
      ) : (
        <div className="space-y-6">
          {calendar.weeks.map((week) => (
            <WeekTable key={week.start} week={week} rows={rows} onDetails={openDetails} />
          ))}
        </div>
      )}

      <DetailsModal
        group={selectedGroup}
        details={details}
        loading={detailsLoading}
        onClose={() => {
          setSelectedGroup(null);
          setDetails([]);
        }}
        onGlobal={() => setPaymentMode("GLOBAL")}
        onIndividual={(detail) => {
          setSelectedDetail(detail);
          setPaymentMode("INDIVIDUAL");
        }}
      />

      <PaymentModal
        mode={paymentMode}
        group={selectedGroup}
        detail={selectedDetail}
        onClose={() => {
          setPaymentMode(null);
          setSelectedDetail(null);
        }}
        onSubmit={submitPayment}
      />
    </div>
  );
}
