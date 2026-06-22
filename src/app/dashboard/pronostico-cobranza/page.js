"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  RefreshCw,
  Users,
  X,
  Save,
  Wallet,
} from "lucide-react";
import { clientsService } from "@/app/services/clientsService";
import pronosticoCobranzaDetalleService from "@/app/services/pronosticoCobranzaDetalleService";

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHumanDate(date) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function getDayName(date) {
  const names = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return names[date.getDay()];
}

function buildSixWeeks(baseDate = new Date()) {
  const start = getMonday(baseDate);

  const weeks = Array.from({ length: 6 }, (_, index) => {
    const weekStart = addDays(start, index * 7);
    const weekDays = Array.from({ length: 7 }, (_, dayIndex) => {
      const current = addDays(weekStart, dayIndex);
      return {
        key: formatIsoDate(current),
        date: current,
        label: getDayName(current),
        shortDate: formatHumanDate(current),
      };
    });

    return {
      index,
      title: `Semana ${index + 1}`,
      start: formatIsoDate(weekStart),
      end: formatIsoDate(addDays(weekStart, 6)),
      days: weekDays,
    };
  });

  return {
    start,
    end: addDays(start, 41),
    weeks,
    allDays: weeks.flatMap((week) => week.days),
  };
}

function normalizeClients(rawClients) {
  return rawClients.map((client) => ({
    id: Number(client.id),
    nombre: client.nombre || `Cliente ${client.id}`,
  }));
}

function normalizePronosticos(rawItems) {
  return rawItems.map((item) => ({
    id: Number(item.id),
    viajeId: item.viajeId != null ? Number(item.viajeId) : null,
    clienteId: item.clienteId != null ? Number(item.clienteId) : null,
    fechaCredito: item.fechaCredito,
    monto: Number(item.monto || 0),
    estadoViaje: item.estadoViaje || "",
    fechaViaje: item.fechaViaje || null,
    fechaBase: item.fechaBase || null,
    diasCredito: item.diasCredito ?? null,
  }));
}

function buildRows(clients, pronosticos, allDayKeys) {
  const rowsMap = new Map();

  for (const client of clients) {
    const dias = {};
    for (const dayKey of allDayKeys) {
      dias[dayKey] = [];
    }

    rowsMap.set(client.id, {
      clienteId: client.id,
      clienteNombre: client.nombre,
      dias,
    });
  }

  for (const item of pronosticos) {
    if (!item.clienteId || !item.fechaCredito) continue;

    if (!rowsMap.has(item.clienteId)) {
      const dias = {};
      for (const dayKey of allDayKeys) {
        dias[dayKey] = [];
      }

      rowsMap.set(item.clienteId, {
        clienteId: item.clienteId,
        clienteNombre: `Cliente ${item.clienteId}`,
        dias,
      });
    }

    const row = rowsMap.get(item.clienteId);
    if (row.dias[item.fechaCredito]) {
      row.dias[item.fechaCredito].push(item);
    }
  }

  return Array.from(rowsMap.values()).sort((a, b) =>
    a.clienteNombre.localeCompare(b.clienteNombre, "es", { sensitivity: "base" })
  );
}

function getCellTotal(registros) {
  return registros.reduce((acc, item) => acc + Number(item.monto || 0), 0);
}

function getWeekTotal(row, weekDays) {
  return weekDays.reduce((acc, day) => {
    const registros = row.dias[day.key] || [];
    return acc + getCellTotal(registros);
  }, 0);
}

