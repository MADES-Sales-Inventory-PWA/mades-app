import { BasicButton } from "./BasicButton";
import { Plus, Trash2, Upload } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import type { Product, ProductSize, SizeType } from "../types/Types";
import { useState } from "react";


export const ProductForm = ({ setIsOpen, title, actionText, product }: { setIsOpen: (isOpen: boolean) => void; title: string; actionText: string; product?: Product }) => {
    const [form, setForm] = useState({
        sku: "",
        nombre: "",
        descripcion: "",
        precio: "",
        imagen: "",
        tipoTalla: "letras" as SizeType,
    });
    const [sizes, setSizes] = useState<ProductSize[]>([
        { talla: "", cantidadExistente: 0, unidadesAlerta: 0 },
    ]);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2/3 flex-col overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-3xl font-semibold text-gray-800 my-auto">{title}</h2>

                <div className="flex flex-row w-full gap-2 mt-4 my-auto">
                    <div className="flex flex-col gap-2 w-full ">
                        <p className="text-gray-600">Imagen del producto</p>
                        <BasicButton onClick={() => alert("Funcionalidad de subir imagen en construcción")} className="w-full h-full flex items-center justify-center">
                            <div className="w-[13rem] h-[13rem] overflow-hidden rounded-lg bg-tr-bg">
                                {product?.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt="Imagen del producto"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col w-full h-full items-center justify-center gap-1">
                                        <Upload size={32} className="text-gray-500" />
                                        <p className="text-gray-500 text-sm">Subir imagen</p>
                                    </div>
                                )}
                            </div>
                        </BasicButton>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Input height="h-9" label="Nombre del producto" type="text" placeholder="Ej: Camisa gris manga larga" onChange={() => { }} value={product?.name || ""} />
                        <div className="flex flex-row gap-2 w-full">
                            <Input className="flex-1" height="h-9" label="Código de barras" type="text" placeholder="Ej: 123456789" onChange={() => { }} value={product?.barcode || ""} />
                            <Input className="flex-1" height="h-9" label="Tamaño" type="number" placeholder="" onChange={() => { }} value={product?.size || ""} />
                        </div>
                        <label htmlFor="Description">Descripción del producto</label>
                        <textarea id="Description" className="border border-gray-300 rounded-default p-2" placeholder="Ej: Camisa de algodón de calidad" onChange={() => { }} value={product?.description || ""} />
                    </div>
                </div>

                <div className="my-3 my-auto">
                    <h1 className="text-xl font-bold text-gray-800">Precio e inventario</h1>
                    <div className="flex flex-row gap-2 w-full mt-2">
                        <Input className="flex-1" height="h-9" label="Precio de compra" type="number" placeholder="Ej: 15000" onChange={() => { }} value={product?.purchasePrice || ""} />
                        <Input className="flex-1" height="h-9" label="Precio de venta" type="number" placeholder="Ej: 25000" onChange={() => { }} value={product?.sellingPrice || ""} />
                        <Input className="flex-1" height="h-9" label="Cantidad en stock" type="number" placeholder="Ej: 50" onChange={() => { }} value={product?.quantity || ""} />
                        <Input className="flex-1" height="h-9" label="Cantidad mínima" type="number" placeholder="Ej: 10" onChange={() => { }} value={product?.minQuantity || ""} />
                    </div>
                </div>

                <label className="space-y-1 my-2">
                    <span className="text-sm font-semibold text-slate-700">Tipo de talla</span>
                    <select
                        value={form.tipoTalla}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, tipoTalla: event.target.value as SizeType }))
                        }
                        className="w-full rounded-xl border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                    >
                        <option value="letras">Letras (XS, S, M, L, XL)</option>
                        <option value="numerica">Numérica (28, 30, 32, ...)</option>
                    </select>
                </label>

                <div className="rounded-xl border border-slate-200 p-4 mb-3">

                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Tallas registradas</h2>
                        <button
                            type="button"
                            onClick={() =>
                                setSizes((prev) => [
                                    ...prev,
                                    { talla: "", cantidadExistente: 0, unidadesAlerta: 0 },
                                ])
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
                        >
                            <Plus size={16} />
                            Agregar talla
                        </button>
                    </div>

                    <div className="space-y-2 mb-3">
                        {sizes.map((size, index) => (
                            <div key={`${index}-${size.talla}`} className="grid gap-2 sm:grid-cols-4">
                                <input
                                    placeholder={form.tipoTalla === "letras" ? "Ej: M" : "Ej: 32"}
                                    value={size.talla}
                                    onChange={(event) =>
                                        setSizes((prev) =>
                                            prev.map((item, i) =>
                                                i === index ? { ...item, talla: event.target.value } : item
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Existentes"
                                    value={size.cantidadExistente}
                                    onChange={(event) =>
                                        setSizes((prev) =>
                                            prev.map((item, i) =>
                                                i === index
                                                    ? { ...item, cantidadExistente: Number(event.target.value) }
                                                    : item
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Alerta"
                                    value={size.unidadesAlerta}
                                    onChange={(event) =>
                                        setSizes((prev) =>
                                            prev.map((item, i) =>
                                                i === index ? { ...item, unidadesAlerta: Number(event.target.value) } : item
                                            )
                                        )
                                    }
                                    className="rounded-lg border border-input-border px-3 py-2 outline-none focus:border-primary-blue"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSizes((prev) => prev.filter((_, i) => i !== index))}
                                    disabled={sizes.length === 1}
                                    className="inline-flex items-center justify-center rounded-lg border border-red-300 text-red-700 transition enabled:hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-row mt-auto w-full">
                    <div className="flex flex-row gap-2 ml-auto">
                        <BasicButton onClick={() => setIsOpen(false)}>
                            cancelar
                        </BasicButton>
                        <Button onClick={() => setIsOpen(false)}>
                            {actionText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}