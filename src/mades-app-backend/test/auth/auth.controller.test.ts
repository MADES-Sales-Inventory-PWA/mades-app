import request from 'supertest';
import express from 'express';

const loginMock = jest.fn();

jest.mock('../../src/modules/auth/auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    login: loginMock,
  })),
}));

import { AuthController } from '../../src/modules/auth/auth.controller';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  const controller = new AuthController();
  app.post('/api/auth/login', controller.login.bind(controller));
  return app;
};

const VALID_CREDENTIALS = { userName: 'admin@mades.com', password: 'Password123' };
const MOCK_RESPONSE = { token: 'jwt.token', user: { id: 1, userName: 'admin@mades.com', roleId: 1 } };

describe('AuthController - POST /api/auth/login', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  it('debe retornar 200 con el token y datos del usuario cuando las credenciales son correctas', async () => {
    loginMock.mockResolvedValue(MOCK_RESPONSE);

    const res = await request(app).post('/api/auth/login').send(VALID_CREDENTIALS);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('debe retornar 401 cuando las credenciales no corresponden a ningún usuario', async () => {
    loginMock.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send(VALID_CREDENTIALS);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTHORIZATION_ERROR');
  });

  it('debe retornar 400 cuando el nombre de usuario está vacío', async () => {
    const res = await request(app).post('/api/auth/login').send({ userName: '', password: 'Password123' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 400 cuando la contraseña está vacía', async () => {
    const res = await request(app).post('/api/auth/login').send({ userName: 'admin@mades.com', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 400 cuando el cuerpo de la solicitud viene vacío', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 500 cuando el servicio lanza un error inesperado', async () => {
    loginMock.mockRejectedValue(new Error('Error de conexión'));

    const res = await request(app).post('/api/auth/login').send(VALID_CREDENTIALS);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });
});