function EditPronosticoModal({ open, registro, onClose, onSave, saving }) {
  const [fechaCredito, setFechaCredito] = useState("");
  const [monto, setMonto] = useState("");
  const [estadoViaje, setEstadoViaje] = useState("FACTURADO");

  useEffect(() => {
    if (registro) {
      setFechaCredito(registro.fechaCredito || "");
      setMonto(String(registro.monto ?? ""));
      setEstadoViaje(registro.estadoViaje || "FACTURADO");
    }
  }, [registro]);

  if (!open || !registro) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fechaCredito) {
      toast.error("La fecha es obligatoria");
      return;
    }

    if (monto === "" || Number.isNaN(Number(monto))) {
      toast.error("El monto no es válido");
      return;
    }

    if (estadoViaje === "PAGADA") {
      const confirmar = window.confirm(
        `¿Seguro que deseas marcar como PAGADA la factura del viaje #${registro.viajeId}?`
      );

      if (!confirmar) return;
    }

    await onSave({
      fechaCredito,
      monto: Number(monto),
      estadoViaje,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Editar pronóstico
            </h3>
            <p className="text-sm text-slate-500">
              Viaje #{registro.viajeId ?? "N/A"} · Cliente #{registro.clienteId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Fecha de crédito
            </label>
            <input
              type="date"
              value={fechaCredito}
              onChange={(e) => setFechaCredito(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Monto
            </label>
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Estado
            </label>
            <select
              value={estadoViaje}
              onChange={(e) => setEstadoViaje(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="FACTURADO">FACTURADO</option>
              <option value="PAGADA">PAGADA</option>
            </select>

            {estadoViaje === "PAGADA" && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 border border-emerald-200">
                Al guardar, la factura asociada a este viaje se marcará como pagada automáticamente.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p>
              <span className="font-medium">Estado actual:</span>{" "}
              {registro.estadoViaje || "N/A"}
            </p>
            <p>
              <span className="font-medium">Fecha viaje:</span>{" "}
              {registro.fechaViaje || "N/A"}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PronosticoCard({ registro, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-semibold text-slate-900">
            {formatCurrency(registro.monto)}
          </div>
          <div className="text-[11px] text-slate-500">
            Viaje #{registro.viajeId ?? "N/A"}
          </div>
          {registro.estadoViaje && (
            <div
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                registro.estadoViaje === "PAGADA"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {registro.estadoViaje}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <button
          onClick={() => onEdit(registro)}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
        >
          <Pencil className="h-3 w-3" />
          Editar
        </button>

        <button
          onClick={() => onDelete(registro)}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-3 w-3" />
          Eliminar
        </button>
      </div>
    </div>
  );
}

function WeekTable({ week, rows, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{week.title}</h2>
          <p className="text-sm text-slate-500">
            {week.start} al {week.end}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
          <CalendarDays className="h-4 w-4" />
          7 días + total semanal
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1600px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="sticky left-0 z-20 min-w-[220px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800">
                Cliente
              </th>

              {week.days.map((day) => (
                <th
                  key={day.key}
                  className="min-w-[180px] border-b border-r border-slate-200 px-3 py-3 text-center"
                >
                  <div className="text-sm font-semibold text-slate-700">{day.label}</div>
                  <div className="text-xs text-slate-500">{day.shortDate}</div>
                </th>
              ))}

              <th className="min-w-[170px] border-b border-slate-200 bg-slate-100 px-3 py-3 text-center">
                <div className="text-sm font-semibold text-slate-700">Total semana</div>
                <div className="text-xs text-slate-500">Cliente</div>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const totalSemana = getWeekTotal(row, week.days);

              return (
                <tr key={`${week.index}-${row.clienteId}`} className="align-top">
                  <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-white px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {row.clienteNombre}
                    </div>
                    <div className="text-xs text-slate-500">ID: {row.clienteId}</div>
                  </td>

                  {week.days.map((day) => {
                    const registros = row.dias[day.key] || [];
                    const totalDia = getCellTotal(registros);

                    return (
                      <td
                        key={`${row.clienteId}-${day.key}`}
                        className="border-b border-r border-slate-200 px-2 py-2 align-top"
                      >
                        <div className="min-h-[150px] space-y-2">
                          {registros.length > 0 && (
                            <div className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                              Total día: {formatCurrency(totalDia)}
                            </div>
                          )}

                          {registros.length === 0 ? (
                            <div className="pt-8 text-center text-xs text-slate-300">—</div>
                          ) : (
                            registros.map((registro) => (
                              <PronosticoCard
                                key={registro.id}
                                registro={registro}
                                onEdit={onEdit}
                                onDelete={onDelete}
                              />
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="border-b border-slate-200 bg-slate-50 px-3 py-3 align-top">
                    <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <Wallet className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div className="mt-3 text-xs font-medium text-slate-500">
                        Total de la semana
                      </div>
                      <div className="mt-1 text-base font-bold text-slate-900">
                        {formatCurrency(totalSemana)}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PronosticoCobranzaPage() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [clients, setClients] = useState([]);
  const [pronosticos, setPronosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  const sixWeeks = useMemo(() => buildSixWeeks(baseDate), [baseDate]);
  const allDayKeys = useMemo(() => sixWeeks.allDays.map((d) => d.key), [sixWeeks.allDays]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const inicio = formatIsoDate(sixWeeks.start);
      const fin = formatIsoDate(sixWeeks.end);

      const [clientsData, pronosticosData] = await Promise.all([
        clientsService.getAllClients(200),
        pronosticoCobranzaDetalleService.getByRange(inicio, fin),
      ]);

      setClients(normalizeClients(clientsData));
      setPronosticos(normalizePronosticos(pronosticosData));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la proyección de cobranza");
    } finally {
      setLoading(false);
    }
  }, [sixWeeks.start, sixWeeks.end]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = useMemo(() => {
    return buildRows(clients, pronosticos, allDayKeys);
  }, [clients, pronosticos, allDayKeys]);

  const totalGeneralPeriodo = useMemo(() => {
    return pronosticos.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  }, [pronosticos]);

  const handlePrev6Weeks = () => {
    setBaseDate((prev) => addDays(prev, -42));
  };

  const handleNext6Weeks = () => {
    setBaseDate((prev) => addDays(prev, 42));
  };

  const handleToday = () => {
    setBaseDate(new Date());
  };

  const openEdit = (registro) => {
    setSelectedRegistro(registro);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setSelectedRegistro(null);
    setEditOpen(false);
  };

  const handleSaveEdit = async (payload) => {
    if (!selectedRegistro) return;

    try {
      setSaving(true);
      await pronosticoCobranzaDetalleService.update(selectedRegistro.id, payload);
      toast.success("Pronóstico actualizado");
      closeEdit();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo actualizar el pronóstico");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (registro) => {
    const ok = window.confirm(
      `¿Eliminar el pronóstico del viaje #${registro.viajeId ?? registro.id}?`
    );

    if (!ok) return;

    try {
      await pronosticoCobranzaDetalleService.remove(registro.id);
      toast.success("Pronóstico eliminado");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el pronóstico");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pronóstico de cobranza</h1>
          <p className="text-sm text-slate-600">
            Vista distribuida por semanas, clientes y días con edición por registro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrev6Weeks}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
            6 semanas antes
          </button>

          <button
            onClick={handleToday}
            className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Hoy
          </button>

          <button
            onClick={handleNext6Weeks}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            6 semanas después
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">Rango</span>
          </div>
          <p className="mt-2 text-sm text-slate-900">
            {formatIsoDate(sixWeeks.start)} al {formatIsoDate(sixWeeks.end)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Clientes</span>
          </div>
          <p className="mt-2 text-sm text-slate-900">{rows.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <RefreshCw className="h-4 w-4" />
            <span className="text-sm font-medium">Registros</span>
          </div>
          <p className="mt-2 text-sm text-slate-900">{pronosticos.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Wallet className="h-4 w-4" />
            <span className="text-sm font-medium">Total periodo</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatCurrency(totalGeneralPeriodo)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Cargando proyección...
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          No hay clientes ni registros para este rango.
        </div>
      ) : (
        <div className="space-y-6">
          {sixWeeks.weeks.map((week) => (
            <WeekTable
              key={`${week.start}-${week.end}`}
              week={week}
              rows={rows}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <EditPronosticoModal
        open={editOpen}
        registro={selectedRegistro}
        onClose={closeEdit}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </div>
  );
}