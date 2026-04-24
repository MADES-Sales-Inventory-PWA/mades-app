import type { Product } from "../types/Types";
import { BasicButton } from "./BasicButton";
import { Pencil, Diff, Ban } from "lucide-react";
import { formatCOP } from "../utils/currency";

export const ProductsTable = ({ json, setEditOpen, setProductIdToEdit, deactivateProduct, onOpenAdjustModal }: { json: Product[]; setEditOpen: (isOpen: boolean) => void; setProductIdToEdit: (id: number) => void; deactivateProduct: (id: number) => void; onOpenAdjustModal: (id: number) => void }) => {
    const handleEdit = (id: number) => {
        setProductIdToEdit(id);
        setEditOpen(true);
    };

    const renderActions = (id: number) => (
        <div className="flex flex-row gap-1">
            <BasicButton id={String(id)} title="Editar producto" onClick={() => handleEdit(id)} className="p-1">
                <div className="flex flex-row items-center gap-1 rounded-default bg-gray-300 p-1 hover:bg-gray-200">
                    <Pencil size={16} />
                </div>
            </BasicButton>
            <BasicButton id={String(id)} title="Registrar ajuste" onClick={() => onOpenAdjustModal(id)} className="p-1">
                <div className="flex flex-row items-center gap-1 rounded-default bg-gray-300 p-1 hover:bg-gray-200">
                    <Diff size={16} />
                </div>
            </BasicButton>
            <BasicButton id={String(id)} title="Eliminar producto" onClick={() => deactivateProduct(id)} className="p-1">
                <div className="flex flex-row items-center gap-1 rounded-default bg-gray-300 p-1 hover:bg-gray-200">
                    <Ban size={16} />
                </div>
            </BasicButton>
        </div>
    );

    return (
        <>
            <div className="mt-5 grid gap-3 md:hidden">
                {json.map((product) => (
                    <article key={product.id} className={`rounded-xl border border-gray-300 bg-white p-3 shadow-sm ${product.isActive ? "" : "text-gray-500"}`}>
                        <div className="flex items-start gap-3">
                            <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                            <div className={`min-w-0 flex-1 ${product.isActive ? "" : "line-through"}`}>
                                <h3 className="truncate font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-sm text-gray-600">Código: {product.barcode}</p>
                                <p className="text-sm text-gray-700">Precio: {formatCOP(product.sellingPrice)}</p>
                                <p className="text-sm text-gray-700">Stock: {product.quantity}</p>
                            </div>
                        </div>
                        <div className="mt-2 flex justify-end">
                            {renderActions(product.id)}
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-5 hidden overflow-x-auto rounded-xl md:block">
                <table className="w-full min-w-[760px] overflow-hidden">
                    <thead>
                        <tr className="bg-tr-bg">
                            <th className="p-2 text-left">Imagen</th>
                            <th className="p-2 text-left">Código de barras</th>
                            <th className="p-2 text-left">Nombre</th>
                            <th className="p-2 text-left">Precio</th>
                            <th className="p-2 text-left">Stock</th>
                            <th className="p-2 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {json.map((product) => (
                            <tr key={product.id} className={product.isActive ? "bg-white" : "line-through text-gray-500"}>
                                <td className="border border-gray-300 p-2">
                                    <img src={product.imageUrl} alt={product.name} className="h-16 w-16 object-cover" />
                                </td>
                                <td className="border border-gray-300 p-2">{product.barcode}</td>
                                <td className="border border-gray-300 p-2">{product.name}</td>
                                <td className="border border-gray-300 p-2">{formatCOP(product.sellingPrice)}</td>
                                <td className="border border-gray-300 p-2">{product.quantity}</td>
                                <td className="border border-gray-300 p-2">
                                    {renderActions(product.id)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>

    );
}