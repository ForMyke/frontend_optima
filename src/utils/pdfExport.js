import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Configuración común para todos los PDFs
const commonConfig = {
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4',
  margin: 10
}

// Agregar logo y header común
const addHeader = (doc, title, subtitle = '') => {
  doc.setFontSize(20)
  doc.setTextColor(30, 58, 138) // blue-900
  doc.text(title, 15, 20)

  if (subtitle) {
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.text(subtitle, 15, 27)
  }

  // Fecha de generación
  const fecha = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184) // slate-400
  doc.text(`Generado: ${fecha}`, 15, 33)
}

// Footer común
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      'FMPMex - Sistema de Gestión de Transportes',
      doc.internal.pageSize.getWidth() - 15,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }
}

// Exportar Almacenes
export const exportAlmacenesPDF = (almacenes, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Almacenes', `Total de almacenes: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Activos: ${stats.activos} | Inactivos: ${stats.inactivos} | Total Refacciones: ${stats.totalRefacciones}`, 15, 40)

  // Tabla de almacenes
  const tableData = almacenes.map(almacen => [
    almacen.id,
    almacen.nombre,
    almacen.ubicacion,
    almacen.capacidadMaxima || 'N/A',
    almacen.capacidadActual || 0,
    almacen.encargado || 'Sin asignar',
    almacen.activo ? 'Activo' : 'Inactivo'
  ])

  autoTable(doc, {
    head: [['ID', 'Nombre', 'Ubicación', 'Cap. Máx', 'Cap. Actual', 'Encargado', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`almacenes_${Date.now()}.pdf`)
}

// Exportar Refacciones
export const exportRefaccionesPDF = (refacciones, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Refacciones', `Total de refacciones: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Stock Bajo: ${stats.stockBajo} | Valor Total: $${stats.valorTotal?.toLocaleString('es-MX') || 0}`, 15, 40)

  // Tabla de refacciones
  const tableData = refacciones.map(ref => [
    ref.id,
    ref.nombre,
    ref.descripcion || 'N/A',
    ref.stockActual || 0,
    ref.unidadMedida || 'pieza',
    `$${(ref.costoUnitario || 0).toFixed(2)}`,
    ref.almacen?.nombre || 'Sin almacén',
    ref.stockActual < 5 ? 'Crítico' : ref.stockActual < 10 ? 'Bajo' : 'Normal'
  ])

  autoTable(doc, {
    head: [['ID', 'Nombre', 'Descripción', 'Stock', 'Unidad', 'Costo', 'Almacén', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      2: { cellWidth: 35 }
    }
  })

  addFooter(doc)
  doc.save(`refacciones_${Date.now()}.pdf`)
}

// Exportar Clientes
export const exportClientesPDF = (clientes, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Clientes', `Total de clientes: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Activos: ${stats.activos} | Inactivos: ${stats.inactivos}`, 15, 40)

  // Tabla de clientes
  const tableData = clientes.map(cliente => [
    cliente.id,
    cliente.nombre,
    cliente.rfc || 'N/A',
    cliente.telefono || 'N/A',
    cliente.email || 'N/A',
    cliente.direccion || 'N/A',
    cliente.activo ? 'Activo' : 'Inactivo'
  ])

  autoTable(doc, {
    head: [['ID', 'Nombre', 'RFC', 'Teléfono', 'Email', 'Dirección', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`clientes_${Date.now()}.pdf`)
}

// Exportar Operadores
export const exportOperadoresPDF = (operadores, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Operadores', `Total de operadores: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Activos: ${stats.activos} | Disponibles: ${stats.disponibles}`, 15, 40)

  // Tabla de operadores
  const tableData = operadores.map(op => [
    op.id,
    op.nombre,
    op.licencia || 'N/A',
    op.telefono || 'N/A',
    op.tipoLicencia || 'N/A',
    op.unidad?.placas || 'Sin unidad',
    op.disponible ? 'Disponible' : 'No disponible',
    op.activo ? 'Activo' : 'Inactivo'
  ])

  autoTable(doc, {
    head: [['ID', 'Nombre', 'Licencia', 'Teléfono', 'Tipo Lic.', 'Unidad', 'Disponibilidad', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`operadores_${Date.now()}.pdf`)
}

// Exportar Unidades
export const exportUnidadesPDF = (unidades, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Unidades', `Total de unidades: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Activas: ${stats.activas} | Disponibles: ${stats.disponibles} | En mantenimiento: ${stats.mantenimiento}`, 15, 40)

  // Tabla de unidades
  const tableData = unidades.map(unidad => [
    unidad.id,
    unidad.placas,
    unidad.numeroEconomico || 'N/A',
    unidad.marca || 'N/A',
    unidad.modelo || 'N/A',
    unidad.anio || 'N/A',
    unidad.operador?.nombre || 'Sin operador',
    unidad.disponible ? 'Disponible' : 'No disponible'
  ])

  autoTable(doc, {
    head: [['ID', 'Placas', 'No. Económico', 'Marca', 'Modelo', 'Año', 'Operador', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`unidades_${Date.now()}.pdf`)
}

// Exportar Viajes
export const exportViajesPDF = (viajes, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Viajes', `Total de viajes: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Completados: ${stats.completados} | En ruta: ${stats.enRuta} | Pendientes: ${stats.pendientes}`, 15, 40)

  // Tabla de viajes
  const tableData = viajes.map(viaje => {
    // Obtener origen y destino de la ruta o rutaComisiones
    const origen = viaje.ruta?.origen || viaje.rutaComisiones?.origen || viaje.origen || 'N/A'
    const destino = viaje.ruta?.destino || viaje.rutaComisiones?.destino || viaje.destino || 'N/A'
    // Estado puede venir como 'estado' o 'estatus'
    const estado = viaje.estado || viaje.estatus || 'N/A'

    return [
      viaje.id,
      viaje.folio || 'N/A',
      viaje.cliente?.nombre || 'N/A',
      origen,
      destino,
      viaje.operador?.nombre || 'N/A',
      viaje.unidad?.numeroEconomico || viaje.unidad?.placas || 'N/A',
      viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString('es-MX') : 'N/A',
      estado
    ]
  })

  autoTable(doc, {
    head: [['ID', 'Folio', 'Cliente', 'Origen', 'Destino', 'Operador', 'Unidad', 'Fecha', 'Estado']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`viajes_${Date.now()}.pdf`)
}

// Exportar Facturas
export const exportFacturasPDF = (facturas, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Facturas', `Total de facturas: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Pagadas: ${stats.pagadas} | Pendientes: ${stats.pendientes} | Monto Total: $${stats.totalMonto?.toLocaleString('es-MX') || 0}`, 15, 40)

  // Tabla de facturas
  const tableData = facturas.map(factura => [
    factura.id,
    factura.numeroFactura || 'N/A',
    factura.cliente?.nombre || 'N/A',
    `$${(factura.monto || 0).toLocaleString('es-MX')}`,
    `$${(factura.montoParcial || 0).toLocaleString('es-MX')}`,
    `$${((factura.monto || 0) - (factura.montoParcial || 0)).toLocaleString('es-MX')}`,
    new Date(factura.fechaEmision).toLocaleDateString('es-MX'),
    factura.estatus || 'N/A'
  ])

  autoTable(doc, {
    head: [['ID', 'No. Factura', 'Cliente', 'Monto', 'Pagado', 'Pendiente', 'Fecha', 'Estatus']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`facturas_${Date.now()}.pdf`)
}

// Exportar Gastos Semanales
export const exportGastosPDF = (gastos, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Gastos Semanales', `Total de registros: ${gastos.length}`)

  // Tabla de gastos
  const tableData = gastos.map(gasto => [
    gasto.id,
    `${new Date(gasto.semanaInicio).toLocaleDateString('es-MX')} - ${new Date(gasto.semanaFin).toLocaleDateString('es-MX')}`,
    gasto.totalViajes || 0,
    `$${(gasto.iave || 0).toLocaleString('es-MX')}`,
    `$${(gasto.diesel || 0).toLocaleString('es-MX')}`,
    `$${(gasto.nomina || 0).toLocaleString('es-MX')}`,
    `$${(gasto.gastosExtras || 0).toLocaleString('es-MX')}`,
    `$${(gasto.totalGastos || 0).toLocaleString('es-MX')}`
  ])

  autoTable(doc, {
    head: [['ID', 'Semana', 'Viajes', 'IAVE', 'Diesel', 'Nómina', 'Extras', 'Total']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`gastos_semanales_${Date.now()}.pdf`)
}

// Exportar Bitácora
export const exportBitacoraPDF = (bitacoras) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Bitácora de Viajes', `Total de registros: ${bitacoras.length}`)

  // Tabla de bitácora
  const tableData = bitacoras.map(bit => [
    bit.id,
    bit.viaje?.folio || 'N/A',
    bit.viaje?.operador?.nombre || 'N/A',
    bit.viaje?.unidad?.placas || 'N/A',
    `$${(bit.casetas || 0).toLocaleString('es-MX')}`,
    `${(bit.dieselLitros || 0)} L`,
    `$${(bit.comisionOperador || 0).toLocaleString('es-MX')}`,
    `$${(bit.gastosExtras || 0).toLocaleString('es-MX')}`,
    `$${(bit.costoTotal || 0).toLocaleString('es-MX')}`
  ])

  autoTable(doc, {
    head: [['ID', 'Folio', 'Operador', 'Unidad', 'Casetas', 'Diesel', 'Comisión', 'Extras', 'Total']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`bitacora_viajes_${Date.now()}.pdf`)
}

// Exportar Mantenimiento
export const exportMantenimientoPDF = (mantenimientos, almacenNombre) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, `Reporte de Mantenimiento - ${almacenNombre}`, `Total de registros: ${mantenimientos.length}`)

  // Tabla de mantenimiento
  const tableData = mantenimientos.map(mant => [
    mant.id,
    mant.refaccion?.nombre || 'N/A',
    mant.tipo || 'N/A',
    mant.cantidad || 0,
    `$${(mant.costo || 0).toLocaleString('es-MX')}`,
    new Date(mant.fecha).toLocaleDateString('es-MX'),
    mant.responsable || 'N/A',
    mant.observaciones || 'N/A'
  ])

  autoTable(doc, {
    head: [['ID', 'Refacción', 'Tipo', 'Cantidad', 'Costo', 'Fecha', 'Responsable', 'Observaciones']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      7: { cellWidth: 40 }
    }
  })

  addFooter(doc)
  doc.save(`mantenimiento_${almacenNombre}_${Date.now()}.pdf`)
}

// Exportar Facturas Extra
export const exportFacturasExtraPDF = (facturas, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Reporte de Facturas Extra', `Total de facturas: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Pagadas: ${stats.pagadas} | Pendientes: ${stats.pendientes} | Monto Total: $${stats.totalMonto?.toLocaleString('es-MX') || 0}`, 15, 40)

  // Tabla de facturas
  const tableData = facturas.map(factura => [
    factura.id,
    factura.numeroFactura || 'N/A',
    factura.proveedor || 'N/A',
    factura.concepto || 'N/A',
    `$${(factura.monto || 0).toLocaleString('es-MX')}`,
    new Date(factura.fechaEmision).toLocaleDateString('es-MX'),
    factura.estatus || 'N/A'
  ])

  autoTable(doc, {
    head: [['ID', 'No. Factura', 'Proveedor', 'Concepto', 'Monto', 'Fecha', 'Estatus']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 }
  })

  addFooter(doc)
  doc.save(`facturas_extra_${Date.now()}.pdf`)
}

// Exportar Histórico de Movimientos
export const exportHistoricoPDF = (movimientos, stats) => {
  const doc = new jsPDF(commonConfig)

  addHeader(doc, 'Histórico de Movimientos de Almacén', `Total de movimientos: ${stats.total}`)

  // Estadísticas
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(`Entradas: ${stats.entradas} | Salidas: ${stats.salidas} | Transferencias: ${stats.transferencias}`, 15, 40)

  // Tabla de movimientos
  const tableData = movimientos.map(mov => [
    mov.id,
    mov.tipo || 'N/A',
    mov.refaccion?.nombre || 'N/A',
    mov.cantidad > 0 ? `+${mov.cantidad}` : mov.cantidad,
    mov.almacenOrigen?.nombre || '-',
    mov.almacenDestino?.nombre || '-',
    mov.usuario?.nombre || 'N/A',
    new Date(mov.fechaMovimiento).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    mov.observaciones || '-'
  ])

  autoTable(doc, {
    head: [['ID', 'Tipo', 'Refacción', 'Cantidad', 'Origen', 'Destino', 'Usuario', 'Fecha', 'Observaciones']],
    body: tableData,
    startY: 45,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 18 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 },
      7: { cellWidth: 22 },
      8: { cellWidth: 40 }
    }
  })

  addFooter(doc)
  doc.save(`historico_movimientos_${Date.now()}.pdf`)
}

// Configuración de estilo
const COMPANY_COLOR = [30, 58, 138]; // Dark Blue
const ACCENT_COLOR = [59, 130, 246]; // Blue 500
const TEXT_COLOR = [30, 41, 59]; // Slate 800
const LIGHT_TEXT_COLOR = [100, 116, 139]; // Slate 500
const BG_COLOR = [248, 250, 252]; // Slate 50

const addProfessionalHeader = (doc, title, subtitle) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Background stripe
  doc.setFillColor(...COMPANY_COLOR);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Company Name
  doc.setFontSize(22);
  doc.setTextColor(...COMPANY_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('FMPMEX', 15, 20);

  // Title container
  doc.setFillColor(...BG_COLOR);
  doc.roundedRect(pageWidth - 95, 10, 80, 20, 3, 3, 'F');

  // Document Title
  doc.setFontSize(14);
  doc.setTextColor(...COMPANY_COLOR);
  doc.text(title.toUpperCase(), pageWidth - 55, 18, { align: 'center' });

  // Date
  doc.setFontSize(9);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  doc.text(`Generado: ${dateStr}`, pageWidth - 55, 25, { align: 'center' });

  // Separator line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(15, 35, pageWidth - 15, 35);
}

// Exportar Recibo de Nómina Operativa
// Exportar Recibo de Nómina Operativa
// ============================================================
// EXPORTAR RECIBO DE NÓMINA OPERATIVA
// ============================================================
export const exportNominaOperativaPDF = (
  nomina,
  operador,
  viajes = []
) => {
  const doc = new jsPDF(commonConfig);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ============================================================
  // DATOS GENERALES
  // ============================================================

  const operadorNombre =
    nomina.nombre ||
    operador?.nombre ||
    'Operador desconocido';

  const operadorAlias =
    nomina.alias ||
    operador?.alias ||
    '';

  // ============================================================
  // HELPERS
  // ============================================================

  const toNumber = (value) => {
    const numero = Number.parseFloat(value || 0);
    return Number.isNaN(numero) ? 0 : numero;
  };

  const money = (value) => {
    return `$${toNumber(value).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const safeDate = (value) => {
    if (!value) {
      return 'N/A';
    }

    try {
      // Evitamos desfases por zona horaria cuando viene YYYY-MM-DD
      if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
      ) {
        const [year, month, day] = value.split('-');

        return `${Number(day)}/${Number(month)}/${year}`;
      }

      const fecha = new Date(value);

      if (Number.isNaN(fecha.getTime())) {
        return 'N/A';
      }

      return fecha.toLocaleDateString('es-MX');
    } catch (error) {
      return 'N/A';
    }
  };

  // ============================================================
  // HEADER DE CADA PÁGINA
  // ============================================================

  const drawHeader = () => {
    addProfessionalHeader(
      doc,
      'Recibo de Nómina',
      'Operador'
    );
  };

  // ============================================================
  // FIRMAS
  // ============================================================

  const drawSignatures = (signY) => {
    doc.setDrawColor(...LIGHT_TEXT_COLOR);
    doc.setLineWidth(0.4);

    // Firma operador
    doc.line(
      40,
      signY,
      105,
      signY
    );

    // Firma autorizado
    doc.line(
      pageWidth - 105,
      signY,
      pageWidth - 40,
      signY
    );

    doc.setFontSize(7.2);
    doc.setTextColor(...LIGHT_TEXT_COLOR);
    doc.setFont('helvetica', 'normal');

    doc.text(
      operadorNombre.toUpperCase(),
      72.5,
      signY + 4,
      {
        align: 'center',
        maxWidth: 65
      }
    );

    doc.text(
      'FIRMA DE CONFORMIDAD',
      72.5,
      signY + 8,
      {
        align: 'center'
      }
    );

    doc.text(
      'AUTORIZADO POR',
      pageWidth - 72.5,
      signY + 4,
      {
        align: 'center'
      }
    );

    doc.text(
      'FMPMEX',
      pageWidth - 72.5,
      signY + 8,
      {
        align: 'center'
      }
    );
  };

  // ============================================================
  // HEADER
  // ============================================================

  drawHeader();

  // ============================================================
  // TARJETA SUPERIOR
  // OPERADOR / PERIODO / RESUMEN
  // ============================================================

  doc.setFillColor(...BG_COLOR);

  doc.roundedRect(
    15,
    39,
    pageWidth - 30,
    22,
    3,
    3,
    'F'
  );

  // ------------------------------------------------------------
  // OPERADOR
  // ------------------------------------------------------------

  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.setFont('helvetica', 'normal');

  doc.text(
    'OPERADOR',
    20,
    45.5
  );

  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');

  doc.text(
    operadorNombre,
    20,
    51.5,
    {
      maxWidth: 100
    }
  );

  if (operadorAlias) {
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT_TEXT_COLOR);
    doc.setFont('helvetica', 'normal');

    doc.text(
      `Alias: ${operadorAlias}`,
      20,
      57
    );
  }

  // ------------------------------------------------------------
  // PERIODO
  // ------------------------------------------------------------

  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.setFont('helvetica', 'normal');

  doc.text(
    'PERIODO',
    pageWidth / 2,
    45.5
  );

  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_COLOR);

  const periodoStr =
    `${safeDate(nomina.periodoInicio)} - ${safeDate(nomina.periodoFin)}`;

  doc.text(
    periodoStr,
    pageWidth / 2,
    51.5
  );

  if (nomina.cuenta) {
    doc.setFontSize(7.5);
    doc.setTextColor(...LIGHT_TEXT_COLOR);

    doc.text(
      `Cuenta: ${nomina.cuenta}`,
      pageWidth / 2,
      57
    );
  }

  // ------------------------------------------------------------
  // RESUMEN
  // ------------------------------------------------------------

  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT_COLOR);

  doc.text(
    'RESUMEN',
    pageWidth - 60,
    45.5
  );

  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_COLOR);

  doc.text(
    `Viajes: ${nomina.numeroViajes || viajes.length || 0}`,
    pageWidth - 60,
    51.5
  );

  // ============================================================
  // CÁLCULOS FINANCIEROS
  // ============================================================

  const sueldoBase =
    toNumber(nomina.sueldoBase);

  const comisionViajes =
    toNumber(nomina.comisionViajes);

  const bono =
    toNumber(nomina.bono);

  const compensacion =
    toNumber(nomina.compensacion);

  const descuentos =
    toNumber(nomina.descuentos);

  const totalNeto =
    sueldoBase +
    comisionViajes +
    bono +
    compensacion -
    descuentos;

  const conceptos = [
    [
      'Sueldo Base',
      money(sueldoBase)
    ],
    [
      'Comisión por Viajes',
      money(comisionViajes)
    ],
    [
      'Bonos',
      money(bono)
    ],
    [
      'Compensación',
      money(compensacion)
    ],
    [
      'Descuentos',
      `-${money(descuentos)}`
    ]
  ];

  // ============================================================
  // DESGLOSE DE CONCEPTOS
  // ============================================================

  const conceptosY = 67;

  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');

  doc.text(
    'Desglose de Conceptos',
    15,
    conceptosY - 2
  );

  autoTable(doc, {
    head: [
      [
        'Concepto',
        'Monto'
      ]
    ],

    body: conceptos,

    startY: conceptosY,

    theme: 'grid',

    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: TEXT_COLOR,
      overflow: 'linebreak',
      minCellHeight: 5.5
    },

    headStyles: {
      fillColor: COMPANY_COLOR,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 1.5,
      minCellHeight: 6
    },

    alternateRowStyles: {
      fillColor: BG_COLOR
    },

    margin: {
      left: 15,
      right: pageWidth - 150
    },

    tableWidth: 135,

    columnStyles: {
      0: {
        cellWidth: 85
      },

      1: {
        cellWidth: 45,
        halign: 'right',
        fontStyle: 'bold'
      }
    }
  });

  const conceptsFinalY =
    doc.lastAutoTable.finalY;

  // ============================================================
  // TOTAL NETO
  // ============================================================

  doc.setFillColor(...BG_COLOR);
  doc.setDrawColor(...COMPANY_COLOR);
  doc.setLineWidth(0.3);

  doc.roundedRect(
    pageWidth - 95,
    conceptosY,
    80,
    24,
    3,
    3,
    'FD'
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.setFont('helvetica', 'bold');

  doc.text(
    'TOTAL NETO A PAGAR',
    pageWidth - 55,
    conceptosY + 7.5,
    {
      align: 'center'
    }
  );

  doc.setFontSize(15);
  doc.setTextColor(...COMPANY_COLOR);

  doc.text(
    money(totalNeto),
    pageWidth - 55,
    conceptosY + 17.5,
    {
      align: 'center'
    }
  );

  // ============================================================
  // POSICIÓN PARA VIAJES
  // ============================================================

  let currentY =
    Math.max(
      conceptsFinalY,
      conceptosY + 24
    ) + 5;

  // ============================================================
  // DETALLE DE VIAJES
  // ============================================================

  if (
    Array.isArray(viajes) &&
    viajes.length > 0
  ) {
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont('helvetica', 'bold');

    doc.text(
      'Detalle de Viajes',
      15,
      currentY
    );

    // ----------------------------------------------------------
    // ARMAR DATOS
    // ----------------------------------------------------------

    const viajesData = viajes.map((v) => {
      const rutaObj =
        v.rutaComisiones ||
        (
          typeof v.ruta === 'object'
            ? v.ruta
            : null
        );

      const rutaTexto =
        typeof v.ruta === 'string'
          ? v.ruta
          : [
              rutaObj?.origen ||
                v.origen,

              rutaObj?.destino ||
                v.destino
            ]
              .filter(Boolean)
              .join(' - ') ||
            '-';

      // Buscamos la fecha con varios nombres posibles.
      // fechaSalida es la principal.
      const fechaViaje =
        v.fechaSalida ||
        v.fechaViaje ||
        v.fecha ||
        v.fechaLlegada ||
        null;

      return [
        v.folio ||
          v.viajeId ||
          v.id ||
          '-',

        safeDate(fechaViaje),

        rutaTexto,

        money(
          v.comision ??
          v.comisionOperador ??
          0
        )
      ];
    });

    // ----------------------------------------------------------
    // TAMAÑO DINÁMICO
    // ----------------------------------------------------------

    let viajesFontSize = 7.2;
    let viajesPadding = 1.2;

    if (viajes.length >= 7) {
      viajesFontSize = 6.8;
      viajesPadding = 1;
    }

    if (viajes.length >= 10) {
      viajesFontSize = 6.3;
      viajesPadding = 0.8;
    }

    // ----------------------------------------------------------
    // TABLA
    // ----------------------------------------------------------

    autoTable(doc, {
      head: [
        [
          'Folio',
          'Fecha',
          'Ruta',
          'Comisión'
        ]
      ],

      body: viajesData,

      startY: currentY + 2,

      theme: 'striped',

      styles: {
        fontSize: viajesFontSize,
        cellPadding: viajesPadding,
        textColor: TEXT_COLOR,
        overflow: 'linebreak',
        valign: 'middle',
        minCellHeight: 5
      },

      headStyles: {
        fillColor: [
          100,
          116,
          139
        ],

        textColor: 255,
        fontStyle: 'bold',
        fontSize: viajesFontSize,
        cellPadding: 1.2,
        minCellHeight: 5.5
      },

      alternateRowStyles: {
        fillColor: BG_COLOR
      },

      margin: {
        left: 15,
        right: 15,

        // No reservamos demasiado espacio.
        // Era una de las razones por las que
        // se mandaban viajes a otra hoja.
        bottom: 12
      },

      tableWidth:
        pageWidth - 30,

      columnStyles: {
        // Folio
        0: {
          cellWidth: 35
        },

        // Fecha
        1: {
          cellWidth: 28,
          halign: 'center'
        },

        // Ruta
        2: {
          cellWidth:
            pageWidth - 128
        },

        // Comisión
        3: {
          cellWidth: 35,
          halign: 'right',
          fontStyle: 'bold'
        }
      },

      rowPageBreak: 'avoid',

      didDrawPage: (data) => {
        // Si por tener muchos viajes se genera
        // otra hoja, ponemos header.
        if (data.pageNumber > 1) {
          drawHeader();
        }
      }
    });

    currentY =
      doc.lastAutoTable.finalY + 4;
  }

  // ============================================================
  // OBSERVACIONES
  // ============================================================

  if (nomina.observaciones) {
    const obsWidth =
      pageWidth - 36;

    doc.setFontSize(7.2);

    let obsLines =
      doc.splitTextToSize(
        String(nomina.observaciones),
        obsWidth
      );

    let obsHeight =
      Math.max(
        9,
        obsLines.length * 3.3 + 4
      );

    // ----------------------------------------------------------
    // ESPACIO REAL DISPONIBLE
    // ----------------------------------------------------------

    const signY =
      pageHeight - 27;

    const maxObsBottom =
      signY - 10;

    // ----------------------------------------------------------
    // SOLO ABRIR OTRA PÁGINA SI DE VERDAD NO CABE
    // ----------------------------------------------------------

    if (
      currentY + obsHeight >
      maxObsBottom
    ) {
      doc.addPage();

      drawHeader();

      currentY = 43;

      obsLines =
        doc.splitTextToSize(
          String(nomina.observaciones),
          obsWidth
        );

      obsHeight =
        Math.max(
          9,
          obsLines.length * 3.3 + 4
        );
    }

    // ----------------------------------------------------------
    // TÍTULO
    // ----------------------------------------------------------

    doc.setFontSize(7.5);
    doc.setTextColor(...COMPANY_COLOR);
    doc.setFont('helvetica', 'bold');

    doc.text(
      'OBSERVACIONES',
      15,
      currentY
    );

    // ----------------------------------------------------------
    // CAJA
    // ----------------------------------------------------------

    doc.setDrawColor(
      210,
      215,
      220
    );

    doc.setFillColor(
      252,
      252,
      252
    );

    doc.roundedRect(
      15,
      currentY + 2,
      pageWidth - 30,
      obsHeight,
      2,
      2,
      'FD'
    );

    // ----------------------------------------------------------
    // TEXTO
    // ----------------------------------------------------------

    doc.setFontSize(7.2);
    doc.setTextColor(...TEXT_COLOR);
    doc.setFont('helvetica', 'normal');

    doc.text(
      obsLines,
      18,
      currentY + 6.5
    );

    currentY +=
      obsHeight + 4;
  }

  // ============================================================
  // FIRMAS
  // ============================================================

  let finalSignY =
    doc.internal.pageSize.getHeight() - 27;

  // ------------------------------------------------------------
  // Protección:
  // Si el contenido realmente invade las firmas,
  // entonces sí creamos una página adicional.
  // ------------------------------------------------------------

  if (
    currentY >
    finalSignY - 8
  ) {
    doc.addPage();

    drawHeader();

    finalSignY =
      doc.internal.pageSize.getHeight() - 27;
  }

  drawSignatures(finalSignY);

  // ============================================================
  // FOOTER
  // ============================================================

  addFooter(doc);

  // ============================================================
  // GUARDAR
  // ============================================================

  const nombreArchivo =
    operadorNombre
      .replace(/\s+/g, '_')
      .replace(/[^\wÁÉÍÓÚÑáéíóúñ_-]/g, '');

  doc.save(
    `Nomina_${nombreArchivo}_${Date.now()}.pdf`
  );
};

// Exportar Recibo de Nómina Fija
export const exportNominaFijaPDF = (nomina) => {
  const doc = new jsPDF(commonConfig);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  addProfessionalHeader(doc, 'Recibo de Nómina', 'Personal Administrativo');

  // Info Card
  doc.setFillColor(...BG_COLOR);
  doc.roundedRect(15, 40, pageWidth - 30, 25, 3, 3, 'F');

  // Column 1: Info
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.text('COLABORADOR', 20, 48);

  doc.setFontSize(12);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text(nomina.nombre, 20, 55);

  if (nomina.alias) {
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT_TEXT_COLOR);
    doc.setFont('helvetica', 'normal');
    doc.text(`Alias: ${nomina.alias}`, 20, 60);
  }

  // Column 2: Details
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.text('PERIODO', pageWidth / 2, 48);

  doc.setFontSize(11);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'medium');
  const periodoStr = `${new Date(nomina.periodoInicio).toLocaleDateString('es-MX')} - ${new Date(nomina.periodoFin).toLocaleDateString('es-MX')}`;
  doc.text(periodoStr, pageWidth / 2, 55);

  if (nomina.cuenta) {
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT_TEXT_COLOR);
    doc.text(`Cuenta: ${nomina.cuenta}`, pageWidth / 2, 60);
  }

  // Financial Details
  const startY = 75;
  const totalNeto = (
    parseFloat(nomina.gananciaBase || 0) +
    parseFloat(nomina.extra || 0) -
    parseFloat(nomina.deben || 0)
  );

  const conceptos = [
    ['Ganancia Base', `$${(nomina.gananciaBase || 0).toLocaleString('es-MX')}`],
    ['Extra / Bonificaciones', `$${(nomina.extra || 0).toLocaleString('es-MX')}`],
    ['Deben (Retención/Deuda)', `-$${(nomina.deben || 0).toLocaleString('es-MX')}`]
  ];

  doc.text('Detalle de Movimientos', 15, startY - 2);

  autoTable(doc, {
    head: [['Concepto', 'Monto']],
    body: conceptos,
    startY: startY,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5, textColor: TEXT_COLOR },
    headStyles: { fillColor: COMPANY_COLOR, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: BG_COLOR },
    margin: { left: 15, right: 15 },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 60 }
    }
  });

  const finalYTable = doc.lastAutoTable.finalY + 10;

  // Total Box
  doc.setDrawColor(...COMPANY_COLOR);
  doc.setLineWidth(0.5);

  doc.setFillColor(...BG_COLOR);
  doc.roundedRect(pageWidth - 95, finalYTable, 80, 20, 2, 2, 'F');

  doc.setFontSize(12);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR', pageWidth - 85, finalYTable + 8);

  doc.setFontSize(16);
  doc.setTextColor(...COMPANY_COLOR);
  doc.text(`$${totalNeto.toLocaleString('es-MX')}`, pageWidth - 25, finalYTable + 15, { align: 'right' });


  // Observaciones Area
  // Observaciones Area
const pageHeight = doc.internal.pageSize.getHeight();

let obsY = finalYTable + 35;

// Calculamos alto dinámico de observaciones
let splitText = [];
let obsBoxHeight = 0;

if (nomina.observaciones) {
  splitText = doc.splitTextToSize(nomina.observaciones, pageWidth - 40);
  obsBoxHeight = Math.max(18, splitText.length * 5 + 10);

  // Si ya no cabe observaciones + firmas + footer, agregamos nueva página
  if (obsY + obsBoxHeight + 45 > pageHeight - 20) {
    doc.addPage();
    addProfessionalHeader(doc, 'Recibo de Nómina', 'Personal Administrativo');
    obsY = 45;
  }

  doc.setFontSize(9);
  doc.setTextColor(...COMPANY_COLOR);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES', 15, obsY);

  doc.setDrawColor(200, 200, 200);
  doc.rect(15, obsY + 3, pageWidth - 30, obsBoxHeight);

  doc.setFontSize(9);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont('helvetica', 'normal');
  doc.text(splitText, 18, obsY + 9);
}

// Signatures
let signY = nomina.observaciones
  ? obsY + obsBoxHeight + 35
  : finalYTable + 45;

// Si las firmas ya no caben, agregamos nueva página
if (signY + 20 > pageHeight - 15) {
  doc.addPage();
  addProfessionalHeader(doc, 'Recibo de Nómina', 'Personal Administrativo');
  signY = 65;
}

  doc.setDrawColor(...LIGHT_TEXT_COLOR);
  doc.setLineWidth(0.5);

  doc.line(50, signY, 110, signY);
  doc.line(pageWidth - 110, signY, pageWidth - 50, signY);

  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_TEXT_COLOR);
  doc.text(nomina.nombre.toUpperCase(), 80, signY + 5, { align: 'center' });
  doc.text('FIRMA DE RECIBIDO', 80, signY + 10, { align: 'center' });

  doc.text('AUTORIZADO POR', pageWidth - 80, signY + 5, { align: 'center' });
  doc.text('FMPMEX', pageWidth - 80, signY + 10, { align: 'center' });

  addFooter(doc);
  doc.save(`NominaFija_${nomina.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
