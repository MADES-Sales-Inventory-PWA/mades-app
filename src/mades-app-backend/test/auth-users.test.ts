jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: {
    users: {
      count:      jest.fn(),
      findFirst:  jest.fn(),
      create:     jest.fn(),
      findUnique: jest.fn(),
    },
    persons: {
      findFirst: jest.fn(),
      create:    jest.fn(),
      update:    jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("../../core/services/token.service", () => ({
  __esModule: true,
  default: {
    generateToken: jest.fn().mockReturnValue("mocked.jwt.token"),
    verifyToken:   jest.fn(),
  },
}));

import request from "supertest";
import express, { Express } from "express";
import prisma from "../../config/prisma";
import userRoutes from "../../modules/users/users.routes";
import authRoutes  from "../../modules/auth/auth.routes";

const buildApp = (): Express => {
  const app = express();
  app.use(express.json());
  app.use("/api/users", userRoutes);
  app.use("/api/auth",  authRoutes);
  return app;
};

const app = buildApp();
const mockPrisma = prisma as any;


const ADMIN_SECRET = "SECRET_CODE";

const validAdminPayload = {
  name:                 "Juan",
  lastName:             "Perez",
  email:                "admin@test.com",
  phoneNumber:          "3001234567",
  documentType:         "CC",
  documentNumber:       "123456789",
  password:             "Password123",
  rolId:                1,
  firstAdminSecretCode: ADMIN_SECRET,
  state:                true,
};

const dbUser = {
  id:       BigInt(1),
  userName: "admin@test.com",
  password: "Password123",
  rolId:    BigInt(1),
};

const mockCreatedUser = {
  id:       BigInt(1),
  userName: "admin@test.com",
  password: "Password123",
  rolId:    BigInt(1),
  Persons: [
    {
      id:             BigInt(1),
      name:           "Juan",
      lastName:       "Perez",
      email:          "admin@test.com",
      phoneNumber:    "3001234567",
      documentType:   "CC",
      documentNumber: "123456789",
      state:          true,
      userId:         BigInt(1),
    },
  ],
  Roles: { id: BigInt(1), rolName: "ADMIN" },
};

describe("GET /api/users/admin-exists", () => {
  beforeEach(() => jest.clearAllMocks());

  it("devuelve exists: false cuando no hay administradores", async () => {
    mockPrisma.users.count.mockResolvedValue(0);

    const res = await request(app).get("/api/users/admin-exists");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exists).toBe(false);
  });

  it("devuelve exists: true cuando ya existe al menos un administrador", async () => {
    mockPrisma.users.count.mockResolvedValue(2);

    const res = await request(app).get("/api/users/admin-exists");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exists).toBe(true);
  });

  it("devuelve 500 cuando Prisma lanza un error inesperado", async () => {
    mockPrisma.users.count.mockRejectedValue(new Error("DB connection failed"));

    const res = await request(app).get("/api/users/admin-exists");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("verifica que se consulta solo por rolId 1 (ADMIN)", async () => {
    mockPrisma.users.count.mockResolvedValue(0);

    await request(app).get("/api/users/admin-exists");

    expect(mockPrisma.users.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ rolId: BigInt(1) }),
      })
    );
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  const validCredentials = {
    userName: "admin@test.com",
    password: "Password123",
  };

  it("retorna token y datos del usuario con credenciales correctas", async () => {
    mockPrisma.users.findFirst.mockResolvedValue(dbUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send(validCredentials);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      token: "mocked.jwt.token",
      user: {
        id:       1,
        userName: "admin@test.com",
        roleId:   1,
      },
    });
  });

  it("retorna 401 cuando las credenciales son incorrectas", async () => {
    mockPrisma.users.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ userName: "admin@test.com", password: "wrong_password" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("AUTHORIZATION_ERROR");
  });

  it("retorna 400 cuando falta el campo userName", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "Password123" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("retorna 400 cuando falta el campo password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ userName: "admin@test.com" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("retorna 400 cuando el body esta completamente vacio", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  });

  it("normaliza userName: elimina espacios y convierte a minusculas", async () => {
    mockPrisma.users.findFirst.mockResolvedValue(dbUser);

    await request(app)
      .post("/api/auth/login")
      .send({ userName: "  ADMIN@TEST.COM  ", password: "Password123" });

    expect(mockPrisma.users.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userName: "admin@test.com",
          password: "Password123",
        }),
      })
    );
  });

  it("retorna 500 cuando Prisma lanza un error inesperado en login", async () => {
    mockPrisma.users.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await request(app)
      .post("/api/auth/login")
      .send(validCredentials);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("INTERNAL_ERROR");
  });
});

describe("POST /api/users/register-initial-admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FIRST_ADMIN_SECRET_CODE = ADMIN_SECRET;
  });

  afterAll(() => {
    delete process.env.FIRST_ADMIN_SECRET_CODE;
  });

  const setupHappyPath = () => {
    mockPrisma.users.count.mockResolvedValue(0);
    mockPrisma.persons.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (cb: Function) => cb(mockPrisma));
    mockPrisma.users.create.mockResolvedValue(mockCreatedUser);
    mockPrisma.users.findUnique.mockResolvedValue(mockCreatedUser);
    mockPrisma.persons.create.mockResolvedValue(mockCreatedUser.Persons[0]);
  };

  it("crea el primer admin exitosamente con codigo secreto correcto", async () => {
    setupHappyPath();

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send(validAdminPayload);

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/exitosamente/i);
  });

  it("rechaza con 400 cuando el codigo secreto es incorrecto", async () => {
    mockPrisma.users.count.mockResolvedValue(0);

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send({ ...validAdminPayload, firstAdminSecretCode: "CODIGO_MALO" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/codigo de validacion invalido/i);
  });

  it("rechaza con 400 cuando falta el codigo secreto completamente", async () => {
    mockPrisma.users.count.mockResolvedValue(0);

    const { firstAdminSecretCode, ...withoutSecret } = validAdminPayload;

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send(withoutSecret);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("retorna 400 si falta el campo email", async () => {
    const { email, ...withoutEmail } = validAdminPayload;

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send(withoutEmail);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("retorna 400 si la contrasena tiene menos de 8 caracteres", async () => {
    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send({ ...validAdminPayload, password: "short" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/al menos 8 caracteres/i);
  });

  it("retorna 400 si el tipo de documento no es valido", async () => {
    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send({ ...validAdminPayload, documentType: "DNI" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/tipo de documento no valido/i);
  });

  it("retorna 400 si el email tiene formato invalido", async () => {
    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send({ ...validAdminPayload, email: "no-es-un-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/correo electronico/i);
  });

  it("retorna 400 si el email ya esta registrado en la DB", async () => {
    mockPrisma.users.count.mockResolvedValue(0);
    mockPrisma.persons.findFirst.mockResolvedValue({
      id:    BigInt(99),
      email: "admin@test.com",
    });

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send(validAdminPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/correo electronico ya se encuentra registrado/i);
  });

  it("retorna 400 si el numero de documento ya existe en la DB", async () => {
    mockPrisma.users.count.mockResolvedValue(0);
    mockPrisma.persons.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id:             BigInt(50),
        documentNumber: "123456789",
      });

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send(validAdminPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/tipo y numero de documento/i);
  });

  it("responde 201 si ya existe un admin (service no crea nada, no lanza error)", async () => {
    mockPrisma.users.count.mockResolvedValue(1);

    const res = await request(app)
      .post("/api/users/register-initial-admin")
      .send({ ...validAdminPayload, firstAdminSecretCode: "CODIGO_MALO" });

    expect(res.status).toBe(201);
  });
});