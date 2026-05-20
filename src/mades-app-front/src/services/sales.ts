import { constants } from "../constants/Constants";
import { getAuthHeaders } from "../utils/auth";
import { fetchProducts } from "./products";
import {
  cacheProducts,
  getPendingSales,
  deletePendingSale,
  updatePendingSaleStatus,
} from "../db/salesDB";

export type SaleItem = {
  productId: number;
  quantity: number;
  price: number;
};

export type CreateSalePayload = {
  items: SaleItem[];
  notes?: string;
};

export type RegisteredSale = {
  id: number;
  invoiceNumber: string;
  total: number;
  itemCount: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function getSalesUrl() {
  return `${constants.BACKEND_BASE_URL}/api/sales`;
}

async function getBackendErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: { message?: string };
  } | null;
  return payload?.message ?? payload?.error?.message ?? fallback;
}

export async function createSale(payload: CreateSalePayload): Promise<RegisteredSale> {
  const response = await fetch(getSalesUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await getBackendErrorMessage(
      response,
      "No se pudo registrar la venta"
    );
    throw new Error(message);
  }

  const res = (await response.json()) as ApiResponse<RegisteredSale>;
  return res.data;
}

export async function refreshProductsCache(): Promise<void> {
  const products = await fetchProducts();
  await cacheProducts(products);
}

export async function syncPendingSales(): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingSales();
  let synced = 0;
  let failed = 0;

  for (const sale of pending) {
    if (sale.id === undefined) continue;

    try {
      await updatePendingSaleStatus(sale.id, "syncing");
      await createSale({ items: sale.items, notes: sale.notes });
      await deletePendingSale(sale.id);
      synced++;
    } catch {
      await updatePendingSaleStatus(sale.id, "failed");
      failed++;
    }
  }

  return { synced, failed };
}
