import { useState, useEffect, useCallback } from 'react'
import { fetchNotifications, fetchNotificationsCount, type NotificationItem } from '../services/notifications'
import { NOTIFICATIONS_REFRESH_EVENT } from '../utils/notificationEvents'

export type UseStockAlertsResult = {
  alerts: NotificationItem[]
  count: number
  isLoading: boolean
  refresh: () => void
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000

export function useStockAlerts(): UseStockAlertsResult {
  const [alerts, setAlerts] = useState<NotificationItem[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(() => {
    setIsLoading(true)
    Promise.all([fetchNotifications(), fetchNotificationsCount()])
      .then(([items, total]) => {
        setAlerts(items)
        setCount(total)
      })
      .catch(() => {
        setAlerts([])
        setCount(0)
      })
      .finally(() => setIsLoading(false))
  }, [])

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
