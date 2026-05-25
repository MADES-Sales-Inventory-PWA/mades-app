import request from 'supertest';
import express from 'express';

const registerSaleMock = jest.fn();

jest.mock('../../src/modules/sales/sales.service', () => ({
  SalesService: jest.fn().mockImplementation(() => ({
    registerSale: registerSaleMock,
  })),
}));

import { SalesController } from '../../src/modules/sales/sales.controller';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.user = { userId: 1, userName: 'admin@mades.com', roleId: 1 };
    next();
  });
  const controller = new SalesController();
  app.post('/api/sales', controller.registerSale.bind(controller));
  return app;
};

const VALID_DTO = { items: [{ productId: 1, quantity: 2, price: 25000 }] };
const MOCK_SALE = { id: 1, invoiceNumber: 'INV-001', total: 50000, itemCount: 1 };

describe('SalesController - POST /api/sales', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  it('debe retornar 201 con los datos de la venta registrada', async () => {
    registerSaleMock.mockResolvedValue(MOCK_SALE);

    const res = await request(app).post('/api/sales').send(VALID_DTO);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.invoiceNumber).toBe('INV-001');
  });

  it('debe retornar 400 cuando la lista de productos viene vacía', async () => {
    const res = await request(app).post('/api/sales').send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 400 cuando el stock es insuficiente', async () => {
    registerSaleMock.mockRejectedValue(new Error('Stock insuficiente para "Camiseta". Disponible: 1'));

    const res = await request(app).post('/api/sales').send(VALID_DTO);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 400 cuando el producto no está activo', async () => {
    registerSaleMock.mockRejectedValue(new Error('El producto "Camiseta" no está activo'));

    const res = await request(app).post('/api/sales').send(VALID_DTO);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('debe retornar 500 cuando ocurre un error inesperado', async () => {
    registerSaleMock.mockRejectedValue(new Error('Error de conexión'));

    const res = await request(app).post('/api/sales').send(VALID_DTO);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });

  it('debe retornar 401 cuando no hay usuario autenticado', async () => {
    const appSinUser = express();
    appSinUser.use(express.json());
    const controller = new SalesController();
    appSinUser.post('/api/sales', controller.registerSale.bind(controller));

    const res = await request(appSinUser).post('/api/sales').send(VALID_DTO);

    expect(res.status).toBe(401);
  });
});