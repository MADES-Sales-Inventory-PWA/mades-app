import { constants } from "../constants/Constants";
import { getAuthHeaders } from "../utils/auth";

export type BackendProduct = {
  id: number;
  name: string;
  state: boolean;
  sizeTypeId: number;
  sizeValueId: number;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  purchasePrice: number;
  quantity: number;
  minQuantity: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function getProductsUrl() {
  return `${constants.BACKEND_BASE_URL}/api/products`;
}

function getProductStateUrl(id: number) {
  return `${getProductsUrl()}/${id}/state`;
}

export function mapBackendProductToFrontend(product: BackendProduct) {
  return {
    id: product.id,
    name: product.name,
    sellingPrice: product.purchasePrice,
    size: String(product.sizeValueId),
    barcode: product.barcode ?? "",
    description: product.description ?? "",
    imageUrl: product.imageUrl ?? "",
    purchasePrice: product.purchasePrice,
    quantity: product.quantity,
    minQuantity: product.minQuantity,
    isActive: product.state,
  };
}

export async function fetchProducts() {
  const response = await fetch(getProductsUrl(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  const payload = (await response.json()) as ApiResponse<BackendProduct[]>;
  return payload.data.map(mapBackendProductToFrontend);
}

export async function toggleProductState(id: number, state: boolean) {
  const response = await fetch(getProductStateUrl(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    throw new Error("No se pudo cambiar el estado del producto");
  }

  return (await response.json()) as ApiResponse<null>;
}