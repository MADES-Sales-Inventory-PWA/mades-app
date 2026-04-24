import { constants } from "../constants/Constants";
import { getAuthHeaders } from "../utils/auth";

export type InventoryAdjustmentType = "LOSS" | "GAIN";
export type InventoryAdjustmentReason =
  | "DAMAGED"
  | "LOST"
  | "STOLEN"
  | "RETURN"
  | "RESTOCK"
  | "MANUAL";

export type CreateInventoryAdjustmentPayload = {
  productId: number;
  type: InventoryAdjustmentType;
  quantity: number;
  reason: InventoryAdjustmentReason;
  notes?: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type RegisteredAdjustment = {
  id: number;
  productId: number;
  barcode: string;
  previousQty: number;
  newQty: number;
};

function getInventoryAdjustmentsUrl() {
  return `${constants.BACKEND_BASE_URL}/api/inventory/adjustments`;
}

export async function createInventoryAdjustment(payload: CreateInventoryAdjustmentPayload) {
  const response = await fetch(getInventoryAdjustmentsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message = errorPayload?.error?.message ?? "No se pudo registrar el ajuste de inventario";
    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<RegisteredAdjustment>;
}
