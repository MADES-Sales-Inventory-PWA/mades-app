// test/auth/login.test.ts
import request from 'supertest';
import express from 'express';

// ── El mock debe declararse ANTES de importar el controller ──────────────────
// Jest hace hoisting de jest.mock() al inicio del archivo, pero si el controller
// instancia AuthService en el constructor, necesitamos controlar la instancia.
const loginMock = jest.fn();

jest.mock('src/modules/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      login: loginMock,
    })),
  };
});

import { AuthController } from 'src/modules/auth/auth.controller';

// ── App Express mínima para los tests ────────────────────────────────────────
const buildApp = () => {
  const app = express();
  app.use(express.json());
  const controller = new AuthController();
  app.post('/api/auth/login', controller.login.bind(controller));
  return app;
};

const VALID_CREDENTIALS = {
  userName: 'admin@mades.com',
  password: 'miPassword123',
};

const MOCK_LOGIN_RESPONSE = {
  token: 'jwt.token.mock',
  user: { id: 1, userName: 'admin@mades.com', roleId: 1 },
};

describe('POST /api/auth/login', () => {
  let app: express.Express;

  beforeEach(() => {
    loginMock.mockReset();
    app = buildApp();
  });

  // ─── Login exitoso ──────────────────────────────────────────────────────────

  describe('Login exitoso', () => {
    it('debería retornar 200 con token y datos del usuario', async () => {
      loginMock.mockResolvedValue(MOCK_LOGIN_RESPONSE);

      const res = await request(app)
        .post('/api/auth/login')
        .send(VALID_CREDENTIALS);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.userName).toBe('admin@mades.com');
    });

    it('debería llamar al servicio con las credenciales limpias (trim)', async () => {
      loginMock.mockResolvedValue(MOCK_LOGIN_RESPONSE);

      await request(app)
        .post('/api/auth/login')
        .send({ userName: '  admin@mades.com  ', password: '  miPassword123  ' });

      expect(loginMock).toHaveBeenCalledWith('admin@mades.com', 'miPassword123');
    });
  });

  // ─── Credenciales inválidas ─────────────────────────────────────────────────

  describe('Credenciales inválidas', () => {
    it('debería retornar 401 si el usuario no existe o la clave es incorrecta', async () => {
      loginMock.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ userName: 'noexiste@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('AUTHORIZATION_ERROR');
      expect(res.body.message).toBe('Credenciales inválidas');
    });
  });

  // ─── Errores de validación del schema ──────────────────────────────────────

  describe('Errores de validación', () => {
    it('debería retornar 400 si userName está vacío', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ userName: '', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debería retornar 400 si password está vacío', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ userName: 'admin@test.com', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debería retornar 400 si el body viene vacío', async () => {
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // ─── Errores internos ───────────────────────────────────────────────────────

  describe('Errores internos del servidor', () => {
    it('debería retornar 500 si el servicio lanza una excepción inesperada', async () => {
      loginMock.mockRejectedValue(new Error('DB connection failed'));

      const res = await request(app)
        .post('/api/auth/login')
        .send(VALID_CREDENTIALS);

      expect(res.status).toBe(500);
      expect(res.body.code).toBe('INTERNAL_ERROR');
    });
  });
});