import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Bell, AlertTriangle, RefreshCw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStockAlerts } from '../hooks/useStockAlerts'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { constants } from '../constants/Constants'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function StockAlertsButton() {
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const { alerts, count, isLoading, refresh } = useStockAlerts()
  const [open, setOpen] = useState(false)
  const [isRinging, setIsRinging] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const previousCountRef = useRef(count)
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})
  const footerLabel = alerts.length === 1 ? 'notificación' : 'notificaciones'
  const notificationLabel = count === 1 ? 'notificación' : 'notificaciones'

  let emptyState: string | null = null
  if (isLoading && alerts.length === 0) {
    emptyState = 'Cargando...'
  } else if (alerts.length === 0) {
    emptyState = 'No hay notificaciones pendientes.'
  }

  useEffect(() => {
    if (!open) return
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (count > previousCountRef.current) {
      setIsRinging(true)
      const timeout = window.setTimeout(() => setIsRinging(false), 900)
      previousCountRef.current = count
      return () => window.clearTimeout(timeout)
    }

    previousCountRef.current = count
  }, [count])

  function goToInventory(productId: number) {
    setOpen(false)
    navigate(constants.INVENTORY_PATH, {
      state: {
        focusProductId: productId,
        openAdjustment: isOnline,
      },
    })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${count} ${notificationLabel}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200"
      >
        <Bell
          size={20}
          className={`text-slate-600 ${isRinging ? 'animate-[stock-bell-ring_0.9s_ease-in-out]' : ''}`}
        />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold leading-none text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="z-[9999] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-800">Notificaciones</span>
                {count > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={refresh}
                  disabled={isLoading || !isOnline}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                  aria-label={isOnline ? 'Actualizar' : 'Actualizar solo está disponible con conexión'}
                  title={isOnline ? 'Actualizar' : 'Actualización disponible al recuperar conexión'}
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {emptyState ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400">{emptyState}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {alerts.map((notification) => (
                    <li key={`${notification.product.id}-${notification.createdAt}`}>
                      <button
                        type="button"
                        onClick={() => goToInventory(notification.product.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition hover:bg-amber-50 focus:bg-amber-50 focus:outline-none"
                        title={
                          isOnline
                            ? 'Ir al inventario y abrir el ajuste del producto'
                            : 'Ir al inventario con los datos locales disponibles'
                        }
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{notification.product.name}</p>
                          <p className="text-xs text-slate-400">{notification.product.barcode}</p>
                          <p className="mt-1 text-[11px] text-slate-400">{formatDate(notification.createdAt)}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-amber-600">{notification.currentStock} uds.</p>
                          <p className="text-xs text-slate-400">Mín: {notification.minStock}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {alerts.length > 0 ? (
              <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                {alerts.length} {footerLabel} pendientes.{' '}
                {isOnline ? 'Selecciona una para ajustar inventario.' : 'Datos locales sin conexión.'}
              </div>
            ) : null}
          </div>,
          document.body
        )}
    </>
  )
}
