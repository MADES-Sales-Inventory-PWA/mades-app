import React from 'react'
import {
  BarChart3, Users, ClipboardList, Package,
  ChevronLeft, ChevronRight, AlertTriangle, WifiOff,
  TrendingUp, History, ChevronDown, ChevronUp,
} from 'lucide-react'
import {
  getSalesByEmployee, getInventoryAdjustments,
  getSalesSummary, getSalesHistory,
} from '../services/reports'
import { fetchProducts } from '../services/products'
import { fetchEmployees } from '../services/users'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import type {
  SalesByEmployee, InventoryAdjustmentItem, AdjustmentFilters,
  SalesSummary, SalesHistoryItem, SalesHistoryFilters,
} from '../services/reports'
import type { Product } from '../types/Types'
import type { EmployeeItem } from '../services/users'

type Tab = 'summary' | 'history' | 'employees' | 'movements' | 'stock'

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

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

function plural(count: number, word: string) {
  return count === 1 ? word : `${word}s`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ message }: { readonly message: string }) {
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

function TypeBadge({ type }: { readonly type: string }) {
  const isLoss = type === 'LOSS'
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${isLoss ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
      {isLoss ? 'Salida' : 'Entrada'}
    </span>
  )
}

// ── Summary (Resumen general) ─────────────────────────────────────────────────

function ResumenReport() {
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month'>('day')
  const [date, setDate] = React.useState(() => new Date().toISOString().split('T')[0])
  const [summary, setSummary] = React.useState<SalesSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsLoading(true)
    setError(null)
    getSalesSummary(period, date)
      .then(setSummary)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [period, date])

  const periodLabel: Record<typeof period, string> = {
    day: 'Hoy', week: 'Esta semana', month: 'Este mes',
  }

  return (
    <div className="space-y-4">
      {/* Period selector + date */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${period === p ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {periodLabel[p]}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          max={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState message={error} />
      ) : summary ? (
        <>
          {/* Label */}
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {summary.label}
          </p>

          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Ventas realizadas</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">{summary.count}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Total recaudado</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{formatCOP(summary.totalSales)}</p>
            </div>
          </div>

          {/* Sales list */}
          {summary.data.length === 0 ? (
            <EmptyState message={`No hay ventas registradas en este período.`} />
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-2 sm:hidden">
                {summary.data.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{sale.seller}</p>
                      <p className="text-xs text-slate-400">{formatDate(sale.date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{formatCOP(Number(sale.total))}</p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Fecha</th>
                      <th className="px-4 py-3 text-left">Vendedor</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.data.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{formatDate(sale.date)}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{sale.seller}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCOP(Number(sale.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  )
}

// ── Sales history ─────────────────────────────────────────────────────────────

function SalesHistoryReport() {
  const [filters, setFilters] = React.useState<SalesHistoryFilters>({ page: 1, pageSize: 20 })
  const [data, setData] = React.useState<SalesHistoryItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [employees, setEmployees] = React.useState<EmployeeItem[]>([])
  const [expandedId, setExpandedId] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetchEmployees().then(setEmployees).catch(() => {})
  }, [])

  const load = React.useCallback((f: SalesHistoryFilters) => {
    setIsLoading(true)
    setError(null)
    getSalesHistory(f)
      .then((res) => { setData(res.data); setTotal(res.meta.total) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => { load(filters) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function applyFilters(partial: Partial<SalesHistoryFilters>) {
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
  const page = filters.page ?? 1

  function renderRow(item: SalesHistoryItem) {
    const isExpanded = expandedId === item.id
    const employeeName = item.employee ? `${item.employee.name} ${item.employee.lastName}` : '—'
    return (
      <React.Fragment key={item.id}>
        <tr
          className="cursor-pointer hover:bg-slate-50"
          onClick={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.invoiceNumber ?? '—'}</td>
          <td className="px-4 py-3 font-medium text-slate-800">{employeeName}</td>
          <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCOP(item.total)}</td>
          <td className="px-4 py-3 text-right text-slate-400">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </td>
        </tr>
        {isExpanded && (
          <tr className="bg-slate-50">
            <td colSpan={5} className="px-6 pb-3 pt-1">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Productos</p>
              <ul className="space-y-1">
                {item.products.map((p, i) => (
                  <li key={i} className="flex justify-between text-xs text-slate-600">
                    <span>{p.name} × {p.quantity}</span>
                    <span className="font-medium">{formatCOP(p.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <input type="date" value={filters.from ?? ''} onChange={(e) => applyFilters({ from: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto" />
        <input type="date" value={filters.to ?? ''} onChange={(e) => applyFilters({ to: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto" />
        <select
          value={filters.employeeId ?? ''}
          onChange={(e) => applyFilters({ employeeId: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto"
        >
          <option value="">Todos los empleados</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name} {emp.lastName}</option>
          ))}
        </select>
      </div>

      {isLoading ? <LoadingState /> : error ? <EmptyState message={error} /> : data.length === 0 ? (
        <EmptyState message="No hay ventas con los filtros seleccionados." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {data.map((item) => {
              const isExpanded = expandedId === item.id
              return (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full px-4 py-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.employee ? `${item.employee.name} ${item.employee.lastName}` : '—'}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                        {item.invoiceNumber && <p className="text-xs font-mono text-slate-400">{item.invoiceNumber}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-semibold text-slate-800">{formatCOP(item.total)}</span>
                        {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                      <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Productos</p>
                      <ul className="space-y-1">
                        {item.products.map((p, i) => (
                          <li key={i} className="flex justify-between text-xs text-slate-600">
                            <span>{p.name} × {p.quantity}</span>
                            <span className="font-medium">{formatCOP(p.lineTotal)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Factura</th>
                  <th className="px-4 py-3 text-left">Empleado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(renderRow)}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{total} {plural(total, 'venta')}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="px-2">{page} / {totalPages}</span>
              <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
                className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}
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
  const grandCount = data.reduce((s, r) => s + r.ventas_realizadas, 0)

  return (
    <div className="space-y-2">
      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {data.map((row, i) => (
          <div key={row.Vendedor} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-xs text-slate-400">{i + 1}.</span>
                <span className="truncate font-medium text-slate-800">{row.Vendedor}</span>
              </div>
              <span className="shrink-0 font-semibold text-slate-800">{formatCOP(row.total_vendido)}</span>
            </div>
            <p className="mt-1 pl-5 text-xs text-slate-500">{row.ventas_realizadas} {plural(row.ventas_realizadas, 'venta')}</p>
          </div>
        ))}
        <div className="flex justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <span>Total general ({grandCount} {plural(grandCount, 'venta')})</span>
          <span className="text-blue-700">{formatCOP(grandTotal)}</span>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
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
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatCOP(row.total_vendido)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-700">Total general</td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{grandCount}</td>
              <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">{formatCOP(grandTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ── Inventory movements ───────────────────────────────────────────────────────

function MovementsContent({ data, total, filters, totalPages, goToPage }: {
  readonly data: InventoryAdjustmentItem[]
  readonly total: number
  readonly filters: AdjustmentFilters
  readonly totalPages: number
  readonly goToPage: (p: number) => void
}) {
  const page = filters.page ?? 1
  return (
    <>
      {/* Mobile cards */}
      <div className="space-y-2 sm:hidden">
        {data.map((item) => (
          <div key={item.id} className="space-y-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
              <TypeBadge type={item.type} />
            </div>
            <p className="font-medium leading-tight text-slate-800">{item.product?.name ?? '—'}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{item.reasonLabel ?? '—'}</span>
              <span className="font-semibold text-slate-800">×{item.quantity}</span>
            </div>
            {item.employee && <p className="text-xs text-slate-400">{item.employee.name} {item.employee.lastName}</p>}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
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
                <td className="px-4 py-3 font-medium text-slate-800">{item.product?.name ?? '—'}</td>
                <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
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
        <span>{total} {plural(total, 'registro')}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}
            className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="px-2">{page} / {totalPages}</span>
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}
            className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
    </>
  )
}

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

  function renderContent() {
    if (isLoading) return <LoadingState />
    if (error) return <EmptyState message={error} />
    if (data.length === 0) return <EmptyState message="No hay movimientos con los filtros seleccionados." />
    return <MovementsContent data={data} total={total} filters={filters} totalPages={totalPages} goToPage={goToPage} />
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <input type="date" value={filters.from ?? ''} onChange={(e) => applyFilters({ from: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto" />
        <input type="date" value={filters.to ?? ''} onChange={(e) => applyFilters({ to: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto" />
        <select value={filters.reason ?? ''} onChange={(e) => applyFilters({ reason: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 sm:w-auto">
          {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {renderContent()}
    </div>
  )
}

// ── Stock ─────────────────────────────────────────────────────────────────────

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {lowCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
            <AlertTriangle size={14} />
            {lowCount} {plural(lowCount, 'producto')} con stock bajo
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 sm:ml-auto">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
          Solo stock bajo
        </label>
      </div>

      {displayed.length === 0 ? (
        <EmptyState message={onlyLow ? 'No hay productos con stock bajo.' : 'No hay productos activos.'} />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-2 sm:hidden">
            {displayed.map((p) => {
              const isLow = p.quantity <= p.minQuantity
              return (
                <div key={p.id} className={`space-y-1.5 rounded-xl border px-4 py-3 ${isLow ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-tight text-slate-800">{p.name}</span>
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {isLow && <AlertTriangle size={10} />}
                      {isLow ? 'Stock bajo' : 'Normal'}
                    </span>
                  </div>
                  {p.barcode && <p className="text-xs text-slate-400">{p.barcode}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-semibold ${isLow ? 'text-amber-700' : 'text-slate-700'}`}>
                      Stock: {p.quantity} / Mín: {p.minQuantity}
                    </span>
                    <span className="text-slate-500">{formatCOP(p.sellingPrice)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
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
                      <td className={`px-4 py-3 text-right font-semibold ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>{p.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{p.minQuantity}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {isLow && <AlertTriangle size={10} />}
                          {isLow ? 'Stock bajo' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{formatCOP(p.sellingPrice)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; shortLabel: string; icon: React.ReactNode }[] = [
  { id: 'summary',   label: 'Resumen general',          shortLabel: 'Resumen',     icon: <TrendingUp size={15} /> },
  { id: 'history',   label: 'Historial de ventas',      shortLabel: 'Historial',   icon: <History size={15} /> },
  { id: 'employees', label: 'Ventas por empleado',      shortLabel: 'Empleados',   icon: <Users size={15} /> },
  { id: 'movements', label: 'Movimientos de inventario',shortLabel: 'Movimientos', icon: <ClipboardList size={15} /> },
  { id: 'stock',     label: 'Existencias',              shortLabel: 'Existencias', icon: <Package size={15} /> },
]

export const ReportsContent = () => {
  const isOnline = useOnlineStatus()
  const [activeTab, setActiveTab] = React.useState<Tab>('summary')

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
              Los reportes requieren conexión. Conéctate para consultar ventas,
              movimientos de inventario y existencias.
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
          Consulta ventas, movimientos de inventario y existencias actuales.
        </p>
      </div>

      {/* Mobile: select dropdown */}
      <div className="mb-4 sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as Tab)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          {TABS.map((tab) => (
            <option key={tab.id} value={tab.id}>{tab.label}</option>
          ))}
        </select>
      </div>

      {/* Desktop: tab bar */}
      <div className="mb-5 hidden border-b border-slate-200 sm:flex sm:gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-medium transition lg:px-4 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            <span className="hidden lg:inline">{tab.label}</span>
            <span className="lg:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'summary'   && <ResumenReport />}
      {activeTab === 'history'   && <SalesHistoryReport />}
      {activeTab === 'employees' && <SalesByEmployeeReport />}
      {activeTab === 'movements' && <InventoryMovementsReport />}
      {activeTab === 'stock'     && <StockReport />}
    </div>
  )
}
