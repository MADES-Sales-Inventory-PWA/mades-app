import { constants } from '../constants/Constants'
import { authFetch } from '../utils/apiFetch'

const BASE = `${constants.BACKEND_BASE_URL}/api/reports`

export type SalesByEmployee = {
  Vendedor: string
  ventas_realizadas: number
  total_vendido: number
}

export type InventoryAdjustmentItem = {
  id: number
  createdAt: string
  type: 'LOSS' | 'GAIN'
  reason: string | null
  reasonLabel: string | null
  quantity: number
  description: string
  notes: string | null
  employee: { name: string; lastName: string; email: string } | null
  product: { name: string; barcode: string } | null
}

export type AdjustmentFilters = {
  from?: string
  to?: string
  reason?: string
  page?: number
  pageSize?: number
}

type Paginated<T> = {
  success: boolean
  data: T[]
  meta: { total: number; page: number; pageSize: number }
}

type SalesByEmployeeResponse = {
  success: boolean
  label: string
  total: number
  data: SalesByEmployee[]
}

async function apiFetch<T>(url: string): Promise<T> {
  const res = await authFetch(url)
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Error al cargar el reporte')
  }
  return res.json() as Promise<T>
}

export async function getSalesByEmployee(): Promise<SalesByEmployee[]> {
  const res = await apiFetch<SalesByEmployeeResponse>(`${BASE}/sales-per-employee`)
  return res.data
}

export async function getInventoryAdjustments(
  filters: AdjustmentFilters = {}
): Promise<Paginated<InventoryAdjustmentItem>> {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.reason) params.set('reason', filters.reason)
  params.set('page', String(filters.page ?? 1))
  params.set('pageSize', String(filters.pageSize ?? 20))
  return apiFetch<Paginated<InventoryAdjustmentItem>>(`${BASE}/inventory-adjustments?${params}`)
}
