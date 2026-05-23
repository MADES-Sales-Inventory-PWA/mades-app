import React from 'react'
import { BarChart3, Users, ClipboardList, Package, ChevronLeft, ChevronRight, AlertTriangle, WifiOff } from 'lucide-react'
import { getSalesByEmployee, getInventoryAdjustments } from '../services/reports'
import { fetchProducts } from '../services/products'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import type { SalesByEmployee, InventoryAdjustmentItem, AdjustmentFilters } from '../services/reports'
import type { Product } from '../types/Types'

type Tab = 'employees' | 'movements' | 'stock'

const REASONS = [
  { value: '', label: 'Todos' },
  { value: 'DAMAGED', label: 'Daño' },
  { value: 'LOST', label: 'Pérdida' },
  { value: 'STOLEN', label: 'Robo' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'RESTOCK', label: 'Reposición' },
  { value: 'MANUAL', label: 'Ajuste manual' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      Cargando...
    </div>
  )
}

// ── Sales by employee ─────────────────────────────────────────────────────────

function SalesByEmployeeReport() {
  const [data, setData] = React.useState<SalesByEmployee[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getSalesByEmployee()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingState />
  if (error) return <EmptyState message={error} />
  if (data.length === 0) return <EmptyState message="No hay ventas registradas." />

  const grandTotal = data.reduce((s, r) => s + r.total_vendido, 0)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">#</th>
            <th className="px-4 py-3 text-left">Empleado</th>
            <th className="px-4 py-3 text-right">Ventas</th>
            <th className="px-4 py-3 text-right">Total vendido</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={row.Vendedor} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-400">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{row.Vendedor}</td>
              <td className="px-4 py-3 text-right text-slate-600">{row.ventas_realizadas}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-800">
                {formatCurrency(row.total_vendido)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200 bg-slate-50">
          <tr>
            <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-700">Total general</td>
            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
              {data.reduce((s, r) => s + r.ventas_realizadas, 0)}
            </td>
            <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">
              {formatCurrency(grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Inventory movements ───────────────────────────────────────────────────────

function InventoryMovementsReport() {
  const [data, setData] = React.useState<InventoryAdjustmentItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState<AdjustmentFilters>({ page: 1, pageSize: 20 })

  const load = React.useCallback((f: AdjustmentFilters) => {
    setIsLoading(true)
    setError(null)
    getInventoryAdjustments(f)
      .then((res) => { setData(res.data); setTotal(res.meta.total) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => { load(filters) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(partial: Partial<AdjustmentFilters>) {
    const next = { ...filters, ...partial, page: 1 }
    setFilters(next)
    load(next)
  }

  function goToPage(page: number) {
    const next = { ...filters, page }
    setFilters(next)
    load(next)
  }

  const totalPages = Math.max(1, Math.ceil(total / (filters.pageSize ?? 20)))

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => applyFilters({ from: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => applyFilters({ to: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <select
          value={filters.reason ?? ''}
          onChange={(e) => applyFilters({ reason: e.target.value || undefined })}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState message={error} />
      ) : data.length === 0 ? (
        <EmptyState message="No hay movimientos con los filtros seleccionados." />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Razón</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-left">Empleado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.product?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.type === 'LOSS'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type === 'LOSS' ? 'Salida' : 'Entrada'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.reasonLabel ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.employee ? `${item.employee.name} ${item.employee.lastName}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{total} registro{total !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage((filters.page ?? 1) - 1)}
                disabled={(filters.page ?? 1) <= 1}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2">
                {filters.page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage((filters.page ?? 1) + 1)}
                disabled={(filters.page ?? 1) >= totalPages}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Stock query ───────────────────────────────────────────────────────────────

function StockReport() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [onlyLow, setOnlyLow] = React.useState(false)

  React.useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [])

  const displayed = React.useMemo(() => {
    const all = products.filter((p) => p.isActive)
    return onlyLow ? all.filter((p) => p.quantity <= p.minQuantity) : all
  }, [products, onlyLow])

  const lowCount = products.filter((p) => p.isActive && p.quantity <= p.minQuantity).length

  if (isLoading) return <LoadingState />
  if (error) return <EmptyState message={error} />

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        {lowCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
            <AlertTriangle size={14} />
            {lowCount} producto{lowCount !== 1 ? 's' : ''} con stock bajo
          </div>
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyLow}
            onChange={(e) => setOnlyLow(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-400"
          />
          Solo stock bajo
        </label>
      </div>

      {displayed.length === 0 ? (
        <EmptyState message={onlyLow ? 'No hay productos con stock bajo.' : 'No hay productos activos.'} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-right">Stock actual</th>
                <th className="px-4 py-3 text-right">Stock mínimo</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Precio venta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map((p) => {
                const isLow = p.quantity <= p.minQuantity
                return (
                  <tr key={p.id} className={isLow ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500">{p.barcode || '—'}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{p.minQuantity}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isLow ? <AlertTriangle size={10} /> : null}
                        {isLow ? 'Stock bajo' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'employees', label: 'Ventas por empleado', icon: <Users size={15} /> },
  { id: 'movements', label: 'Movimientos de inventario', icon: <ClipboardList size={15} /> },
  { id: 'stock', label: 'Existencias', icon: <Package size={15} /> },
]

export const ReportsContent = () => {
  const isOnline = useOnlineStatus()
  const [activeTab, setActiveTab] = React.useState<Tab>('employees')

  if (!isOnline) {
    return (
      <div className="px-3 py-3 sm:px-6 sm:py-4 lg:px-10">
        <div className="mb-5 space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 sm:text-3xl">Reportes</h2>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white py-16 text-center">
          <WifiOff size={40} className="text-slate-300" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-700">Sin conexión a internet</h3>
            <p className="mx-auto max-w-xs text-sm text-slate-500">
              Los reportes requieren conexión. Conéctate para consultar ventas
              por empleado, movimientos de inventario y existencias.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-4 lg:px-10">
      {/* Header */}
      <div className="mb-5 space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800 sm:text-3xl">Reportes</h2>
        </div>
        <p className="text-sm text-gray-500">
          Consulta el desempeño de ventas, movimientos de inventario y existencias actuales.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'employees' && <SalesByEmployeeReport />}
      {activeTab === 'movements' && <InventoryMovementsReport />}
      {activeTab === 'stock' && <StockReport />}
    </div>
  )
}
