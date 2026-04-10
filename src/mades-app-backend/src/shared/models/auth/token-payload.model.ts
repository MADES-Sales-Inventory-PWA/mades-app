export type TokenPayload = {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  documentType: "CC" | "CE" | "PASSPORT";
  documentNumber: string;
};

export function isTokenPayload(value: unknown): value is TokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const documentType = payload.documentType;

  return (
    typeof payload.name === "string" && payload.name.length > 0 &&
    typeof payload.lastName === "string" && payload.lastName.length > 0 &&
    typeof payload.email === "string" && payload.email.length > 0 &&
    typeof payload.phoneNumber === "string" && payload.phoneNumber.length > 0 &&
    typeof payload.documentNumber === "string" && payload.documentNumber.length > 0 &&
    (documentType === "CC" || documentType === "CE" || documentType === "PASSPORT")
  );
}