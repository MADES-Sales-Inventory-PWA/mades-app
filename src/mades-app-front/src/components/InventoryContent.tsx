import React from "react";
import { ORDER_TYPES } from "../constants/documentTypes";
import { Button } from "./Button";
import { Combobox } from "./Combobox";
import { Input } from "./Input";
import { Search, Pencil } from "lucide-react";
import { BasicButton } from "./BasicButton";

export const InventoryContent = () => {
    const jsonTest = [
        {
            "name": "Producto 1",
            "sellingPrice": 12000,
            "size": 500,
            "barcode": "123456789012",
            "description": "Descripción del producto 1",
            "imageUrl": "/imgs/product1.jpg",
            "purchasePrice": 8000,
            "quantity": 50,
            "minQuantity": 10
        },
        {
            "name": "Producto 2",
            "sellingPrice": 20000,
            "size": 500,
            "barcode": "123456789013",
            "description": "Descripción del producto 2",
            "imageUrl": "/imgs/product1.jpg",
            "purchasePrice": 12000,
            "quantity": 50,
            "minQuantity": 10
        }
    ];

    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="px-10">
            <div className=" w-full flex flex-row justify-start">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-800">Inventario de productos</h2>
                    <p className="text-gray-600 mt-2">Administra los precios y niveles de stock del inventario.</p>
                </div>
                <Button className="ml-auto my-auto" onClick={() => setIsOpen(true)}>
                    Agregar producto
                </Button>

            </div>

            <div className="flex flex-row w-full rounded-lg bg-white p-3 mt-4">
                <Input type="text" placeholder="Buscar producto..." onChange={() => { }} value="" icon={<Search />} height="h-8" />
                <Combobox className="ml-4" options={ORDER_TYPES} placeholder="Ordenar por..." onChange={() => { }} value="" height="h-8" />
            </div>

            <table className="w-full mt-5 rounded-xl overflow-hidden">
                <thead>
                    <tr className="bg-tr-bg">
                        <th className="text-left p-2">Imagen</th>
                        <th className="text-left p-2">Código de barras</th>
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Precio</th>
                        <th className="text-left p-2">Stock</th>
                        <th className="text-left p-2">Registrar ajuste</th>
                    </tr>
                </thead>
                <tbody>
                    {jsonTest.map((product) => (
                        <tr key={product.barcode} className="bg-white">
                            <td className="border border-gray-300 p-2">
                                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover" />
                            </td>
                            <td className="border border-gray-300 p-2">{product.barcode}</td>
                            <td className="border border-gray-300 p-2">{product.name}</td>
                            <td className="border border-gray-300 p-2">${(product.sellingPrice / 100).toFixed(2)}</td>
                            <td className="border border-gray-300 p-2">{product.quantity}</td>
                            <td className="border border-gray-300 p-2">
                                <BasicButton onClick={() => alert("Funcionalidad de editar producto en construcción")}className="p-1">
                                    <Pencil size={16} />
                                </BasicButton>
                                <Button onClick={() => alert("Funcionalidad de registrar ajuste en construcción")}>
                                    Registrar ajuste
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg w-96">
                        <h2>Título</h2>
                        <p>Contenido del modal</p>
                        <button onClick={() => setIsOpen(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}