'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search, User, Briefcase, DollarSign, CheckCircle } from 'lucide-react'

const formatMoney = (value) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(Number(value || 0))
}

const AdministrativoSelector = ({
    administrativos = [],
    value,
    onChange,
    loading = false,
    error = '',
    disabled = false
}) => {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const wrapperRef = useRef(null)

    const selectedAdministrativo = useMemo(() => {
        return administrativos.find(admin => String(admin.id) === String(value))
    }, [administrativos, value])

    const filteredAdministrativos = useMemo(() => {
        const term = searchTerm.toLowerCase().trim()

        if (!term) return administrativos

        return administrativos.filter(admin => {
            return (
                (admin.nombre || '').toLowerCase().includes(term) ||
                (admin.puesto || '').toLowerCase().includes(term) ||
                (admin.alias || '').toLowerCase().includes(term) ||
                (admin.nombreCuenta || '').toLowerCase().includes(term) ||
                (admin.cuenta || '').toString().toLowerCase().includes(term)
            )
        })
    }, [administrativos, searchTerm])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSelect = (admin) => {
        onChange(admin)
        setSearchTerm('')
        setOpen(false)
    }

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                disabled={disabled || loading}
                onClick={() => setOpen(prev => !prev)}
                className={`w-full border rounded-xl bg-white px-4 py-3 text-left transition-all ${
                    error
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-slate-300 hover:border-blue-400 focus:ring-blue-500'
                } ${disabled || loading ? 'opacity-70 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
            >
                {selectedAdministrativo ? (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-white" />
                            </div>

                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">
                                    {selectedAdministrativo.nombre}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {selectedAdministrativo.puesto || 'Sin puesto'} · {formatMoney(selectedAdministrativo.sueldoBase)}
                                </p>
                            </div>
                        </div>

                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>

                            <div>
                                <p className="font-medium text-slate-500">
                                    {loading ? 'Cargando administrativos...' : 'Selecciona un administrativo'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Se cargará su sueldo base automáticamente
                                </p>
                            </div>
                        </div>

                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                )}
            </button>

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}

            {open && !disabled && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, puesto, alias o cuenta..."
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {filteredAdministrativos.length === 0 ? (
                            <div className="p-5 text-center text-sm text-slate-500">
                                No se encontraron administrativos
                            </div>
                        ) : (
                            filteredAdministrativos.map(admin => {
                                const isSelected = String(admin.id) === String(value)

                                return (
                                    <button
                                        type="button"
                                        key={admin.id}
                                        onClick={() => handleSelect(admin)}
                                        className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                                            isSelected ? 'bg-blue-50' : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-blue-600' : 'bg-slate-100'
                                                }`}>
                                                    <User className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">
                                                        {admin.nombre}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                        <span className="text-xs text-slate-500 flex items-center">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            {admin.puesto || 'Sin puesto'}
                                                        </span>

                                                        <span className="text-xs text-emerald-700 flex items-center font-medium">
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            {formatMoney(admin.sueldoBase)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdministrativoSelector