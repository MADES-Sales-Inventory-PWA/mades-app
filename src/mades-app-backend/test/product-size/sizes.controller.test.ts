import request from 'supertest';
import express from 'express';

const listSizeTypesMock = jest.fn();
const listSizeValuesByTypeIdMock = jest.fn();

jest.mock('../../src/modules/product-sizes/sizes.service', () => ({
  SizeService: jest.fn().mockImplementation(() => ({
    listSizeTypes: listSizeTypesMock,
    listSizeValuesByTypeId: listSizeValuesByTypeIdMock,
  })),
}));

import { SizeController } from '../../src/modules/product-sizes/sizes.controller';
import { NotFoundError } from '../../src/shared/errors/not-found-error-codes';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  const controller = new SizeController();
  app.get('/api/sizes/types', controller.listSizeTypes.bind(controller));
  app.get('/api/sizes/values/:id', controller.listSizeValuesByTypeId.bind(controller));
  return app;
};

const MOCK_SIZE_TYPES = [{ id: 1, name: 'Talla de ropa' }, { id: 2, name: 'Talla de zapato' }];
const MOCK_SIZE_VALUES = [{ id: 1, value: 'S' }, { id: 2, value: 'M' }];

describe('SizeController', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('GET /api/sizes/types - Listar tipos de talla', () => {
    it('debe retornar 200 con la lista de tipos de talla', async () => {
      listSizeTypesMock.mockResolvedValue(MOCK_SIZE_TYPES);

      const res = await request(app).get('/api/sizes/types');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('debe retornar 200 con lista vacía cuando no hay tipos registrados', async () => {
      listSizeTypesMock.mockResolvedValue([]);

      const res = await request(app).get('/api/sizes/types');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      listSizeTypesMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/sizes/types');

      expect(res.status).toBe(500);
      expect(res.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/sizes/values/:id - Listar valores por tipo', () => {
    it('debe retornar 200 con los valores de talla del tipo indicado', async () => {
      listSizeValuesByTypeIdMock.mockResolvedValue(MOCK_SIZE_VALUES);

      const res = await request(app).get('/api/sizes/values/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('debe retornar 404 cuando el tipo de talla no existe', async () => {
      listSizeValuesByTypeIdMock.mockRejectedValue(new NotFoundError('El tipo de talla con ID 999 no existe'));

      const res = await request(app).get('/api/sizes/values/999');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('debe retornar 400 cuando el id no tiene formato válido', async () => {
      const res = await request(app).get('/api/sizes/values/abc');

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      listSizeValuesByTypeIdMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/sizes/values/1');

      expect(res.status).toBe(500);
      expect(res.body.code).toBe('INTERNAL_ERROR');
    });
  });
});