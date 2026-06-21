'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Save, Trash2, DollarSign, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import gastosFijosService from '@/app/services/gastosFijosService'

const initialFormData = {
  nombre: '',
  descripcion: '',
  montoDiario: ''
}

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(Number(value || 0))
}

const GastosFijosModal = ({ isOpen, onClose }) => {
  const [gastosFijos, setGastosFijos] = useState([])
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadGastosFijos()
    }
  }, [isOpen])

  const loadGastosFijos = async () => {
    try {
      setLoading(true)
      const data = await gastosFijosService.getGastosFijos()
      setGastosFijos(data || [])
    } catch (error) {
      toast.error(error.message || 'Error al cargar gastos fijos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    try {
      setSaving(true)

      const dataToSend = {
        nombre: formData.nombre.trim().toUpperCase(),
        descripcion: formData.descripcion,
        montoDiario: Number(formData.montoDiario || 0)
      }

      await gastosFijosService.createGastoFijo(dataToSend)
      toast.success('Gasto fijo creado correctamente')
      setFormData(initialFormData)
      loadGastosFijos()
    } catch (error) {
      toast.error(error.message || 'Error al crear gasto fijo')
    } finally {
      setSaving(false)
    }
  }

  const handleChangeRow = (index, field, value) => {
    const copia = [...gastosFijos]
    copia[index] = {
      ...copia[index],
      [field]: value
    }
    setGastosFijos(copia)
  }

  const handleUpdate = async (gasto) => {
    try {
      setSaving(true)

      const dataToSend = {
        nombre: gasto.nombre,
        descripcion: gasto.descripcion,
        montoDiario: Number(gasto.montoDiario || 0)
      }

      await gastosFijosService.updateGastoFijo(gasto.nombre, dataToSend)
      toast.success(`Gasto fijo ${gasto.nombre} actualizado`)
      loadGastosFijos()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar gasto fijo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (nombre) => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar ${nombre}?`)

    if (!confirmar) return

    try {
      setSaving(true)
      await gastosFijosService.deleteGastoFijo(nombre)
      toast.success(`Gasto fijo ${nombre} eliminado`)
      loadGastosFijos()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar gasto fijo')
    } finally {
      setSaving(false)
    }
  }

  const totalDiario = gastosFijos.reduce((sum, gasto) => {
    return sum + Number(gasto.montoDiario || 0)
  }, 0)

  const totalSemanal = totalDiario * 7

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Gastos fijos</h2>
            <p className="text-sm text-slate-600 mt-1">
              Configura los montos diarios que se cargarán automáticamente en gastos semanales
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-medium">Total diario</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatMoney(totalDiario)}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-sm text-emerald-700 font-medium">Total semanal estimado</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {formatMoney(totalSemanal)}
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Agregar gasto fijo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. IMSS"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  El nombre funciona como clave. Ej. IMSS, GPS, SEGUROS.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del gasto"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Monto diario *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.montoDiario}
                    onChange={(e) => setFormData({ ...formData, montoDiario: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{saving ? 'Guardando...' : 'Agregar'}</span>
              </button>
            </div>
          </form>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Gastos fijos registrados
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Puedes modificar descripción y monto diario. El nombre se mantiene como clave.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Cargando gastos fijos...
              </div>
            ) : gastosFijos.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay gastos fijos registrados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Nombre</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Descripción</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Monto diario</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Semanal</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Acciones</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {gastosFijos.map((gasto, index) => (
                      <tr key={gasto.nombre} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={gasto.nombre}
                            disabled
                            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-not-allowed"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={gasto.descripcion || ''}
                            onChange={(e) => handleChangeRow(index, 'descripcion', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={gasto.montoDiario || 0}
                            onChange={(e) => handleChangeRow(index, 'montoDiario', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                          />
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {formatMoney(Number(gasto.montoDiario || 0) * 7)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleUpdate(gasto)}
                              disabled={saving}
                              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              title="Guardar cambios"
                            >
                              <Save className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(gasto.nombre)}
                              disabled={saving}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default GastosFijosModal