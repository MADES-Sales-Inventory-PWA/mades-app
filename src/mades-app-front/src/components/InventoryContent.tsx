import React from "react";
import { ORDER_TYPES } from "../constants/documentTypes";
import { Button } from "./Button";
import { Combobox } from "./Combobox";
import { Input } from "./Input";
import { Search } from "lucide-react";
import { ProductsTable } from "./ProductsTable";
import { ProductForm } from "./ProductForm";
import type { Product } from "../types/Types";

const initialProducts: Product[] = [
    {
        "name": "Producto 1",
        "sellingPrice": 12000,
        "size": "500",
        "barcode": "123456789012",
        "description": "Descripción del producto 1",
        "imageUrl": "/imgs/product1.jpg",
        "purchasePrice": 8000,
        "quantity": 50,
        "minQuantity": 10,
        "isActive": true
    },
    {
        "name": "Producto 2",
        "sellingPrice": 20000,
        "size": "500",
        "barcode": "123456789013",
        "description": "Descripción del producto 2",
        "imageUrl": "/imgs/product1.jpg",
        "purchasePrice": 12000,
        "quantity": 50,
        "minQuantity": 10,
        "isActive": false
    }
];

export const InventoryContent = () => {
    const [products, setProducts] = React.useState<Product[]>(initialProducts);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [productCodeToEdit, setProductCodeToEdit] = React.useState("");

    function deactivateProduct(code: string) {
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.barcode === code
                    ? { ...product, isActive: !product.isActive }
                    : product
            )
        );
    }

    function getProductByCode(code: string) {
        return products.find(product => product.barcode === code);
    }
    return (
        <div className="px-4 sm:px-6 lg:px-10">
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Inventario de productos</h2>
                    <p className="mt-2 text-gray-600">Administra los precios y niveles de stock del inventario.</p>
                </div>
                <Button className="w-full md:w-auto" onClick={() => setIsCreateOpen(true)}>
                    Agregar producto
                </Button>
            </div>

            <div className="mt-4 flex w-full flex-col gap-3 rounded-lg bg-white p-3 md:flex-row md:items-end">
                <div className="w-full">
                    <Input type="text" placeholder="Buscar producto..." onChange={() => { }} value="" icon={<Search />} height="h-8" />
                </div>
                <div className="w-full md:w-64">
                    <Combobox options={ORDER_TYPES} placeholder="Ordenar por..." onChange={() => { }} value="" height="h-8" />
                </div>
            </div>

            <ProductsTable json={products} setEditOpen={setIsEditOpen} setProductCodeToEdit={setProductCodeToEdit} deactivateProduct={deactivateProduct} />

            {isCreateOpen && (<ProductForm setIsOpen={setIsCreateOpen} title="Crear producto" actionText="Añadir producto" />)}
            {isEditOpen && (<ProductForm setIsOpen={setIsEditOpen} title="Editar producto" actionText="Guardar cambios" product={getProductByCode(productCodeToEdit)} />)}
        </div>
    );
}