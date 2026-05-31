import { useState, useEffect, useCallback } from 'react'
import { fetchProducts } from '../services/products'
import type { Product } from '../types/Types'

export type UseStockAlertsResult = {
  alerts: Product[]
  count: number
  isLoading: boolean
  refresh: () => void
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function useStockAlerts(): UseStockAlertsResult {
  const [alerts, setAlerts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    setIsLoading(true)
    fetchProducts()
      .then((products) =>
        setAlerts(products.filter((p) => p.isActive && p.quantity <= p.minQuantity))
      )
      .catch(() => setAlerts([]))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [refresh])

  return { alerts, count: alerts.length, isLoading, refresh }
}
