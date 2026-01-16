"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Calendar,
} from "lucide-react";
import { facturaService } from "@/app/services/facturaService";
import { authService } from "@/app/services/authService";
import toast from "react-hot-toast";

// Componente para las tarjetas superiores (placeholder para futuras implementaciones)
const StatCard = ({ title, value, color, placeholder = false }) => (
  <div className="bg-white rounded-lg shadow-sm p-3 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-slate-600">{title}</p>
          <div
            className={`p-1.5 rounded-md ${placeholder ? "bg-slate-200" : color}`}
          >
            <DollarSign className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
        {placeholder ? (
          <p className="text-lg font-bold text-slate-400">No implementado</p>
        ) : (
          <p className="text-xl font-bold text-slate-900">{value}</p>
        )}
      </div>
    </div>
  </div>
);

// Componente para cliente individual (desplegable)
const ClienteCard = ({
  cliente,
  bgColor,
  borderColor,
  onToggle,
  isExpanded,
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm border ${borderColor} hover:shadow-md transition-all`}
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:opacity-90 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-2 flex-1">
          <div>
            <p className="text-sm font-semibold text-slate-900 text-left">
              {cliente.clienteNombre}
            </p>
            <p className="text-xs text-slate-600">
              {cliente.totalFacturas}{" "}
              {cliente.totalFacturas === 1 ? "factura" : "facturas"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">
              {formatCurrency(cliente.montoTotal)}
            </p>
            {cliente.montoPendiente !== undefined && (
              <p className="text-xs text-red-600 font-medium">
                Pend: {formatCurrency(cliente.montoPendiente)}
              </p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && cliente.facturas && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-200 pt-2">
          {cliente.facturas.map((factura) => (
            <div
              key={factura.facturaId}
              className="bg-white bg-opacity-60 rounded-md p-2 border border-slate-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-700">
                    <FileText className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {factura.numeroFactura}
                    </p>
                    <p className="text-xs text-slate-500">
                      ID: #{factura.facturaId}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {formatCurrency(factura.monto)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500 flex items-center">
                    <Calendar className="h-2.5 w-2.5 mr-1" />
                    Emisión
                  </p>
                  <p className="font-medium text-slate-900">
                    {formatDate(factura.fechaEmision)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 flex items-center">
                    <Clock className="h-2.5 w-2.5 mr-1" />
                    Límite
                  </p>
                  <p className="font-medium text-slate-900">
                    {formatDate(factura.fechaLimitePago)}
                  </p>
                </div>
              </div>

              {/* Barra de progreso para pago parcial */}
              {factura.montoPagado !== undefined &&
                factura.montoPendiente !== undefined && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.round((factura.montoPagado / factura.monto) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div>
                        <p className="text-slate-500 text-xs">Total</p>
                        <p className="font-semibold text-slate-900 text-xs">
                          {formatCurrency(factura.monto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Pagado</p>
                        <p className="font-semibold text-green-600 text-xs">
                          {formatCurrency(factura.montoPagado)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Pendiente</p>
                        <p className="font-semibold text-red-600 text-xs">
                          {formatCurrency(factura.montoPendiente)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para secciones de facturas
const FacturasSection = ({
  title,
  subtitle,
  clientes,
  totalMonto,
  bgColor,
  borderColor,
  badge,
  icon: Icon,
  showDetails = true,
}) => {
  const [expandedClientes, setExpandedClientes] = useState({});

  const toggleCliente = (clienteId) => {
    setExpandedClientes((prev) => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className={`${bgColor} rounded-lg shadow-sm border ${borderColor}`}>
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-slate-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-600">{subtitle}</p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}
          >
            {clientes.length}
          </span>
        </div>
      </div>

      <div className="p-3">
        {clientes.length === 0 ? (
          <div className="text-center py-6">
            <Icon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">Sin facturas</p>
          </div>
        ) : showDetails ? (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.clienteId}
                cliente={cliente}
                bgColor="bg-white bg-opacity-50"
                borderColor={borderColor}
                onToggle={() => toggleCliente(cliente.clienteId)}
                isExpanded={expandedClientes[cliente.clienteId]}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <div
                key={cliente.clienteId}
                className="bg-white bg-opacity-50 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {cliente.clienteNombre}
                      </p>
                      <p className="text-xs text-slate-600">
                        {cliente.totalFacturas}{" "}
                        {cliente.totalFacturas === 1 ? "factura" : "facturas"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">
                    {formatCurrency(cliente.montoTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-300">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-slate-700">Total:</p>
            <p className="text-base font-bold text-slate-900">
              {formatCurrency(totalMonto)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente especial para Pago Parcial
const FacturasPagoParcialSection = ({
  clientes,
  totalMonto,
  totalPendiente,
}) => {
  const [expandedClientes, setExpandedClientes] = useState({});

  const toggleCliente = (clienteId) => {
    setExpandedClientes((prev) => ({
      ...prev,
      [clienteId]: !prev[clienteId],
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200">
      <div className="p-3 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pago Parcial
              </h3>
              <p className="text-xs text-slate-600">Pagos en proceso</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {clientes.length}
          </span>
        </div>
      </div>

      <div className="p-3">
        {clientes.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs">Sin pagos parciales</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente.clienteId}
                cliente={cliente}
                bgColor="bg-white bg-opacity-50"
                borderColor="border-blue-200"
                onToggle={() => toggleCliente(cliente.clienteId)}
                isExpanded={expandedClientes[cliente.clienteId]}
              />
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-blue-300 space-y-1.5">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-slate-700">Total:</p>
            <p className="text-sm font-bold text-slate-900">
              {formatCurrency(totalMonto)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-slate-700">Pagado:</p>
            <p className="text-sm font-bold text-green-600">
              {formatCurrency(totalMonto - totalPendiente)}
            </p>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-blue-200">
            <p className="text-xs font-medium text-slate-700">Pendiente:</p>
            <p className="text-base font-bold text-red-600">
              {formatCurrency(totalPendiente)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [diasHistorial, setDiasHistorial] = useState(30);
  const [diasCompletadas, setDiasCompletadas] = useState(10);

  useEffect(() => {
    loadDashboardData();
  }, [diasHistorial, diasCompletadas]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await facturaService.getDashboard(
        diasHistorial,
        diasCompletadas,
      );
      setDashboardData(data);
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 min-h-screen">
        <div className="mb-4">
          <div className="h-6 bg-slate-200 rounded w-48 mb-1 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-72 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-200 h-20 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      {/* Header compacto */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-xs text-slate-600">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tabs compactos */}
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-slate-200 p-1 inline-flex space-x-1">
        <button className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md transition-all">
          Día
        </button>
        <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all">
          Semana
        </button>
        <button className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all">
          Mes
        </button>
      </div>

      {/* Tarjetas superiores compactas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <StatCard
          title="INGRESOS DEL DÍA"
          value="$0.00"
          color="bg-gradient-to-br from-blue-600 to-blue-700"
          placeholder={true}
        />
        <StatCard
          title="GASTOS DEL DÍA"
          value="$0.00"
          color="bg-gradient-to-br from-red-600 to-red-700"
          placeholder={true}
        />
        <StatCard
          title="GANANCIA DEL DÍA"
          value="$0.00"
          color="bg-gradient-to-br from-green-600 to-green-700"
          placeholder={true}
        />
      </div>

      {/* Selector de profundidad compacto */}
      <div className="mb-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3">
        <h3 className="text-xs font-semibold text-slate-900 mb-2">
          Configuración de Historial
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Pendientes/Sin Pagar
            </label>
            <select
              value={diasHistorial}
              onChange={(e) => setDiasHistorial(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={7}>7 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
              <option value={45}>45 días</option>
              <option value={60}>60 días</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Completadas
            </label>
            <select
              value={diasCompletadas}
              onChange={(e) => setDiasCompletadas(Number(e.target.value))}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value={7}>7 días</option>
              <option value={10}>10 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de facturas compacto - 2 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        {/* Facturas Pendientes - Fondo amarillo claro */}
        <FacturasSection
          title="Pendientes"
          subtitle="Menos de 7 días"
          clientes={dashboardData?.facturasPendientes?.clientes || []}
          totalMonto={dashboardData?.facturasPendientes?.totalMonto || 0}
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
          badge="bg-amber-100 text-amber-800"
          icon={AlertCircle}
        />

        {/* Facturas Sin Pagar - Fondo rojo claro */}
        <FacturasSection
          title="Sin Pagar"
          subtitle="Más de 7 días"
          clientes={dashboardData?.facturasSinPagar?.clientes || []}
          totalMonto={dashboardData?.facturasSinPagar?.totalMonto || 0}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          badge="bg-red-100 text-red-800"
          icon={XCircle}
        />
      </div>

      {/* Grid de 2 columnas para Pago Parcial y Completadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Facturas con Pago Parcial - Fondo azul claro */}
        <FacturasPagoParcialSection
          clientes={dashboardData?.facturasPagoParcial?.clientes || []}
          totalMonto={dashboardData?.facturasPagoParcial?.totalMonto || 0}
          totalPendiente={
            dashboardData?.facturasPagoParcial?.totalPendiente || 0
          }
        />

        {/* Facturas Completadas - Fondo verde claro */}
        <FacturasSection
          title="Completadas"
          subtitle="Pagadas totalmente"
          clientes={dashboardData?.facturasCompletadas?.clientes || []}
          totalMonto={dashboardData?.facturasCompletadas?.totalMonto || 0}
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
          badge="bg-emerald-100 text-emerald-800"
          icon={CheckCircle}
          showDetails={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;
