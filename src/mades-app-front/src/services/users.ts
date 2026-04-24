import { constants } from "../constants/Constants";
import { getAuthHeaders } from "../utils/auth";

export type EmployeeItem = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  state: boolean;
  user: {
    id: number;
    roleId: number;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function getUsersUrl() {
  return `${constants.BACKEND_BASE_URL}/api/users`;
}

function getUserStatusUrl(id: number) {
  return `${getUsersUrl()}/${id}/status`;
}

export async function fetchEmployees() {
  const url = new URL(getUsersUrl());
  url.searchParams.set("rolId", String(constants.EMPLOYEE_ROLE_ID));

  const response = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener los empleados");
  }

  const payload = (await response.json()) as ApiResponse<Array<EmployeeItem | null>>;
  return payload.data.filter((employee): employee is EmployeeItem => employee !== null);
}

export async function changeEmployeeStatus(id: number, state: boolean) {
  const response = await fetch(getUserStatusUrl(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message ?? "No se pudo cambiar el estado del empleado";
    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<null>;
}
