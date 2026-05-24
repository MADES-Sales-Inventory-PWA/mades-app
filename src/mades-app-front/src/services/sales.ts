import { constants } from "../constants/Constants";
import { authFetch } from "../utils/apiFetch";
import { salesDb } from "../sw/db/sales.db";

export type SaleItem = {
  productId: number;
  quantity: number;
  price: number;
};

export type CreateSalePayload = {
  items: SaleItem[];
  notes?: string;
  syncPendingSale?: boolean;
};

export type CreateSaleOptions = {
  syncPendingSale?: boolean;
};

export type RegisteredSale = {
  id: number;
  invoiceNumber: string;
  total: number;
  itemCount: number;
  offline?: boolean;
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

export async function createSale(
  payload: CreateSalePayload,
  options?: CreateSaleOptions
): Promise<RegisteredSale> {
  const response = await authFetch(getSalesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      ...(options?.syncPendingSale ? { syncPendingSale: true } : {}),
    }),
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

export async function getPendingSalesCount(): Promise<number> {
  return salesDb.countPending();
}

export async function syncPendingSales(): Promise<{ synced: number; failed: number }> {
  const pending = await salesDb.findPending();
  let synced = 0;
  let failed = 0;

  for (const sale of pending) {
    if (sale.id === undefined) continue;

    try {
      await salesDb.updateStatus(sale.id, "syncing");
      await createSale(
        { items: sale.items, notes: sale.notes },
        { syncPendingSale: true }
      );
      await salesDb.delete(sale.id);
      synced++;
    } catch {
      await salesDb.updateStatus(sale.id, "failed");
      failed++;
    }
  }

  return { synced, failed };
}
