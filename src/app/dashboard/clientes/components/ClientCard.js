"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
} from "lucide-react";

const ClientCard = ({ client, onEdit, onDelete, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const atrasosCobranza = Number(
    client.atrasosCobranza ?? client.atrasos_cobranza ?? 0
  );

  const ultimaFechaPromesaPago =
    client.ultimaFechaPromesaPago ?? client.ultima_fecha_promesa_pago ?? null;

  const ultimoAtrasoCobranza =
    client.ultimoAtrasoCobranza ?? client.ultimo_atraso_cobranza ?? null;

  const tieneAtrasos = atrasosCobranza > 0;
  const riesgoAlto = atrasosCobranza >= 3;

  const cardClasses = riesgoAlto
    ? "bg-red-50 border-red-300 hover:shadow-red-100"
    : tieneAtrasos
      ? "bg-amber-50 border-amber-300 hover:shadow-amber-100"
      : "bg-white border-slate-200 hover:shadow-md";

  const iconClasses = riesgoAlto
    ? "from-red-600 to-red-700"
    : tieneAtrasos
      ? "from-amber-500 to-orange-600"
      : "from-blue-600 to-blue-700";

  const badgeClasses = riesgoAlto
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-amber-100 text-amber-700 border-amber-200";

  const alertaClasses = riesgoAlto
    ? "bg-red-100 border-red-200 text-red-700"
    : "bg-amber-100 border-amber-200 text-amber-700";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(
      dateString.includes("T") ? dateString : `${dateString}T12:00:00`
    );

    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatearDireccion = () => {
    if (!client.direccion) return "Sin dirección";

    try {
      const direccion =
        typeof client.direccion === "string"
          ? JSON.parse(client.direccion)
          : client.direccion;

      const partes = [];

      if (direccion.calle && direccion.numeroExterior) {
        partes.push(`${direccion.calle} ${direccion.numeroExterior}`);
      } else if (direccion.calle) {
        partes.push(direccion.calle);
      }

      if (direccion.ciudad) partes.push(direccion.ciudad);
      if (direccion.estado) partes.push(direccion.estado);

      return partes.join(", ") || "Sin dirección";
    } catch (e) {
      return client.direccion;
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-sm border transition-all ${cardClasses}`}
    >
      {tieneAtrasos && (
        <div
          className={`absolute top-0 left-0 right-0 px-4 py-1.5 text-center text-xs font-bold tracking-wide ${
            riesgoAlto
              ? "bg-red-600 text-white"
              : "bg-amber-500 text-white"
          }`}
        >
          {riesgoAlto
            ? `CLIENTE CON RIESGO ALTO · ${atrasosCobranza} ATRASOS`
            : `CLIENTE CON ${atrasosCobranza} ATRASO${atrasosCobranza === 1 ? "" : "S"}`}
        </div>
      )}

      <div className={`p-4 lg:p-6 ${tieneAtrasos ? "pt-10" : ""}`}>
        <div className="flex items-start justify-between mb-3 lg:mb-4">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconClasses} shrink-0`}
            >
              <Building2 className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base lg:text-lg font-semibold text-slate-900">
                  {client.nombre}
                </h3>

                {tieneAtrasos && (
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${badgeClasses}`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {atrasosCobranza} atraso
                    {atrasosCobranza === 1 ? "" : "s"}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-xs lg:text-sm text-slate-500">
                  RFC: {client.rfc || "N/A"}
                </p>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    {client.diasCredito || 0} días
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 cursor-pointer text-slate-400 hover:text-slate-600 hover:bg-white/70 rounded-lg transition-all"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10">
                <button
                  onClick={() => {
                    onViewDetails(client);
                    setShowMenu(false);
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-3 text-slate-400" />
                  Ver detalles
                </button>

                <button
                  onClick={() => {
                    onEdit(client);
                    setShowMenu(false);
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Edit2 className="h-4 w-4 mr-3 text-slate-400" />
                  Editar
                </button>

                <hr className="my-2 border-slate-100" />

                <button
                  onClick={() => {
                    onDelete(client);
                    setShowMenu(false);
                  }}
                  className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {tieneAtrasos && (
          <div className={`mb-4 rounded-xl border px-3 py-3 ${alertaClasses}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-bold">
                  Atraso de cobranza registrado
                </p>

                <p className="text-xs mt-1">
                  Este cliente ha pedido mover la fecha de pago{" "}
                  <span className="font-bold">
                    {atrasosCobranza} vez
                    {atrasosCobranza === 1 ? "" : "es"}
                  </span>
                  .
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="rounded-lg bg-white/70 border border-white px-2.5 py-2">
                    <p className="text-[11px] opacity-80">Última promesa</p>
                    <p className="text-xs font-bold">
                      {formatDate(ultimaFechaPromesaPago)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/70 border border-white px-2.5 py-2">
                    <p className="text-[11px] opacity-80">Último atraso</p>
                    <p className="text-xs font-bold flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {formatDate(ultimoAtrasoCobranza)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Mail className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            <span className="truncate">{client.correo || "Sin correo"}</span>
          </div>

          <div className="flex items-center text-xs lg:text-sm text-slate-600">
            <Phone className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
            {client.telefono || "Sin teléfono"}
          </div>

          <div className="flex items-start text-xs lg:text-sm text-slate-600">
            <MapPin className="h-4 w-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{formatearDireccion()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;