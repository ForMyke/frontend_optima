'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, DollarSign, Users, TrendingUp, Wallet, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import nominaFijaService from '@/app/services/nominaFijaService'
import {
    StatCard,
    NominaFijaCard,
    CreateNominaFijaModal,
    EditNominaFijaModal,
    ViewNominaFijaModal,
    ConfirmDeleteModal
} from './components'

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

export default function NominaFijaPage() {
    const [nominas, setNominas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [periodoFilter, setPeriodoFilter] = useState('')
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState('')
    const [fechaFinFiltro, setFechaFinFiltro] = useState('')

    // Date Tabs State
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

        const currentTab = tabs.find(tab =>
            now >= tab.start && now <= tab.end
        )

        if (currentTab) {
            setActiveTabId(currentTab.id)
        } else {
            if (tabs.length > 0) setActiveTabId(tabs[tabs.length - 1].id)
        }
    }, [viewMode])

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedNomina, setSelectedNomina] = useState(null)

    useEffect(() => {
        loadNominas()
    }, [])

    const loadNominas = async () => {
        try {
            setLoading(true)
            const response = await nominaFijaService.getNominasFijas(0, 1000)
            const data = response.content || response || []
            setNominas(data)
        } catch (error) {
            console.error('Error loading nominas:', error)
            toast.error('Error al cargar nóminas fijas')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNomina = async (nominaData) => {
        try {
            await nominaFijaService.createNominaFija(nominaData)
            toast.success('Nómina fija creada exitosamente')
            setShowCreateModal(false)
            loadNominas()
        } catch (error) {
            toast.error(error.message || 'Error al crear nómina fija')
            throw error
        }
    }

    const handleEditNomina = (nomina) => {
        setSelectedNomina(nomina)
        setShowEditModal(true)
    }

    const handleUpdateNomina = async (nominaId, nominaData) => {
        try {
            await nominaFijaService.updateNominaFija(nominaId, nominaData)
            toast.success('Nómina fija actualizada exitosamente')
            setShowEditModal(false)
            setSelectedNomina(null)
            loadNominas()
        } catch (error) {
            toast.error(error.message || 'Error al actualizar nómina fija')
            throw error
        }
    }

    const handleViewNomina = (nomina) => {
        setSelectedNomina(nomina)
        setShowViewModal(true)
    }

    const handleDeleteNomina = (nomina) => {
        setSelectedNomina(nomina)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async (nominaId) => {
        try {
            await nominaFijaService.deleteNominaFija(nominaId)
            toast.success('Nómina fija eliminada exitosamente')
            setShowDeleteModal(false)
            setSelectedNomina(null)
            loadNominas()
        } catch (error) {
            toast.error(error.message || 'Error al eliminar nómina fija')
        }
    }

    // Calcular estadísticas
    const stats = {
        total: nominas.length,
        personas: new Set(nominas.map(n => n.nombre)).size,
        totalPagado: nominas.reduce((sum, n) => {
            const total = (
                parseFloat(n.gananciaBase || 0) +
                parseFloat(n.extra || 0) -
                parseFloat(n.deben || 0)
            )
            return sum + total
        }, 0),
        totalExtras: nominas.reduce((sum, n) => sum + parseFloat(n.extra || 0), 0),
        promedioPorNomina: nominas.length > 0
            ? nominas.reduce((sum, n) => {
                const total = (
                    parseFloat(n.gananciaBase || 0) +
                    parseFloat(n.extra || 0) -
                    parseFloat(n.deben || 0)
                )
                return sum + total
            }, 0) / nominas.length
            : 0
    }

    // Filtrar nóminas
    const filteredNominas = nominas.filter(nomina => {
        // Búsqueda global
        const matchesSearch = searchTerm === '' ||
            nomina.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nomina.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nomina.id?.toString().includes(searchTerm) ||
            nomina.observaciones?.toLowerCase().includes(searchTerm.toLowerCase())


        // Filtro de periodo (mes/año) - Legacy
        const matchesPeriodo = periodoFilter === '' ||
            nomina.periodoInicio?.startsWith(periodoFilter)

            let matchesTime = true

            if (nomina.periodoInicio || nomina.periodoFin) {
                const inicioNomina = nomina.periodoInicio
                    ? new Date(nomina.periodoInicio + 'T12:00:00')
                    : null

                const finNomina = nomina.periodoFin
                    ? new Date(nomina.periodoFin + 'T12:00:00')
                    : inicioNomina

                if (fechaInicioFiltro || fechaFinFiltro) {
                    const inicioFiltro = fechaInicioFiltro
                        ? new Date(fechaInicioFiltro + 'T00:00:00')
                        : null

                    const finFiltro = fechaFinFiltro
                        ? new Date(fechaFinFiltro + 'T23:59:59')
                        : null

                    if (inicioFiltro && finNomina) {
                        matchesTime = matchesTime && finNomina >= inicioFiltro
                    }

                    if (finFiltro && inicioNomina) {
                        matchesTime = matchesTime && inicioNomina <= finFiltro
                    }
                } else if (activeTabId && timeTabs.length > 0) {
                    const activeTab = timeTabs.find(t => t.id === activeTabId)
                    if (activeTab) {
                        matchesTime =
                            !!inicioNomina &&
                            !!finNomina &&
                            finNomina >= activeTab.start &&
                            inicioNomina <= activeTab.end
                    }
                }
            } else {
                matchesTime = false
            }

        return matchesSearch && matchesPeriodo && matchesTime
    })

    // Obtener periodos únicos para el filtro
    const periodos = [...new Set(nominas.map(n => {
        if (n.periodoInicio) {
            const date = new Date(n.periodoInicio)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
        return null
    }).filter(Boolean))].sort().reverse()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Nómina Fija</h1>
                    <p className="text-slate-600 mt-1">Gestión de nóminas para personal fijo</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Nueva Nómina</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <StatCard
                    title="Total Nóminas"
                    value={stats.total}
                    icon={Wallet}
                    color="blue"
                    description="Registros totales"
                />
                <StatCard
                    title="Total Pagado"
                    value={`$${stats.totalPagado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="green"
                    description="Suma de todas las nóminas"
                />
            </div>

            {(fechaInicioFiltro || fechaFinFiltro) && (
                <div className="mb-4 mx-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Estás usando un filtro manual por fechas. Las pestañas semanal/mensual quedan en segundo plano.
                </div>
            )}

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

            {/* Filters */}
            <div className="bg-white rounded-b-xl rounded-t-none shadow-sm border border-t-0 border-slate-200 p-4 mx-1 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, alias, ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Periodo Filter */}
                    <div>
                        <select
                            value={periodoFilter}
                            onChange={(e) => setPeriodoFilter(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                            <option value="">Todos los periodos</option>
                            {periodos.map((periodo) => {
                                const [year, month] = periodo.split('-')
                                const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
                                return (
                                    <option key={periodo} value={periodo}>
                                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    {/* Fecha inicio manual */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Fecha inicio
                        </label>
                        <input
                            type="date"
                            value={fechaInicioFiltro}
                            onChange={(e) => setFechaInicioFiltro(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Fecha fin manual */}
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                            Fecha fin
                        </label>
                        <input
                            type="date"
                            value={fechaFinFiltro}
                            onChange={(e) => setFechaFinFiltro(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setFechaInicioFiltro('')
                            setFechaFinFiltro('')
                        }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        Limpiar fechas
                    </button>

                    {(fechaInicioFiltro || fechaFinFiltro) && (
                        <div className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            Filtro manual activo
                        </div>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                    Mostrando <span className="font-semibold text-slate-900">{filteredNominas.length}</span> de{' '}
                    <span className="font-semibold text-slate-900">{nominas.length}</span> nóminas
                </p>
            </div>

            {/* Nominas Grid */}
            {filteredNominas.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <Wallet className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No se encontraron nóminas</h3>
                    <p className="text-slate-600 mb-6">
                        {searchTerm || periodoFilter || fechaInicioFiltro || fechaFinFiltro
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Comienza creando una nueva nómina fija'}
                    </p>
                    {!searchTerm && !periodoFilter && !fechaInicioFiltro && !fechaFinFiltro && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Crear primera nómina
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNominas.map((nomina) => (
                        <NominaFijaCard
                            key={nomina.id}
                            nomina={nomina}
                            onEdit={handleEditNomina}
                            onDelete={handleDeleteNomina}
                            onViewDetails={handleViewNomina}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateNominaFijaModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateNomina}
            />

            <EditNominaFijaModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedNomina(null)
                }}
                onSubmit={handleUpdateNomina}
                nomina={selectedNomina}
            />

            <ViewNominaFijaModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false)
                    setSelectedNomina(null)
                }}
                nomina={selectedNomina}
            />

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setSelectedNomina(null)
                }}
                onConfirm={handleConfirmDelete}
                nomina={selectedNomina}
            />
        </div>
    )
}
