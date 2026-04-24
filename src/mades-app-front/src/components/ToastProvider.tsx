import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import React from "react";

type ToastVariant = "error" | "success" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

const toastIcons: Record<ToastVariant, React.ReactNode> = {
  error: <AlertCircle size={18} />,
  success: <CheckCircle2 size={18} />,
  info: <Info size={18} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = React.useCallback((message: string, variant: ToastVariant = "error", durationMs = 5000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((current) => [...current, { id, message, variant }]);

    window.setTimeout(() => {
      removeToast(id);
    }, durationMs);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-md flex-col gap-2 sm:w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${toastStyles[toast.variant]}`}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0">{toastIcons[toast.variant]}</span>
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-1 transition hover:bg-black/5"
                aria-label="Cerrar notificacion"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }

  return context;
}
