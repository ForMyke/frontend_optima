'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Truck,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  User,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Filter,
  Camera,
  Upload,
  X,
  FileDown,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { viajesService } from '@/app/services/viajesService'
import { operadoresService } from '@/app/services/operadoresService'
import { clientsService } from '@/app/services/clientsService'
import { exportViajesPDF } from '@/utils/pdfExport'
import { unidadesService } from '@/app/services/unidadesService'
import { authService } from '@/app/services/authService'
import { StatCard, ViajeCard, CreateViajeModal, EditViajeModal, ViewViajeModal, ConfirmDeleteModal } from './components'
import Image from 'next/image'

const ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  EN_CURSO: { label: 'En curso', color: 'bg-blue-100 text-blue-800', icon: Navigation },
  COMPLETADO: { label: 'Completado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FINALIZADO: { label: 'Finalizado', color: 'bg-teal-100 text-teal-800', icon: CheckCircle },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  RECHAZADO: { label: 'Rechazado', color: 'bg-orange-100 text-orange-800', icon: XCircle }
}

const TIPOS_VIAJE = {
  LOCAL: { label: 'Local', color: 'bg-purple-100 text-purple-800' },
  FORANEO: { label: 'Foráneo', color: 'bg-indigo-100 text-indigo-800' },
  INTERNACIONAL: { label: 'Internacional', color: 'bg-pink-100 text-pink-800' }
}

const getMonthName = (monthIndex) => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthIndex];
}

const getWeekTabs = (date) => {
  const tabs = [];
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  // Rule: If currently in first week (day <= 7), include last week of previous month
  if (day <= 7) {
    const prevMonthDate = new Date(year, month - 1, 1);
    const pmYear = prevMonthDate.getFullYear();
    const pmMonth = prevMonthDate.getMonth();
    const daysInPrevMonth = new Date(year, month, 0).getDate(); // last day of prev month

    const startDay = 22;
    const endDay = daysInPrevMonth;

    tabs.push({
      id: `prev-last`,
      label: `Semana 4 ${getMonthName(pmMonth)} (${startDay}-${endDay})`,
      start: new Date(pmYear, pmMonth, startDay),
      end: new Date(pmYear, pmMonth, endDay, 23, 59, 59)
    });
  }

  // Current Month Weeks
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Week 1
  tabs.push({
    id: `curr-1`,
    label: `Semana 1 ${getMonthName(month)} (1-7)`,
    start: new Date(year, month, 1),
    end: new Date(year, month, 7, 23, 59, 59)
  });

  // Week 2
  tabs.push({
    id: `curr-2`,
    label: `Semana 2 ${getMonthName(month)} (8-14)`,
    start: new Date(year, month, 8),
    end: new Date(year, month, 14, 23, 59, 59)
  });

  // Week 3
  tabs.push({
    id: `curr-3`,
    label: `Semana 3 ${getMonthName(month)} (15-21)`,
    start: new Date(year, month, 15),
    end: new Date(year, month, 21, 23, 59, 59)
  });

  // Week 4 (22-End)
  tabs.push({
    id: `curr-4`,
    label: `Semana 4 ${getMonthName(month)} (22-${daysInMonth})`,
    start: new Date(year, month, 22),
    end: new Date(year, month, daysInMonth, 23, 59, 59)
  });

  return tabs;
}

const getMonthTabs = (date) => {
  const tabs = [];
  // Last 3 months: Current, Current-1, Current-2
  for (let i = 0; i < 3; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    tabs.unshift({
      id: `month-${i}`,
      label: `${getMonthName(month)} ${year}`,
      start: new Date(year, month, 1),
      end: new Date(year, month, daysInMonth, 23, 59, 59)
    });
  }
  return tabs;
}



