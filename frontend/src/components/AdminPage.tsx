import { useState } from 'react'
import { getAdminStats, downloadExcel, getErrorMessage } from '../services/api'
import type { AdminStats } from '../services/api'

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [departamentoFiltro, setDepartamentoFiltro] = useState('')

  async function handleVerificar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await getAdminStats(apiKey.trim())
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleDescargar() {
    setDownloading(true)
    try {
      await downloadExcel(apiKey.trim(), departamentoFiltro || undefined)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand-navy py-4 px-6 flex items-center gap-3 shadow">
        <div className="flex h-8 w-5 overflow-hidden rounded-sm shadow-sm">
          <div className="w-1/3 bg-brand-red" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-brand-red" />
        </div>
        <span className="text-white font-semibold text-lg">Defiende Tu Voto — Panel Administrativo</span>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Login card */}
        {!stats && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-brand-navy mb-2">Acceso administrativo</h1>
            <p className="text-gray-500 mb-6 text-sm">
              Ingresa tu clave de acceso para ver estadísticas y descargar el registro de personeros.
            </p>
            <form onSubmit={handleVerificar} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clave de acceso
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        )}

        {/* Stats + descarga */}
        {stats && (
          <div className="flex flex-col gap-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard label="Total registrados" value={stats.total.toLocaleString('es-PE')} color="brand-navy" />
              <StatCard label="DNI verificados" value={stats.verificados.toLocaleString('es-PE')} color="green-600" />
              <StatCard label="Sin verificar" value={stats.no_verificados.toLocaleString('es-PE')} color="yellow-600" />
            </div>

            {/* Descarga */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Descargar registro</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por departamento <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={departamentoFiltro}
                    onChange={e => setDepartamentoFiltro(e.target.value)}
                    placeholder="Ej: Lima, Cusco, Arequipa…"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleDescargar}
                    disabled={downloading}
                    className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {downloading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Generando…
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                        </svg>
                        Descargar Excel
                      </>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Por departamento */}
            {Object.keys(stats.por_departamento).length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-brand-navy mb-4">Registros por departamento</h2>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-navy text-white">
                        <th className="text-left px-4 py-2 rounded-tl-lg">Departamento</th>
                        <th className="text-right px-4 py-2 rounded-tr-lg">Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.por_departamento)
                        .sort(([, a], [, b]) => b - a)
                        .map(([dept, count], i) => (
                          <tr key={dept} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-4 py-2 text-gray-700">{dept}</td>
                            <td className="px-4 py-2 text-right font-medium text-brand-navy">
                              {count.toLocaleString('es-PE')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cerrar sesión */}
            <button
              onClick={() => { setStats(null); setApiKey(''); setError('') }}
              className="text-sm text-gray-500 hover:text-brand-red underline self-start"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold text-${color}`}>{value}</p>
    </div>
  )
}
