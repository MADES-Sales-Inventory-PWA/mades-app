import request from 'supertest';
import express from 'express';

const adminExistsMock = jest.fn();
const createFirstAdminMock = jest.fn();
const createUserMock = jest.fn();
const updateUserMock = jest.fn();
const getAllMock = jest.fn();
const changeStatusMock = jest.fn();

jest.mock('../../src/modules/users/users.service', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    adminExists: adminExistsMock,
    createFirstAdmin: createFirstAdminMock,
    createUser: createUserMock,
    updateUser: updateUserMock,
    getAll: getAllMock,
    changeStatus: changeStatusMock,
  })),
}));

import { UserController } from '../../src/modules/users/users.controller';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  const controller = new UserController();
  app.get('/api/users/admin-exists', controller.getAdminExists.bind(controller));
  app.post('/api/users/register-initial-admin', controller.createFirstAdmin.bind(controller));
  app.post('/api/users', controller.createUser.bind(controller));
  app.patch('/api/users/:id', controller.updateUser.bind(controller));
  app.get('/api/users', controller.findAll.bind(controller));
  app.patch('/api/users/:id/status', controller.changeStatus.bind(controller));
  return app;
};

const MOCK_USER = {
  id: 1, name: 'Juan', lastName: 'Pérez', email: 'juan@test.com',
  documentType: 'CC', documentNumber: '123456789',
  phoneNumber: '3001234567', state: true,
  user: { id: 1, roleId: 2 },
};

const VALID_DTO = {
  name: 'Juan', lastName: 'Pérez', email: 'juan@test.com',
  phoneNumber: '3001234567', documentType: 'CC',
  documentNumber: '123456789', password: 'Password123', rolId: 2,
};

describe('UserController', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('GET /api/users/admin-exists', () => {
    it('debe retornar 200 con true cuando ya existe un administrador', async () => {
      adminExistsMock.mockResolvedValue(true);

      const res = await request(app).get('/api/users/admin-exists');

      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(true);
    });

    it('debe retornar 200 con false cuando no hay administrador registrado', async () => {
      adminExistsMock.mockResolvedValue(false);

      const res = await request(app).get('/api/users/admin-exists');

      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(false);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      adminExistsMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/users/admin-exists');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/users - Crear usuario', () => {
    it('debe retornar 201 con los datos del usuario creado', async () => {
      createUserMock.mockResolvedValue(MOCK_USER);

      const res = await request(app).post('/api/users').send(VALID_DTO);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('juan@test.com');
    });

    it('debe retornar 400 cuando el correo ya está registrado', async () => {
      createUserMock.mockRejectedValue(new Error('El correo electrónico ya se encuentra registrado'));

      const res = await request(app).post('/api/users').send(VALID_DTO);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('debe retornar 400 cuando el formato del correo es inválido', async () => {
      const res = await request(app).post('/api/users').send({ ...VALID_DTO, email: 'correo-invalido' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/:id - Actualizar usuario', () => {
    it('debe retornar 200 con los datos actualizados del usuario', async () => {
      updateUserMock.mockResolvedValue(MOCK_USER);

      const res = await request(app).patch('/api/users/1').send({ name: 'Carlos' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debe retornar 400 cuando el usuario no existe', async () => {
      updateUserMock.mockRejectedValue(new Error('Usuario no encontrado'));

      const res = await request(app).patch('/api/users/999').send({ name: 'Carlos' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users - Listar usuarios', () => {
    it('debe retornar 200 con la lista de usuarios', async () => {
      getAllMock.mockResolvedValue([MOCK_USER]);

      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('debe retornar 200 con lista vacía cuando no hay usuarios', async () => {
      getAllMock.mockResolvedValue([]);

      const res = await request(app).get('/api/users');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('PATCH /api/users/:id/status - Cambiar estado', () => {
    it('debe retornar 200 con mensaje de activación cuando se envía estado verdadero', async () => {
      changeStatusMock.mockResolvedValue(undefined);

      const res = await request(app).patch('/api/users/1/status').send({ state: true });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Usuario activado');
    });

    it('debe retornar 200 con mensaje de inactivación cuando se envía estado falso', async () => {
      changeStatusMock.mockResolvedValue(undefined);

      const res = await request(app).patch('/api/users/1/status').send({ state: false });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Usuario inactivado');
    });

    it('debe retornar 400 cuando el usuario no existe', async () => {
      changeStatusMock.mockRejectedValue(new Error('Usuario no encontrado'));

      const res = await request(app).patch('/api/users/999/status').send({ state: false });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});