const EvidenciaModal = ({ isOpen, onClose, onSave, viaje, nuevoEstado, setViajes }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [comentarios, setComentarios] = useState('')
  const [fechaRealLlegada, setFechaRealLlegada] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Limpiar preview cuando se cierre el modal
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Determinar requerimientos según el estado
  // COMPLETADO: evidencia OPCIONAL, sin fecha requerida
  // RECHAZADO: evidencia OBLIGATORIA + fecha real de llegada
  // FINALIZADO: se elimina del flujo
  const requiereEvidencia = ['RECHAZADO'].includes(nuevoEstado)
  const requiereFecha = ['RECHAZADO'].includes(nuevoEstado)
  const evidenciaOpcional = ['COMPLETADO'].includes(nuevoEstado)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipos de archivo permitidos (imágenes y documentos)
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/plain', // .txt
        'text/csv'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error('Formato no permitido. Puedes subir imágenes (JPG, PNG, GIF, WEBP), PDF, Word (DOC, DOCX), Excel (XLS, XLSX), TXT o CSV')
        return
      }

      // Validar tamaño (máximo 1MB)
      const maxSize = 1 * 1024 * 1024 // 1MB
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)

      if (file.size > maxSize) {
        toast.error(
          `Archivo muy pesado (${sizeMB}MB)\n\nEl tamaño máximo permitido es 1MB.\nPor favor reduce el tamaño del archivo antes de subirlo.`,
          { duration: 5000 }
        )
        // Limpiar el input
        if (e.target) {
          e.target.value = ''
        }
        return
      }

      setSelectedFile(file)

      // Crear preview solo para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        // Para documentos, no crear preview de imagen
        setPreviewUrl(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const sizeMB = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 'N/A'

    // Validación de evidencia requerida (solo para RECHAZADO)
    if (requiereEvidencia && !selectedFile) {
      toast.error('⚠️ Se requiere archivo de evidencia para este estado')
      return
    }

    // Para COMPLETADO la evidencia es opcional - no validamos

    // Validación de fecha requerida (solo para RECHAZADO que la pide manual)
    if (requiereFecha && !fechaRealLlegada) {
      toast.error('⚠️ Se requiere la fecha real de llegada')
      return
    }

    // Calcular fecha automática para COMPLETADO (escondida al usuario)
    let fechaFinal = fechaRealLlegada
    if (nuevoEstado === 'COMPLETADO') {
      // Usar fecha de hoy en formato YYYY-MM-DD
      fechaFinal = new Date().toISOString().split('T')[0]
    }

    // Validación ESTRICTA de tamaño antes de enviar (1MB máximo)
    if (selectedFile) {
      const maxSize = 1 * 1024 * 1024 // 1MB
      if (selectedFile.size > maxSize) {
        toast.error(
          `El archivo (${sizeMB}MB) supera el límite de 1MB.\n\nPor favor reduce el tamaño del archivo antes de continuar.`,
          { duration: 5000 }
        )
        return
      }
    }

    setUploading(true)
    const loadingToast = toast.loading('Procesando cambio de estado...')

    try {

      await viajesService.cambiarEstado(viaje.id, nuevoEstado, selectedFile, fechaFinal || null)

      const estadoTexto = {
        'PENDIENTE': 'pendiente',
        'EN_CURSO': 'en curso',
        'EN_PROCESO': 'en proceso',
        'COMPLETADO': 'completado',
        'FINALIZADO': 'finalizado',
        'CANCELADO': 'cancelado',
        'RECHAZADO': 'rechazado'
      }[nuevoEstado] || nuevoEstado.toLowerCase()

      toast.success(`Viaje cambiado a ${estadoTexto} exitosamente`)

      // Actualizar el estado del viaje localmente sin recargar toda la lista
      setViajes(prevViajes =>
        prevViajes.map(v =>
          v.id === viaje.id
            ? { ...v, estado: nuevoEstado }
            : v
        )
      )

      handleClose()

      // Notificar que se completó (solo para cerrar el modal)
      if (onSave) {
        await onSave()
      }
    } catch (error) {
      // Determinar el mensaje de error apropiado
      let errorMessage = 'Error al cambiar el estado del viaje'

      if (error.response?.status === 403) {
        errorMessage = '🚫 Acceso denegado. El archivo supera el límite permitido por el servidor (1MB máximo).'
      } else if (error.response?.status === 413) {
        errorMessage = '🚫 El archivo es demasiado grande. El servidor solo acepta archivos de hasta 1MB.'
      } else if (error.message?.includes('size') || error.message?.includes('tamaño') || error.message?.includes('large') || error.message?.includes('pesada')) {
        errorMessage = `⚠️ ${error.message}\n\nPor favor reduce el tamaño del archivo antes de subirlo.`
      } else if (error.message?.includes('timeout')) {
        errorMessage = '⏱️ La carga tardó demasiado. Intenta con un archivo más pequeño.'
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage, { duration: 6000 })
    } finally {
      toast.dismiss(loadingToast)
      setUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setComentarios('')
    setFechaRealLlegada('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  const estadoInfo = ESTADOS[nuevoEstado] || ESTADOS.PENDIENTE
  const EstadoIcon = estadoInfo.icon

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {requiereEvidencia ? 'Subir archivo de evidencia' : evidenciaOpcional ? 'Completar viaje (evidencia opcional)' : 'Confirmar cambio de estado'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Viaje #{viaje?.id} - Cambio a estado:
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                  <EstadoIcon className="h-3 w-3 mr-1" />
                  {estadoInfo.label}
                </span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Área de carga de imagen - Obligatorio para RECHAZADO, opcional para COMPLETADO */}
          {(requiereEvidencia || evidenciaOpcional) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Archivo de evidencia {requiereEvidencia ? '*' : '(opcional)'}
              </label>

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-1">Click para seleccionar un archivo</p>
                  <p className="text-sm text-slate-500">Imágenes, PDF, Word, Excel, TXT o CSV (máx. 1MB)</p>
                  <p className="text-xs text-amber-600 mt-2">Archivos mayores a 1MB serán rechazados</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Preview para imágenes */}
                  {previewUrl ? (
                    <Image
                      height={64}
                      width={64}
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-slate-200"
                    />
                  ) : (
                    /* Mostrar icono de documento para archivos no-imagen */
                    <div className="w-full h-64 flex items-center justify-center bg-slate-100 rounded-xl border-2 border-slate-200">
                      <div className="text-center">
                        <FileText className="h-20 w-20 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {selectedFile.type === 'application/pdf' && 'Documento PDF'}
                          {selectedFile.type.includes('word') && 'Documento Word'}
                          {selectedFile.type.includes('excel') && 'Hoja de cálculo Excel'}
                          {selectedFile.type.includes('text') && 'Archivo de texto'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Información del archivo */}
                  <div className="absolute top-2 left-2  bg-opacity-75 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    {selectedFile && (
                      <>
                        <span className="block truncate max-w-xs">{selectedFile.name}</span>
                        <span className="block text-green-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)}MB / 1MB
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Cambiar archivo</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Campo de Fecha Real de Llegada - Solo si requiere fecha */}
          {requiereFecha && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha Real de Llegada *
              </label>
              <input
                type="date"
                value={fechaRealLlegada}
                onChange={(e) => setFechaRealLlegada(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Indica la fecha real de llegada del viaje
              </p>
            </div>
          )}

          {/* Información del viaje */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Información del viaje</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Origen:</span>
                <span className="ml-2 font-medium text-slate-900">{viaje?.origen}</span>
              </div>
              <div>
                <span className="text-slate-500">Destino:</span>
                <span className="ml-2 font-medium text-slate-900">{viaje?.destino}</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || (requiereEvidencia && !selectedFile) || (requiereFecha && !fechaRealLlegada)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  {requiereEvidencia ? (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Subir evidencia</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Cambiar estado</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ViajesPage = () => {
  const [viajes, setViajes] = useState([])
  const [operadores, setOperadores] = useState([])
  const [clientes, setClientes] = useState([])
  const [unidades, setUnidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('TODOS')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false)
  const [selectedViaje, setSelectedViaje] = useState(null)
  const [viajeToDelete, setViajeToDelete] = useState(null)
  const [nuevoEstado, setNuevoEstado] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    enCurso: 0,
    completados: 0
  })

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  // Nuevos estados para filtros de tiempo
  const [viewMode, setViewMode] = useState('week') // 'week' | 'month'
  const [timeTabs, setTimeTabs] = useState([])
  const [activeTabId, setActiveTabId] = useState(null)

  useEffect(() => {
    const now = new Date()
    let tabs = []

    if (viewMode === 'week') {
      tabs = getWeekTabs(now)
    } else {
      tabs = getMonthTabs(now)
    }

    setTimeTabs(tabs)

    // Seleccionar automáticamente la pestaña actual
    // Para semana: buscar la que incluye el día actual
    // Para mes: buscar el mes actual
    // Si no se encuentra (ej. estamos en semana 1 pero mostramos semana 4 del mes anterior), seleccionar la última o más relevante

    const currentTab = tabs.find(tab =>
      now >= tab.start && now <= tab.end
    )

    if (currentTab) {
      setActiveTabId(currentTab.id)
    } else {
      // Default to the last available tab (current time) or first?
      // Usually the user wants to see "Today". 
      // If today is Feb 1st, getWeekTabs returns [PrevLast, Curr1, Curr2...]
      // Curr1 is 1-7 Feb. So it matches.
      // If for some reason no match, pick the one closest to now? 
      // Or just the first one?
      // Let's pick the last one in the list if no match found, logic usually implies sequential.
      if (tabs.length > 0) setActiveTabId(tabs[tabs.length - 1].id)
    }

  }, [viewMode])

  // No dependencias de activeTabId en el efecto para evitar recargas constantes,
  // ya que filtraremos en cliente.
  // Pero si el usuario cambia algo que requiera recarga (como crear), llamamos loadViajes.

  const loadViajes = async () => {
    try {
      setLoading(true)

      // Cargar una gran cantidad de viajes para permitir filtrado y paginación en cliente
      // Esto soluciona que el paginador respete los filtros de fecha (semana/mes)
      const response = await viajesService.getViajes(0, 2000)
      const viajesData = response.content || []

      // Ordenar los viajes por ID de forma descendente (más recientes primero)
      const viajesOrdenados = [...viajesData].sort((a, b) => b.id - a.id)

      setViajes(viajesOrdenados)
      // No seteamos estadísticas aquí porque dependen del filtro

    } catch (error) {
      console.error('Error loading viajes:', error)
      toast.error('Error al cargar viajes')
    } finally {
      setLoading(false)
    }
  }

  const loadOperadores = async () => {
    try {
      const response = await operadoresService.getOperadores(0, 100)
      setOperadores(response.content || [])
    } catch (error) {
    }
  }

  const loadClientes = async () => {
    try {
      const response = await clientsService.getClients(0, 100)
      setClientes(response.content || [])
    } catch (error) {
    }
  }

  const loadUnidades = async () => {
    try {
      // Cargar todas las unidades con un límite alto para asegurar que se carguen todas
      const response = await unidadesService.getAll({ page: 0, size: 1000 })
      const data = Array.isArray(response) ? response : (response.content || response.data || [])
      setUnidades(data)
    } catch (error) {
      setUnidades([])
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        await Promise.all([
          loadViajes(),
          loadOperadores(),
          loadClientes(),
          loadUnidades()
        ])
      } catch (error) {
        toast.error('Error al cargar datos iniciales')
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, []) // Sin dependencias - solo carga una vez al montar

  const handleCreateViaje = async (viajeData, archivo) => {
    try {
      await viajesService.createViaje(viajeData, archivo)
      toast.success('Viaje creado exitosamente')
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al crear viaje')
      throw error
    }
  }

  const handleEditViaje = async (viaje) => {
    try {
      const fullViaje = await viajesService.getViajeById(viaje.id)
      setSelectedViaje(fullViaje)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Error al cargar información del viaje')
    }
  }

  const handleUpdateViaje = async (viajeId, viajeData, archivo) => {
    try {
      await viajesService.updateViaje(viajeId, viajeData, archivo)
      toast.success('Viaje actualizado exitosamente')
      setShowEditModal(false)
      setSelectedViaje(null)
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar viaje')
      throw error
    }
  }

  const handleDeleteViaje = async (viaje) => {
    setViajeToDelete(viaje)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!viajeToDelete) return

    try {
      await viajesService.deleteViaje(viajeToDelete.id)
      toast.success(`Viaje #${viajeToDelete.id} eliminado`)
      setShowDeleteModal(false)
      setViajeToDelete(null)
      loadViajes()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar viaje')
    }
  }

  const handleViewDetails = async (viaje) => {
    try {
      const fullViaje = await viajesService.getViajeById(viaje.id)

      // Si la API individual solo retorna IDs, buscar la información completa
      let viajeCompleto = { ...fullViaje }

      // Buscar operador si solo tenemos el ID
      if (fullViaje.idOperador && !fullViaje.operador) {
        const operadorEncontrado = operadores.find(op => op.id === fullViaje.idOperador)
        if (operadorEncontrado) {
          viajeCompleto.operador = operadorEncontrado
        }
      }

      // Buscar cliente si solo tenemos el ID
      if (fullViaje.idCliente && !fullViaje.cliente) {
        const clienteEncontrado = clientes.find(cl => cl.id === fullViaje.idCliente)
        if (clienteEncontrado) {
          viajeCompleto.cliente = clienteEncontrado
        }
      }

      // Buscar unidad si solo tenemos el ID
      if (fullViaje.idUnidad && !fullViaje.unidad) {
        const unidadEncontrada = unidades.find(un => un.id === fullViaje.idUnidad)
        if (unidadEncontrada) {
          viajeCompleto.unidad = unidadEncontrada
        }
      }

      setSelectedViaje(viajeCompleto)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del viaje')
    }
  }

  const handleEstadoChange = async (viaje, nuevoEstado) => {
    // Abrir modal para COMPLETADO (evidencia opcional) y RECHAZADO (evidencia obligatoria)
    // FINALIZADO ya no se usa en el flujo
    if (['COMPLETADO', 'RECHAZADO'].includes(nuevoEstado)) {
      setSelectedViaje(viaje)
      setNuevoEstado(nuevoEstado)
      setShowEvidenciaModal(true)
    } else {
      // Para otros estados, cambiar directamente sin modal
      try {
        await viajesService.cambiarEstado(viaje.id, nuevoEstado, null)

        const estadoTexto = {
          'PENDIENTE': 'pendiente',
          'EN_CURSO': 'en curso',
          'CANCELADO': 'cancelado'
        }[nuevoEstado] || nuevoEstado.toLowerCase()

        toast.success(`Viaje cambiado a ${estadoTexto} exitosamente`)

        // Actualizar estado localmente
        setViajes(prevViajes =>
          prevViajes.map(v =>
            v.id === viaje.id
              ? { ...v, estado: nuevoEstado }
              : v
          )
        )
      } catch (error) {
        toast.error(error.message || 'Error al cambiar el estado del viaje')
      }
    }
  }

  const handleSaveEvidencia = async () => {
    try {
      // El modal ya cambió el estado, solo cerramos sin recargar
      setShowEvidenciaModal(false)
      setSelectedViaje(null)
      setNuevoEstado(null)
    } catch (error) {
    }
  }

  const filteredViajes = viajes.filter(viaje => {
    // Filtrar por estado
    const matchesEstado = estadoFilter === 'TODOS' || viaje.estado === estadoFilter

    // Obtener origen y destino
    const origen = viaje.ruta?.origen || viaje.origen || ''
    const destino = viaje.ruta?.destino || viaje.destino || ''

    // Filtrar por búsqueda
    const matchesSearch = !searchTerm ||
      origen.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      destino.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.operador?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.operador?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.cliente?.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.cliente?.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.unidad?.numeroEconomico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.unidad?.placas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.unidad?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.unidad?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viaje.id?.toString().includes(searchTerm) ||
      viaje.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof viaje.ruta === 'string' && viaje.ruta.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtrar por Fecha/Pestaña seleccionada
    let matchesTime = true
    if (activeTabId && timeTabs.length > 0) {
      const activeTab = timeTabs.find(t => t.id === activeTabId)
      if (activeTab) {
        // Asumiendo formato YYYY-MM-DD
        if (viaje.fechaSalida) {
          // Ajustar zona horaria local para comparación correcta
          const viajeDate = new Date(viaje.fechaSalida + 'T12:00:00') // Mediodía para evitar problemas de zona horaria
          // Comparar solo fechas ignorando horas exactas si es necesario, pero activeTab.start/end ya cubre rango completo
          matchesTime = viajeDate >= activeTab.start && viajeDate <= activeTab.end
        } else {
          // Si no tiene fecha, ¿lo mostramos? Probablemente no si estamos filtrando por tiempo.
          matchesTime = false
        }
      }
    }

    return matchesEstado && matchesSearch && matchesTime
  })

  // Calcular estadísticas basadas en lo filtrado
  useEffect(() => {
    const pendientes = filteredViajes.filter(v => v.estado === 'PENDIENTE').length
    const enCurso = filteredViajes.filter(v => v.estado === 'EN_CURSO').length
    const completados = filteredViajes.filter(v => v.estado === 'COMPLETADO').length

    setStats({
      total: filteredViajes.length,
      pendientes,
      enCurso,
      completados
    })

    // Resetear a página 0 cuando cambian los filtros
    setCurrentPage(0)
    // Calcular total de páginas
    setTotalPages(Math.ceil(filteredViajes.length / pageSize))
  }, [viajes, estadoFilter, searchTerm, activeTabId, pageSize]) // Dependencias que afectan el filtrado

  // Paginación en cliente
  const paginatedViajes = filteredViajes.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestión de viajes</h1>
            <p className="text-slate-600 mt-2">Administra los viajes y rutas de transporte</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => exportViajesPDF(filteredViajes, stats)}
              className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <FileDown className="h-5 w-5" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex cursor-pointer items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo viaje</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de viajes"
          value={stats.total}
          icon={Truck}
          color="bg-blue-600"
          description="En periodo seleccionado"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-yellow-600"
          description="Por iniciar"
        />
        <StatCard
          title="En curso"
          value={stats.enCurso}
          icon={Navigation}
          color="bg-indigo-600"
          description="En tránsito"
        />
        <StatCard
          title="Completados"
          value={stats.completados}
          icon={CheckCircle}
          color="bg-green-600"
          description="Finalizados"
        />
      </div>

      {/* Time Filter Switch & Tabs */}
      <div className="mb-0 bg-white rounded-t-xl border border-b-0 border-slate-200 shadow-sm mx-1">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            Periodo de visualización
          </h3>
          {/* Switch Semanal/Mensual */}
          <div className="flex bg-slate-200/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'week'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'month'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Browser-like Tabs */}
        <div className="flex items-end px-2 pt-2 bg-slate-100/50 border-b border-slate-200 overflow-x-auto scrollbar-hide">
          {timeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`relative px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap -mb-px border-t border-x ${activeTabId === tab.id
                ? 'bg-white text-gray-500 border-slate-200 z-10 font-semibold'
                : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200/80 hover:text-slate-700'
                }`}
            >
              <div className={`flex items-center gap-2 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-70'}`}>
                {activeTabId === tab.id && <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>}
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters (merged visually with tabs) */}
      <div className="bg-white rounded-b-xl rounded-t-none shadow-sm border border-t-0 border-slate-200 p-6 mb-6 mx-1 mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por origen, destino, operador, cliente, unidad, folio, tipo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="EN_CURSO">En curso</option>
              <option value="COMPLETADO">Completados</option>
              <option value="RECHAZADO">Rechazados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Viajes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedViajes.map((viaje) => (
          <ViajeCard
            key={viaje.id}
            viaje={viaje}
            onEdit={handleEditViaje}
            onDelete={handleDeleteViaje}
            onViewDetails={handleViewDetails}
            operadores={operadores}
            onEstadoChange={handleEstadoChange}
            clientes={clientes}
            unidades={unidades}
          />
        ))}
      </div>

      {paginatedViajes.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No se encontraron viajes en este periodo</p>
        </div>
      )}

      {/* Pagination */}
      {filteredViajes.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-500">
            Página <span className="font-medium text-slate-900">{currentPage + 1}</span> de{' '}
            <span className="font-medium text-slate-900">{totalPages || 1}</span>
            <span className="ml-2 text-slate-400">(Total: {filteredViajes.length} viajes)</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              className="flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateViajeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateViaje}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <EditViajeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedViaje(null)
        }}
        onSave={handleUpdateViaje}
        viaje={selectedViaje}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
        onEstadoChange={(viaje, estado) => {
          // Cerrar el modal de edición
          setShowEditModal(false)
          // Abrir el modal de evidencia con el nuevo estado
          setSelectedViaje(viaje)
          setNuevoEstado(estado)
          setShowEvidenciaModal(true)
        }}
      />

      <ViewViajeModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedViaje(null)
        }}
        viaje={selectedViaje}
        operadores={operadores}
        clientes={clientes}
        unidades={unidades}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setViajeToDelete(null)
        }}
        onConfirm={confirmDelete}
        viaje={viajeToDelete}
      />

      <EvidenciaModal
        isOpen={showEvidenciaModal}
        onClose={() => {
          setShowEvidenciaModal(false)
          setSelectedViaje(null)
          setNuevoEstado(null)
        }}
        onSave={handleSaveEvidencia}
        viaje={selectedViaje}
        nuevoEstado={nuevoEstado}
        setViajes={setViajes}
      />
    </div>
  )
}

export default ViajesPage;