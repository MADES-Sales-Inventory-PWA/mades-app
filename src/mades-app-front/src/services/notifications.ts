import { constants } from "../constants/Constants";
import { authFetch } from "../utils/apiFetch";

export type NotificationProduct = {
  id: number;
  name: string;
  barcode: string;
};

export type NotificationItem = {
  currentStock: number;
  minStock: number;
  createdAt: string;
  product: NotificationProduct;
};

type NotificationsResponse = {
  success: boolean;
  message: string;
  data: NotificationItem[];
};

type NotificationCountResponse = {
  success: boolean;
  message: string;
  count: number;
};

async function parseErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: { message?: string };
  } | null;

  return payload?.message ?? payload?.error?.message ?? fallback;
}

function getNotificationsUrl() {
  return constants.getBackendUrl("/api/notifications");
}

function getNotificationsCountUrl() {
  return constants.getBackendUrl("/api/notifications/count");
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const response = await authFetch(getNotificationsUrl());

  if (!response.ok) {
    const message = await parseErrorMessage(response, "No se pudieron obtener las notificaciones");
    throw new Error(message);
  }

  const payload = (await response.json()) as NotificationsResponse;
  return payload.data ?? [];
}

export async function fetchNotificationsCount(): Promise<number> {
  const response = await authFetch(getNotificationsCountUrl());

  if (!response.ok) {
    const message = await parseErrorMessage(response, "No se pudo obtener la cantidad de notificaciones");
    throw new Error(message);
  }

  const payload = (await response.json()) as NotificationCountResponse;
  return payload.count ?? 0;
}