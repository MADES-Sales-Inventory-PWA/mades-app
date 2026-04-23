import { BasicButton } from "./BasicButton";
import { Upload } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import type { Product } from "../types/Types";


export const ProductForm = ({ setIsOpen, title, actionText, product }: { setIsOpen: (isOpen: boolean) => void; title: string; actionText: string; product?: Product }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="flex flex-col bg-white rounded-xl p-6 shadow-lg w-2/3 h-9/10">
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