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
    throw new Error("No se pudieron obtener los tipos de talla");
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
    throw new Error("No se pudieron obtener los valores de talla");
  }

  const payload = (await response.json()) as ApiResponse<SizeValueDTO[]>;
  return payload.data;
}
