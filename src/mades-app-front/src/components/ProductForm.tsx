import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { BasicButton } from "./BasicButton";
import { Button } from "./Button";
import { Input } from "./Input";
import type { Product } from "../types/Types";
import { createProduct, updateProduct, type ProductFormValues } from "../services/products";
import { fetchSizeTypes, fetchSizeValues, type SizeTypeDTO, type SizeValueDTO } from "../services/sizes";
import { useToast } from "./ToastProvider";

type FormState = {
    name: string;
    sizeTypeId: string;
    sizeValueId: string;
    barcode: string;
    description: string;
    imageUrl: string;
    purchasePrice: string;
    quantity: string;
    minQuantity: string;
};

const emptyForm: FormState = {
    name: "",
    sizeTypeId: "",
    sizeValueId: "",
    barcode: "",
    description: "",
    imageUrl: "",
    purchasePrice: "",
    quantity: "",
    minQuantity: "",
};

function toNullableText(value: string) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: string) {
    return Number(value);
}

export const ProductForm = ({
    setIsOpen,
    title,
    actionText,
    product,
    onSaved,
}: {
    setIsOpen: (isOpen: boolean) => void;
    title: string;
    actionText: string;
    product?: Product;
    onSaved?: () => void;
}) => {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [sizeTypes, setSizeTypes] = useState<SizeTypeDTO[]>([]);
    const [sizeValues, setSizeValues] = useState<SizeValueDTO[]>([]);
    const [isLoadingSizes, setIsLoadingSizes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const selectedSizeTypeId = form.sizeTypeId ? Number(form.sizeTypeId) : null;
    const selectedSizeValueId = form.sizeValueId ? Number(form.sizeValueId) : null;

    const selectedSizeTypeLabel = useMemo(
        () => sizeTypes.find((item) => item.id === selectedSizeTypeId)?.name ?? "",
        [sizeTypes, selectedSizeTypeId]
    );

    useEffect(() => {
        setForm(
            product
                ? {
                    name: product.name ?? "",
                    sizeTypeId: String(product.sizeTypeId ?? ""),
                    sizeValueId: String(product.sizeValueId ?? ""),
                    barcode: product.barcode ?? "",
                    description: product.description ?? "",
                    imageUrl: product.imageUrl ?? "",
                    purchasePrice: String(product.purchasePrice ?? ""),
                    quantity: String(product.quantity ?? ""),
                    minQuantity: String(product.minQuantity ?? ""),
                }
                : emptyForm
        );
    }, [product]);

    useEffect(() => {
        let isMounted = true;

        const loadSizeTypes = async () => {
            try {
                setIsLoadingSizes(true);
                const types = await fetchSizeTypes();

                if (!isMounted) {
                    return;
                }

                setSizeTypes(types);

                if (!product && types.length > 0 && !form.sizeTypeId) {
                    setForm((current) => ({
                        ...current,
                        sizeTypeId: String(types[0].id),
                    }));
                }
            } catch (error) {
                if (isMounted) {
                    showToast(error instanceof Error ? error.message : "No se pudieron cargar los tipos de talla.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSizes(false);
                }
            }
        };

        void loadSizeTypes();

        return () => {
            isMounted = false;
        };
    }, [product, form.sizeTypeId, showToast]);

    useEffect(() => {
        if (!selectedSizeTypeId) {
            setSizeValues([]);
            return;
        }

        let isMounted = true;

        const loadSizeValues = async () => {
            try {
                setIsLoadingSizes(true);
                const values = await fetchSizeValues(selectedSizeTypeId);

                if (!isMounted) {
                    return;
                }

                setSizeValues(values);

                setForm((current) => {
                    const currentValueId = current.sizeValueId ? Number(current.sizeValueId) : null;
                    const exists = values.some((item) => item.id === currentValueId);

                    if (exists) {
                        return current;
                    }

                    return {
                        ...current,
                        sizeValueId: values[0] ? String(values[0].id) : "",
                    };
                });
            } catch (error) {
                if (isMounted) {
                    showToast(error instanceof Error ? error.message : "No se pudieron cargar los valores de talla.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSizes(false);
                }
            }
        };

        void loadSizeValues();

        return () => {
            isMounted = false;
        };
    }, [selectedSizeTypeId, showToast]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            if (!form.name.trim() || !form.sizeTypeId || !form.sizeValueId || !form.purchasePrice.trim() || !form.quantity.trim() || !form.minQuantity.trim()) {
                showToast("Por favor completa todos los campos.");
                return;
            }

            const payload: ProductFormValues = {
                name: form.name.trim(),
                sizeTypeId: Number(form.sizeTypeId),
                sizeValueId: Number(form.sizeValueId),
                barcode: toNullableText(form.barcode),
                description: toNullableText(form.description),
                imageUrl: toNullableText(form.imageUrl),
                purchasePrice: toNumber(form.purchasePrice),
                quantity: toNumber(form.quantity),
                minQuantity: toNumber(form.minQuantity),
            };

            if (!product) {
                await createProduct(payload);
            } else {
                await updateProduct(product.id, payload);
            }

            onSaved?.();
            setIsOpen(false);
        } catch (error) {
            showToast(error instanceof Error ? error.message : (product ? "No se pudo actualizar el producto." : "No se pudo crear el producto."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xl bg-white p-5 shadow-lg sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">{title}</h2>
                    </div>
                    <BasicButton onClick={() => setIsOpen(false)} className="shrink-0">
                        Cerrar
                    </BasicButton>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700">Imagen del producto</p>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            <div className="flex h-50 w-full items-center justify-center" onClick={() => alert("Funcionalidad de subir imagen en construcción")}>
                                {form.imageUrl ? (
                                    <img src={form.imageUrl} alt="Imagen del producto" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                        <Upload size={32} />
                                        <span className="text-sm font-medium">Subir imagen</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Input label="URL de imagen" type="text" placeholder="https://..." value={form.imageUrl} onChange={(value) => setForm((current) => ({ ...current, imageUrl: value }))} />
                    </div>

                    <div className="grid gap-1.5">
                        <div className="grid items-start gap-2 md:grid-cols-2">
                            <Input label="Nombre del producto" type="text" placeholder="Ej: Camisa gris manga larga" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                            <Input disabled={Boolean(product)} label="Código de barras" type="text" placeholder="Ej: 123456789" value={form.barcode} onChange={(value) => setForm((current) => ({ ...current, barcode: value }))} />
                        </div>

                        <div className="grid items-start gap-2 md:grid-cols-2">
                            <label className="space-y-1">
                                <span className="text-sm font-semibold text-slate-700">Tipo de talla</span>
                                <select
                                    value={form.sizeTypeId}
                                    onChange={(event) => setForm((current) => ({ ...current, sizeTypeId: event.target.value }))}
                                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                                    disabled={isLoadingSizes}
                                >
                                    <option value="">Selecciona un tipo</option>
                                    {sizeTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="space-y-1">
                                <span className="text-sm font-semibold text-slate-700">Valor de talla</span>
                                <select
                                    value={form.sizeValueId}
                                    onChange={(event) => setForm((current) => ({ ...current, sizeValueId: event.target.value }))}
                                    className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                                    disabled={isLoadingSizes || sizeValues.length === 0}
                                >
                                    <option value="">Selecciona un valor</option>
                                    {sizeValues.map((value) => (
                                        <option key={value.id} value={value.id}>
                                            {value.value}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-slate-700">Descripción del producto</span>
                            <textarea
                                className="h-full min-h-24 rounded-xl border border-gray-300 p-3 outline-none focus:border-primary-blue"
                                placeholder="Ej: (mínimo 10 caracteres) Camisa de algodón de calidad"
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                            />
                        </label>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-gray-300 bg-white p-4">
                    <h3 className="text-lg font-bold text-gray-800">Precio e inventario</h3>
                    <p className="mt-1 text-sm text-slate-600">Todos los precios se manejan en pesos colombianos (COP).</p>
                    <div className="mt-2 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <Input label="Precio de compra (COP)" type="number" placeholder="Ej: 15.000" value={form.purchasePrice} onChange={(value) => setForm((current) => ({ ...current, purchasePrice: value }))} />
                        <Input label="Cantidad en stock" type="number" placeholder="Ej: 50" value={form.quantity} onChange={(value) => setForm((current) => ({ ...current, quantity: value }))} />
                        <Input label="Cantidad mínima" type="number" placeholder="Ej: 10" value={form.minQuantity} onChange={(value) => setForm((current) => ({ ...current, minQuantity: value }))} />
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full pt-2 sm:flex-row sm:justify-end">
                    <BasicButton onClick={() => setIsOpen(false)}>
                        cancelar
                    </BasicButton>
                    <Button onClick={handleSubmit} className="w-full sm:w-auto">
                        {isSubmitting ? "Guardando..." : actionText}
                    </Button>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                    Talla activa: {selectedSizeTypeLabel || "Sin seleccionar"} {selectedSizeValueId ? `- valor ${selectedSizeValueId}` : ""}
                </p>
            </div>
        </div>
    );
};
