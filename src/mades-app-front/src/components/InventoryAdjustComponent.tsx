
import {
    AlertTriangle,
    Check,
    ClipboardMinus,
    PackagePlus,
    PencilLine,
    RotateCcw,
    ShieldAlert,
    X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Product } from "../types/Types";
import { createInventoryAdjustment, type CreateInventoryAdjustmentPayload } from "../services/inventory";

type AdjustmentType = {
  id: string;
  label: string;
  icon: ReactNode;
};

type InventoryAdjustComponentProps = {
    product: Product;
    onClose: () => void;
    onAdjusted?: () => void;
};

export const InventoryAdjustComponent = ({ product, onClose, onAdjusted }: InventoryAdjustComponentProps) => {

    const [selectedType, setSelectedType] = useState<string>("dano");
    const [operation, setOperation] = useState<"sumar" | "restar">("restar");
    const [unitsInput, setUnitsInput] = useState("1");
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const adjustmentTypes: AdjustmentType[] = [
        {
            id: "perdida",
            label: "Pérdida",
            icon: <ClipboardMinus size={16} />,
        },
        {
            id: "dano",
            label: "Daño",
            icon: <AlertTriangle size={16} />,
        },
        {
            id: "robo",
            label: "Robo",
            icon: <ShieldAlert size={16} />,
        },
        {
            id: "reembolso",
            label: "Reembolso",
            icon: <RotateCcw size={16} />,
        },
        {
            id: "restock",
            label: "Restock",
            icon: <PackagePlus size={16} />,
        },
        {
            id: "correccion-manual",
            label: "Corrección manual",
            icon: <PencilLine size={16} />,
        },
    ];


    const stockActual = product.quantity;
    const isGain = selectedType === "reembolso" || selectedType === "restock" || (selectedType === "correccion-manual" && operation === "sumar");
    const maxUnits = isGain ? 99999 : stockActual;
    const parsedUnits = Number.parseInt(unitsInput, 10);
    const units = Number.isFinite(parsedUnits)
        ? Math.min(maxUnits, Math.max(1, parsedUnits))
        : 1;
    const nuevoStock =
        selectedType === "reembolso" || selectedType === "restock"
            ? stockActual + units
            : selectedType === "correccion-manual"
                ? operation === "sumar"
                    ? stockActual + units
                    : Math.max(0, stockActual - units)
                : Math.max(0, stockActual - units);

    const buildPayload = (): CreateInventoryAdjustmentPayload => {
        if (selectedType === "dano") {
            return { productId: product.id, type: "LOSS", reason: "DAMAGED", quantity: units, notes: comments.trim() || undefined };
        }

        if (selectedType === "perdida") {
            return { productId: product.id, type: "LOSS", reason: "LOST", quantity: units, notes: comments.trim() || undefined };
        }

        if (selectedType === "robo") {
            return { productId: product.id, type: "LOSS", reason: "STOLEN", quantity: units, notes: comments.trim() || undefined };
        }

        if (selectedType === "reembolso") {
            return { productId: product.id, type: "GAIN", reason: "RETURN", quantity: units, notes: comments.trim() || undefined };
        }

        if (selectedType === "restock") {
            return { productId: product.id, type: "GAIN", reason: "RESTOCK", quantity: units, notes: comments.trim() || undefined };
        }

        return {
            productId: product.id,
            type: operation === "sumar" ? "GAIN" : "LOSS",
            reason: "MANUAL",
            quantity: units,
            notes: comments.trim() || undefined,
        };
    };

    const handleConfirmAdjustment = async () => {
        try {
            setIsSubmitting(true);
            setErrorMessage(null);
            await createInventoryAdjustment(buildPayload());
            onAdjusted?.();
            onClose();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "No se pudo registrar el ajuste");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
            <section className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-[1100px] flex-col gap-5 overflow-y-auto rounded-2xl bg-slate-50 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200"
                        aria-label="Cerrar ajuste"
                    >
                        <X size={18} />
                    </button>
                </div>
            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-xs font-bold uppercase tracking-wide text-primary-blue">
                        Producto seleccionado
                    </p>
                    <div className="mb-4 flex gap-4">
                        <div className="h-[96px] w-[96px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : null}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h2>
                            <p className="mt-1 text-base text-slate-500 sm:text-lg">SKU: {product.barcode || "Sin código"}</p>
                            <p className="mt-2 text-xl font-semibold text-primary-blue sm:text-2xl">Stock actual: {stockActual}</p>
                        </div>
                    </div>
                </article>

                <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="border-b border-slate-200/80 px-5 py-4">
                        <h3 className="text-2xl font-bold text-slate-900">Detalles del ajuste</h3>
                    </div>

                    <div className="space-y-6 p-5">
                        <div>
                            <p className="mb-3 text-base font-semibold text-slate-800">Tipo de ajuste</p>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {adjustmentTypes.map((type) => {
                                    const checked = selectedType === type.id;

                                    return (
                                        <label
                                            key={type.id}
                                            className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 transition ${checked
                                                ? "border-primary-blue bg-blue-50 text-primary-blue"
                                                : "border-input-border bg-[#F3F4FE] text-slate-700"
                                                }`}
                                        >
                                            <span className="inline-flex items-center gap-2 font-medium">
                                                {type.icon}
                                                {type.label}
                                            </span>

                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => setSelectedType(type.id)}
                                                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-primary-blue sm:h-5 sm:w-5"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedType === "correccion-manual" && (
                            <div>
                                <p className="mb-2 text-base font-semibold text-slate-800">Operación</p>
                                <div className="flex flex-wrap gap-4">
                                    <label className="inline-flex items-center gap-2 text-slate-700">
                                        <input
                                            type="radio"
                                            name="operation"
                                            value="restar"
                                            checked={operation === "restar"}
                                            onChange={() => setOperation("restar")}
                                            className="h-4 w-4 shrink-0 accent-primary-blue sm:h-5 sm:w-5"
                                        />
                                        Restar
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-slate-700">
                                        <input
                                            type="radio"
                                            name="operation"
                                            value="sumar"
                                            checked={operation === "sumar"}
                                            onChange={() => setOperation("sumar")}
                                            className="h-4 w-4 shrink-0 accent-primary-blue sm:h-5 sm:w-5"
                                        />
                                        Sumar
                                    </label>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="mb-2 text-base font-semibold text-slate-800">Unidades</p>
                            <div className="flex h-12 items-center rounded-xl border border-input-border bg-[#F3F4FE] px-2 sm:h-14">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUnitsInput((current) => {
                                            const value = Number.parseInt(current, 10);
                                            const safeValue = Number.isFinite(value) && value >= 1 ? value : 1;
                                            return String(Math.max(1, safeValue - 1));
                                        });
                                    }}
                                    className="h-8 w-8 rounded-lg text-2xl text-primary-blue transition hover:bg-blue-50 sm:h-10 sm:w-10 sm:text-3xl"
                                    aria-label="Restar unidad"
                                >
                                    -
                                </button>

                                <input
                                    type="number"
                                    value={unitsInput}
                                    min={1}
                                    max={maxUnits}
                                    onChange={(event) => {
                                        const nextValue = event.target.value;
                                        if (/^\d*$/.test(nextValue)) {
                                            setUnitsInput(nextValue);
                                        }
                                    }}
                                    onBlur={() => {
                                        const value = Number.parseInt(unitsInput, 10);
                                        if (!Number.isFinite(value) || value < 1) {
                                            setUnitsInput("1");
                                            return;
                                        }
                                        setUnitsInput(String(Math.min(maxUnits, value)));
                                    }}
                                    className="flex-1 bg-transparent text-center text-lg font-semibold text-slate-800 outline-none sm:text-xl"
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setUnitsInput((current) => {
                                            const value = Number.parseInt(current, 10);
                                            const safeValue = Number.isFinite(value) && value >= 1 ? value : 1;
                                            return String(Math.min(maxUnits, safeValue + 1));
                                        });
                                    }}
                                    className="h-8 w-8 rounded-lg text-2xl text-primary-blue transition hover:bg-blue-50 sm:h-10 sm:w-10 sm:text-3xl"
                                    aria-label="Sumar unidad"
                                >
                                    +
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                                El nuevo stock será: <span className="font-semibold text-slate-700">{nuevoStock}</span>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="comments" className="mb-2 block text-base font-semibold text-slate-800">
                                Comentarios
                            </label>
                            <textarea
                                id="comments"
                                value={comments}
                                onChange={(event) => setComments(event.target.value)}
                                placeholder="Describa el motivo del ajuste o detalles adicionales..."
                                className="min-h-[160px] w-full resize-none rounded-xl border border-input-border bg-[#F3F4FE] p-4 text-lg text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-primary-blue"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-[#F7F8FF] px-5 py-4 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="h-12 rounded-xl border border-slate-300 px-6 text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmAdjustment}
                            disabled={isSubmitting}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-blue px-6 text-lg font-semibold text-white transition hover:bg-primary-blue-hover"
                        >
                            <Check size={18} />
                            {isSubmitting ? "Registrando..." : "Confirmar Ajuste"}
                        </button>
                    </div>
                </article>
            </div>
            </section>
        </div>
    );
}