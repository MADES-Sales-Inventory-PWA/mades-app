export type SizeType = "letras" | "numerica";

export type ProductSize = {
  talla: string;
  cantidadExistente: number;
  unidadesAlerta: number;
};

export type ProductRecord = {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  tipoTalla: SizeType;
  tallasRegistradas: ProductSize[];
};

export const mockProducts: ProductRecord[] = [
  {
    sku: "7401234567890",
    nombre: "Camiseta Básica",
    descripcion: "Camiseta de algodón 100% para uso diario.",
    precio: 25000,
    imagen: "https://via.placeholder.com/200?text=Camiseta",
    tipoTalla: "letras",
    tallasRegistradas: [
      { talla: "S", cantidadExistente: 18, unidadesAlerta: 6 },
      { talla: "M", cantidadExistente: 45, unidadesAlerta: 10 },
      { talla: "L", cantidadExistente: 12, unidadesAlerta: 6 },
    ],
  },
  {
    sku: "7401234567891",
    nombre: "Pantalón Denim",
    descripcion: "Pantalón denim azul oscuro de corte recto.",
    precio: 65000,
    imagen: "https://via.placeholder.com/200?text=Pantalon",
    tipoTalla: "numerica",
    tallasRegistradas: [
      { talla: "30", cantidadExistente: 6, unidadesAlerta: 5 },
      { talla: "32", cantidadExistente: 3, unidadesAlerta: 5 },
      { talla: "34", cantidadExistente: 0, unidadesAlerta: 4 },
    ],
  },
  {
    sku: "7401234567892",
    nombre: "Sudadera Deportiva",
    descripcion: "Sudadera de poliéster con secado rápido.",
    precio: 45000,
    imagen: "https://via.placeholder.com/200?text=Sudadera",
    tipoTalla: "letras",
    tallasRegistradas: [
      { talla: "M", cantidadExistente: 0, unidadesAlerta: 8 },
      { talla: "L", cantidadExistente: 7, unidadesAlerta: 8 },
      { talla: "XL", cantidadExistente: 2, unidadesAlerta: 6 },
    ],
  },
  {
    sku: "7401234567893",
    nombre: "Polo Clasico",
    descripcion: "Polo de algodón premium con acabado suave.",
    precio: 35000,
    imagen: "https://via.placeholder.com/200?text=Polo",
    tipoTalla: "letras",
    tallasRegistradas: [
      { talla: "M", cantidadExistente: 42, unidadesAlerta: 12 },
      { talla: "L", cantidadExistente: 38, unidadesAlerta: 10 },
      { talla: "XL", cantidadExistente: 40, unidadesAlerta: 12 },
    ],
  },
  {
    sku: "7401234567894",
    nombre: "Chaqueta Casual",
    descripcion: "Chaqueta de lona liviana para clima fresco.",
    precio: 85000,
    imagen: "https://via.placeholder.com/200?text=Chaqueta",
    tipoTalla: "letras",
    tallasRegistradas: [
      { talla: "S", cantidadExistente: 5, unidadesAlerta: 5 },
      { talla: "M", cantidadExistente: 8, unidadesAlerta: 10 },
      { talla: "L", cantidadExistente: 3, unidadesAlerta: 6 },
    ],
  },
];

export const getProductBySku = (sku: string) =>
  mockProducts.find((product) => product.sku === sku);

export const getTotalUnits = (product: ProductRecord) =>
  product.tallasRegistradas.reduce((total, size) => total + size.cantidadExistente, 0);