import request from 'supertest';
import express from 'express';

const registerAdjustmentMock = jest.fn();
const listAdjustmentsMock = jest.fn();
const getAdjustmentByIdMock = jest.fn();

jest.mock('../../src/modules/inventory/inventory.service', () => ({
  InventoryService: jest.fn().mockImplementation(() => ({
    registerAdjustment: registerAdjustmentMock,
    listAdjustments: listAdjustmentsMock,
    getAdjustmentById: getAdjustmentByIdMock,
  })),
}));

import { InventoryController } from '../../src/modules/inventory/inventory.controller';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { userId: 1, userName: 'admin@mades.com', roleId: 1 };
    next();
  });
  const controller = new InventoryController();
  app.post('/api/inventory', controller.registerAdjustment.bind(controller));
  app.get('/api/inventory', controller.listAdjustments.bind(controller));
  app.get('/api/inventory/:id', controller.getAdjustmentById.bind(controller));
  return app;
};

const VALID_DTO = { productId: 1, type: 'LOSS', quantity: 5, reason: 'DAMAGED' };
const MOCK_ADJUSTMENT = { id: 1, productId: 1, previousQty: 20, newQty: 15 };

describe('InventoryController', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('POST /api/inventory - Registrar ajuste', () => {
    it('debe retornar 201 con los datos del ajuste cuando el registro es exitoso', async () => {
      registerAdjustmentMock.mockResolvedValue(MOCK_ADJUSTMENT);

      const res = await request(app).post('/api/inventory').send(VALID_DTO);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('debe retornar 400 cuando los datos del ajuste no son válidos', async () => {
      const res = await request(app).post('/api/inventory').send({ productId: 0 });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 400 cuando el stock es insuficiente', async () => {
      registerAdjustmentMock.mockRejectedValue(new Error('Stock insuficiente para registrar la perdida'));

      const res = await request(app).post('/api/inventory').send(VALID_DTO);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 400 cuando el producto no existe', async () => {
      registerAdjustmentMock.mockRejectedValue(new Error('No se encontro producto para el id indicado'));

      const res = await request(app).post('/api/inventory').send(VALID_DTO);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      registerAdjustmentMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).post('/api/inventory').send(VALID_DTO);

      expect(res.status).toBe(500);
      expect(res.body.code).toBe('INTERNAL_ERROR');
    });

    it('debe retornar 401 cuando no hay usuario autenticado', async () => {
      const appSinUser = express();
      appSinUser.use(express.json());
      const controller = new InventoryController();
      appSinUser.post('/api/inventory', controller.registerAdjustment.bind(controller));

      const res = await request(appSinUser).post('/api/inventory').send(VALID_DTO);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/inventory - Listar ajustes', () => {
    it('debe retornar 200 con la lista paginada de ajustes', async () => {
      listAdjustmentsMock.mockResolvedValue({ data: [MOCK_ADJUSTMENT], total: 1, page: 1, pageSize: 20 });

      const res = await request(app).get('/api/inventory');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      listAdjustmentsMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/inventory');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/inventory/:id - Obtener ajuste por id', () => {
    it('debe retornar 200 con los datos del ajuste cuando el id existe', async () => {
      getAdjustmentByIdMock.mockResolvedValue(MOCK_ADJUSTMENT);

      const res = await request(app).get('/api/inventory/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('debe retornar 404 cuando el id no corresponde a ningún ajuste', async () => {
      getAdjustmentByIdMock.mockResolvedValue(null);

      const res = await request(app).get('/api/inventory/999');

      expect(res.status).toBe(404);
    });

    it('debe retornar 400 cuando el id no es un número válido', async () => {
      const res = await request(app).get('/api/inventory/0');

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
});