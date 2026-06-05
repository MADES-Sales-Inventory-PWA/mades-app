import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, fetchNotificationsCount, type NotificationItem } from '../services/notifications'
import { NOTIFICATIONS_REFRESH_EVENT } from '../utils/notificationEvents'
import { productsDb } from '../sw/db/products.db'
import { useOnlineStatus } from './useOnlineStatus'

export type UseStockAlertsResult = {
  alerts: NotificationItem[]
  count: number
  isLoading: boolean
  refresh: () => void
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

async function getLocalStockAlerts(): Promise<NotificationItem[]> {
  const products = await productsDb.findAll()
  const createdAt = new Date().toISOString()

  return products
    .filter((product) => product.state && product.quantity <= product.minQuantity)
    .map((product) => ({
      currentStock: product.quantity,
      minStock: product.minQuantity,
      createdAt,
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
      },
    }))
}

export function useStockAlerts(): UseStockAlertsResult {
  const isOnline = useOnlineStatus()
  const [alerts, setAlerts] = useState<NotificationItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    setIsLoading(true)
    if (!isOnline) {
      getLocalStockAlerts()
        .then((localAlerts) => {
          setAlerts(localAlerts)
          setCount(localAlerts.length)
        })
        .catch(() => {
          setAlerts([])
          setCount(0)
        })
        .finally(() => setIsLoading(false))
      return
    }

    Promise.all([fetchNotifications(), fetchNotificationsCount()])
      .then(([items, total]) => {
        setAlerts(items)
        setCount(total)
      })
      .catch(async () => {
        const localAlerts = await getLocalStockAlerts()
        setAlerts(localAlerts)
        setCount(localAlerts.length)
      })
      .finally(() => setIsLoading(false))
  }, [isOnline])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS)
    const handleRefresh = () => refresh()

    globalThis.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh)

    return () => {
      clearInterval(interval)
      globalThis.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh)
    }
  }, [refresh])

  return { alerts, count, isLoading, refresh }
}
