import { constants } from "../constants/Constants";
import { getAuthHeaders } from "../utils/auth";

export type SizeTypeDTO = {
  id: number;
  name: string;
};

export type SizeValueDTO = {
  id: number;
  value: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ErrorPayload = {
  message?: string;
  error?: {
    message?: string;
  };
};

async function getBackendErrorMessage(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as ErrorPayload | null;
  return payload?.message ?? payload?.error?.message ?? fallbackMessage;
}

function getSizesTypesUrl() {
  return `${constants.BACKEND_BASE_URL}/api/sizes/types`;
}

function getSizeValuesUrl(sizeTypeId: number) {
  return `${constants.BACKEND_BASE_URL}/api/sizes/values/${sizeTypeId}`;
}

export async function fetchSizeTypes() {
  const response = await fetch(getSizesTypesUrl(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const message = await getBackendErrorMessage(response, "No se pudieron obtener los tipos de talla");
    throw new Error(message);
  }

  const payload = (await response.json()) as ApiResponse<SizeTypeDTO[]>;
  return payload.data;
}

export async function fetchSizeValues(sizeTypeId: number) {
  const response = await fetch(getSizeValuesUrl(sizeTypeId), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const message = await getBackendErrorMessage(response, "No se pudieron obtener los valores de talla");
    throw new Error(message);
  }

  const payload = (await response.json()) as ApiResponse<SizeValueDTO[]>;
  return payload.data;
}
