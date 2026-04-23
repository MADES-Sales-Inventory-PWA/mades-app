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
        <div className="px-10">
            <div className=" w-full flex flex-row justify-start">
                <div>
                    <h2 className="text-3xl font-semibold text-gray-800">Inventario de productos</h2>
                    <p className="text-gray-600 mt-2">Administra los precios y niveles de stock del inventario.</p>
                </div>
                <Button className="ml-auto my-auto" onClick={() => setIsCreateOpen(true)}>
                    Agregar producto
                </Button>

            </div>

            <div className="flex flex-row w-full rounded-lg bg-white p-3 mt-4">
                <Input type="text" placeholder="Buscar producto..." onChange={() => { }} value="" icon={<Search />} height="h-8" />
                <Combobox className="ml-4" options={ORDER_TYPES} placeholder="Ordenar por..." onChange={() => { }} value="" height="h-8" />
            </div>

            <ProductsTable json={products} setEditOpen={setIsEditOpen} setProductCodeToEdit={setProductCodeToEdit} deactivateProduct={deactivateProduct} />

            {isCreateOpen && (<ProductForm setIsOpen={setIsCreateOpen} title="Crear producto" actionText="Añadir producto" />)}
            {isEditOpen && (<ProductForm setIsOpen={setIsEditOpen} title="Editar producto" actionText="Guardar cambios" product={getProductByCode(productCodeToEdit)} />)}
        </div>
    );
}