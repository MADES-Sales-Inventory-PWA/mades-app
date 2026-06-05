import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, AlertTriangle, RefreshCw, X } from 'lucide-react'
import { useStockAlerts } from '../hooks/useStockAlerts'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

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
  const isOnline = useOnlineStatus()
  const { alerts, count, isLoading, refresh } = useStockAlerts()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({})
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
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  if (!isOnline) return null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`${count} ${notificationLabel}`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200"
      >
        <Bell size={20} className="text-slate-600" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            style={panelStyle}
            className="z-[9999] w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            {/* Header */}
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
                  disabled={isLoading}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
                  aria-label="Actualizar"
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

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {emptyState ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400">{emptyState}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {alerts.map((notification) => (
                    <li
                      key={`${notification.product.id}-${notification.createdAt}`}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
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
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {alerts.length > 0 ? (
              <div className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
                {alerts.length} {footerLabel} pendientes.
              </div>
            ) : null}
          </div>,
          document.body
        )}
    </>
  )
}
