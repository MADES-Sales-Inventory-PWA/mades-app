import React from "react";
import { ORDER_TYPES } from "../constants/documentTypes";
import { Button } from "./Button";
import { Combobox } from "./Combobox";
import { Input } from "./Input";
import { Search } from "lucide-react";
import { ProductsTable } from "./ProductsTable";
import { ProductForm } from "./ProductForm";
import type { Product } from "../types/Types";
import { fetchProducts, toggleProductState } from "../services/products";

const initialProducts: Product[] = [
    {
        id: 1,
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
        id: 2,
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
    const [products, setProducts] = React.useState<Product[]>([]);
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isEditOpen, setIsEditOpen] = React.useState(false);
    const [productIdToEdit, setProductIdToEdit] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    React.useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                const remoteProducts = await fetchProducts();

                if (isMounted) {
                    setProducts(remoteProducts);
                }
            } catch {
                if (isMounted) {
                    setErrorMessage("No se pudieron cargar los productos desde el backend.");
                    setProducts(initialProducts);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    async function deactivateProduct(id: number) {
        const currentProduct = products.find((product) => product.id === id);

        if (!currentProduct) {
            return;
        }

        const nextState = !currentProduct.isActive;

        try {
            await toggleProductState(id, nextState);

            setProducts((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === id
                        ? { ...product, isActive: nextState }
                        : product
                )
            );
        } catch {
            setErrorMessage("No se pudo actualizar el estado del producto.");
        }
    }

    function getProductById(id: number | null) {
        return products.find(product => product.id === id);
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

            {errorMessage && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">
                    Cargando productos...
                </div>
            ) : (
                <ProductsTable json={products} setEditOpen={setIsEditOpen} setProductIdToEdit={setProductIdToEdit} deactivateProduct={deactivateProduct} />
            )}

            {isCreateOpen && (<ProductForm setIsOpen={setIsCreateOpen} title="Crear producto" actionText="Añadir producto" />)}
            {isEditOpen && (<ProductForm setIsOpen={setIsEditOpen} title="Editar producto" actionText="Guardar cambios" product={getProductById(productIdToEdit)} />)}
        </div>
    );
}