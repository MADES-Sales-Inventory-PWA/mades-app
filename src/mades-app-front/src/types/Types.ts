export type Product = {
  id: number;
    name: string;
    sellingPrice: number;
    size: string;
    barcode: string;
    description: string;
    imageUrl: string;
    purchasePrice: number;
    quantity: number;
    minQuantity: number;
    isActive: boolean;
};

export type SizeType = "letras" | "numerica";

export type ProductSize = {
  talla: string;
  cantidadExistente: number;
  unidadesAlerta: number;
};