"use client";

import {
  Building2,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

const parseDireccion = (direccionString) => {
  const defaultDireccion = {
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    pais: "México",
  };

  if (!direccionString) return defaultDireccion;

  try {
    const direccionObj = JSON.parse(direccionString);
    return { ...defaultDireccion, ...direccionObj };
  } catch (e) {
    console.log("Parseando dirección legacy:", direccionString);

    const partes = direccionString.split(",").map((p) => p.trim());

    if (partes.length >= 8) {
      return {
        calle: partes[0] || "",
        numeroExterior: partes[1] || "",
        numeroInterior: partes[2] || "",
        colonia: partes[3] || "",
        ciudad: partes[4] || "",
        estado: partes[5] || "",
        codigoPostal: partes[6] || "",
        pais: partes[7] || "México",
      };
    }

    console.warn("Formato de dirección no reconocido:", direccionString);
    return defaultDireccion;
  }
};

const ViewClientModal = ({ isOpen, onClose, client }) => {
  if (!isOpen || !client) return null;

  const direccionParsed = parseDireccion(client.direccion);

  const atrasosCobranza = Number(
    client.atrasosCobranza ?? client.atrasos_cobranza ?? 0
  );

  const ultimaFechaPromesaPago =
    client.ultimaFechaPromesaPago ?? client.ultima_fecha_promesa_pago ?? null;

  const ultimoAtrasoCobranza =
    client.ultimoAtrasoCobranza ?? client.ultimo_atraso_cobranza ?? null;

  const tieneAtrasos = atrasosCobranza > 0;
  const riesgoAlto = atrasosCobranza >= 3;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(
      dateString.includes("T") ? dateString : `${dateString}T12:00:00`
    );

    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const riesgoConfig = riesgoAlto
    ? {
        title: "Riesgo alto de cobranza",
        description:
          "Este cliente ha solicitado varios atrasos de pago. Conviene dar seguimiento antes de aceptar nuevos plazos.",
        box: "bg-red-50 border-red-200",
        icon: "bg-red-100 text-red-700",
        text: "text-red-700",
      }
    : tieneAtrasos
      ? {
          title: "Cliente con atraso de cobranza",
          description:
            "Este cliente ha solicitado mover la fecha de pago al menos una vez.",
          box: "bg-amber-50 border-amber-200",
          icon: "bg-amber-100 text-amber-700",
          text: "text-amber-700",
        }
      : {
          title: "Sin atrasos de cobranza",
          description:
            "Este cliente no tiene atrasos registrados en el pronóstico de cobranza.",
          box: "bg-emerald-50 border-emerald-200",
          icon: "bg-emerald-100 text-emerald-700",
          text: "text-emerald-700",
        };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Detalles del cliente
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Información completa del cliente
              </p>
            </div>

            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                riesgoAlto
                  ? "from-red-600 to-red-700"
                  : tieneAtrasos
                    ? "from-amber-500 to-orange-600"
                    : "from-blue-600 to-blue-700"
              }`}
            >
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información General */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Información general
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Nombre / Razón social
                </label>
                <p className="text-sm text-slate-900 mt-1">{client.nombre}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Días de crédito
                </label>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {client.diasCredito || 0} días
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  RFC
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {client.rfc || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Riesgo de Cobranza */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Seguimiento de cobranza
            </h3>

            <div className={`rounded-xl border p-4 ${riesgoConfig.box}`}>
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${riesgoConfig.icon}`}
                >
                  {tieneAtrasos ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-bold ${riesgoConfig.text}`}>
                    {riesgoConfig.title}
                  </p>

                  <p className="text-sm text-slate-600 mt-1">
                    {riesgoConfig.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/70 rounded-lg border border-white px-3 py-2">
                      <p className="text-xs text-slate-500">
                        Veces atrasado
                      </p>
                      <p className={`text-lg font-bold ${riesgoConfig.text}`}>
                        {atrasosCobranza}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-lg border border-white px-3 py-2">
                      <p className="text-xs text-slate-500">
                        Última promesa
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDate(ultimaFechaPromesaPago)}
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-lg border border-white px-3 py-2">
                      <p className="text-xs text-slate-500">
                        Último atraso
                      </p>
                      <p className="text-sm font-semibold text-slate-900 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        {formatDate(ultimoAtrasoCobranza)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Información de contacto
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Correo electrónico
                </label>
                <p className="text-sm text-slate-900 mt-1">{client.correo}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Teléfono
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {client.telefono}
                </p>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Ubicación
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Calle
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.calle || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Número Exterior
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.numeroExterior || "N/A"}
                </p>
              </div>

              {direccionParsed.numeroInterior && (
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Número Interior
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {direccionParsed.numeroInterior}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Colonia
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.colonia || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Ciudad
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.ciudad || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Estado
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.estado || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  Código Postal
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.codigoPostal || "N/A"}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  País
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {direccionParsed.pais || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full cursor-pointer px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewClientModal;