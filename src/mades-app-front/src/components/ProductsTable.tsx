import type { Product } from "../types/Types";
import { BasicButton } from "./BasicButton";
import { Pencil, Diff, Ban } from "lucide-react";

export const ProductsTable = ({ json, setEditOpen, setProductCodeToEdit, deactivateProduct }: { json: Product[]; setEditOpen: (isOpen: boolean) => void; setProductCodeToEdit: (code: string) => void; deactivateProduct: (code: string) => void }) => {
    return (
        <table className="w-full mt-5 rounded-xl overflow-hidden">
            <thead>
                <tr className="bg-tr-bg">
                    <th className="text-left p-2">Imagen</th>
                    <th className="text-left p-2">Código de barras</th>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Precio</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {json.map((product) => (
                    <tr key={product.barcode} className={product.isActive ? "bg-white" : "line-through text-gray-500"}>
                        <td className="border border-gray-300 p-2">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover" />
                        </td>
                        <td className="border border-gray-300 p-2">{product.barcode}</td>
                        <td className="border border-gray-300 p-2">{product.name}</td>
                        <td className="border border-gray-300 p-2">${(product.sellingPrice / 100).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2">{product.quantity}</td>
                        <td className="border border-gray-300 p-2">
                            <BasicButton id={product.barcode} title="Editar producto" onClick={() => {
                                setProductCodeToEdit(product.barcode);
                                setEditOpen(true);
                            }} className="p-1">
                                <div className="flex flex-row items-center gap-1 rounded-default p-1 bg-gray-300 hover:bg-gray-200">
                                    <Pencil size={16} />
                                </div>
                            </BasicButton>
                                <BasicButton id={product.barcode} title="Registrar ajuste" onClick={() => alert("Funcionalidad de registrar ajuste en construcción")} className="p-1">
                                    <div className="flex flex-row items-center gap-1 rounded-default p-1 bg-gray-300 hover:bg-gray-200">
                                        <Diff size={16} />
                                    </div>
                                </BasicButton>
                                <BasicButton id={product.barcode} title="Eliminar producto" onClick={() => deactivateProduct(product.barcode)} className="p-1">
                                    <div className="flex flex-row items-center gap-1 rounded-default p-1 bg-gray-300 hover:bg-gray-200">
                                        <Ban size={16} />
                                    </div>
                                </BasicButton>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}