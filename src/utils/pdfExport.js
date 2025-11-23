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
  const tableData = viajes.map(viaje => [
    viaje.id,
    viaje.folio || 'N/A',
    viaje.cliente?.nombre || 'N/A',
    viaje.origen || 'N/A',
    viaje.destino || 'N/A',
    viaje.operador?.nombre || 'N/A',
    viaje.unidad?.placas || 'N/A',
    new Date(viaje.fechaSalida).toLocaleDateString('es-MX'),
    viaje.estatus || 'N/A'
  ])
  
  autoTable(doc, {
    head: [['ID', 'Folio', 'Cliente', 'Origen', 'Destino', 'Operador', 'Unidad', 'Fecha', 'Estatus']],
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
