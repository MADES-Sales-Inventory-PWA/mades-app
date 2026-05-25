import request from 'supertest';
import express from 'express';

const createProductMock = jest.fn();
const updateProductMock = jest.fn();
const listProductsMock = jest.fn();
const getProductByIdMock = jest.fn();
const setProductStateMock = jest.fn();

jest.mock('../../src/modules/products/products.service', () => ({
  ProductsService: jest.fn().mockImplementation(() => ({
    createProduct: createProductMock,
    updateProduct: updateProductMock,
    listProducts: listProductsMock,
    getProductById: getProductByIdMock,
    setProductState: setProductStateMock,
  })),
}));

import { ProductsController } from '../../src/modules/products/products.controller';
import { NotFoundError } from '../../src/shared/errors/not-found-error-codes';
import { ConflictError } from '../../src/shared/errors/conflict-error-codes';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => { req.validatedQuery = req.query; next(); });
  const controller = new ProductsController();
  app.post('/api/products', controller.createProduct.bind(controller));
  app.patch('/api/products/:id/state', controller.setProductState.bind(controller));
  app.patch('/api/products/:id', controller.updateProduct.bind(controller));
  app.get('/api/products', controller.listProducts.bind(controller));
  app.get('/api/products/:id', controller.getProductById.bind(controller));
  return app;
};

const MOCK_PRODUCT = {
  id: 1, name: 'Camiseta', state: true, sizeTypeId: 1, sizeValueId: 1,
  barcode: '12345678', description: null, imageUrl: null,
  purchasePrice: 25000, quantity: 10, minQuantity: 2,
};

const VALID_DTO = {
  name: 'Camiseta', sizeTypeId: 1, sizeValueId: 1, barcode: '12345678',
  purchasePrice: 25000, quantity: 10, minQuantity: 2,
};

describe('ProductsController', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  describe('POST /api/products - Crear producto', () => {
    it('debe retornar 201 con los datos del producto creado', async () => {
      createProductMock.mockResolvedValue(MOCK_PRODUCT);

      const res = await request(app).post('/api/products').send(VALID_DTO);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Camiseta');
    });

    it('debe retornar 404 cuando el tipo o valor de talla no existe', async () => {
      createProductMock.mockRejectedValue(new NotFoundError('El tipo de talla con ID 1 no existe'));

      const res = await request(app).post('/api/products').send(VALID_DTO);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('debe retornar 409 cuando ya existe un producto con el mismo código de barras', async () => {
      createProductMock.mockRejectedValue(new ConflictError('Ya existe un producto con el código de barras 12345678'));

      const res = await request(app).post('/api/products').send(VALID_DTO);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT_ERROR');
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      createProductMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).post('/api/products').send(VALID_DTO);

      expect(res.status).toBe(500);
    });
  });

  describe('PATCH /api/products/:id - Actualizar producto', () => {
    it('debe retornar 200 con los datos del producto actualizado', async () => {
      updateProductMock.mockResolvedValue(MOCK_PRODUCT);

      const res = await request(app).patch('/api/products/1').send({ name: 'Camiseta nueva' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debe retornar 404 cuando el producto no existe', async () => {
      updateProductMock.mockRejectedValue(new NotFoundError('El producto con ID 999 no existe'));

      const res = await request(app).patch('/api/products/999').send({ name: 'Nueva' });

      expect(res.status).toBe(404);
    });

    it('debe retornar 409 cuando el nuevo código de barras ya está en uso', async () => {
      updateProductMock.mockRejectedValue(new ConflictError('Ya existe un producto con el código de barras'));

      const res = await request(app).patch('/api/products/1').send({ barcode: '99999999' });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/products - Listar productos', () => {
    it('debe retornar 200 con la lista de productos', async () => {
      listProductsMock.mockResolvedValue([MOCK_PRODUCT]);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('debe retornar 500 cuando ocurre un error inesperado', async () => {
      listProductsMock.mockRejectedValue(new Error('Error de conexión'));

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/products/:id - Obtener producto por id', () => {
    it('debe retornar 200 con los datos del producto cuando el id existe', async () => {
      getProductByIdMock.mockResolvedValue(MOCK_PRODUCT);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('debe retornar 404 cuando el id no corresponde a ningún producto', async () => {
      getProductByIdMock.mockRejectedValue(new NotFoundError('El producto con ID 999 no existe'));

      const res = await request(app).get('/api/products/999');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/products/:id/state - Cambiar estado', () => {
    it('debe retornar 200 con mensaje de desactivación cuando se envía estado falso', async () => {
      setProductStateMock.mockResolvedValue(undefined);

      const res = await request(app).patch('/api/products/1/state').send({ state: false });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('desactivado');
    });

    it('debe retornar 200 con mensaje de activación cuando se envía estado verdadero', async () => {
      setProductStateMock.mockResolvedValue(undefined);

      const res = await request(app).patch('/api/products/1/state').send({ state: true });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('activado');
    });

    it('debe retornar 404 cuando el producto no existe', async () => {
      setProductStateMock.mockRejectedValue(new NotFoundError('El producto con ID 999 no existe'));

      const res = await request(app).patch('/api/products/999/state').send({ state: false });

      expect(res.status).toBe(404);
    });
  });
});