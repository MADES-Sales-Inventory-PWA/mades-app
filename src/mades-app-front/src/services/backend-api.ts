type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: {
    id: string | number;
    name: string;
    lastName: string;
    email: string;
  };
};

export class BackendApi {
  private readonly baseUrl: string;

  constructor(baseUrl = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let data: any;

    try {
      data = await response.json();
    } catch {
      throw new Error("El backend devolvió una respuesta inválida");
    }

    if (!response.ok) {
      throw new Error(data.message || "No fue posible iniciar sesión");
    }

    const normalizedResponse = data?.token
      ? data
      : data?.data;

    if (!normalizedResponse?.token || !normalizedResponse?.user) {
      throw new Error("Respuesta de login incompleta desde el backend");
    }

    return normalizedResponse as LoginResponse;
  }
}

export const backendApi = new BackendApi();
