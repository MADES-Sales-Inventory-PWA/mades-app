import { createPortal } from "react-dom";
import { WifiOff } from "lucide-react";
import { Button } from "./Button";
import { BasicButton } from "./BasicButton";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center rounded-full bg-orange-100 p-2">
            <WifiOff size={20} className="text-orange-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <BasicButton
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-gray-600 hover:bg-slate-50"
          >
            {cancelLabel}
          </BasicButton>
          <Button onClick={onConfirm} className="flex-1 py-2 text-sm">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
