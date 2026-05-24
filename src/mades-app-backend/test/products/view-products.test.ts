import { ProductsService } from '../../src/modules/products/products.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    products: { findUnique: jest.fn(), findMany: jest.fn() },
    productDetails: {},
  }
}));

import prisma from '../../src/config/prisma';

const mockProducts = prisma.products as jest.Mocked<typeof prisma.products>;

const MOCK_PRODUCT = {
  id: 1n,
  name: 'Camiseta básica',
  state: true,
  sizeTypeId: 1n,
  sizeValueId: 1n,
  barcode: '12345678',
  description: null,
  imageUrl: null,
  sellingPrice: { toNumber: () => 25000 },
  lastUpdate: new Date(),
  lastSyncDate: new Date(),
  productDetails: [{ purchasePrice: { toNumber: () => 25000 }, quantity: 10n, minQuantity: 2n }],
};

describe('ProductsService - Ver Productos', () => {
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService();
  });

  describe('listProducts()', () => {
    it('debe retornar la lista de productos registrados', async () => {
      (mockProducts.findMany as jest.Mock).mockResolvedValue([MOCK_PRODUCT]);

      const result = await service.listProducts({ });

      expect(result).toHaveLength(1);
    });

    it('debe retornar lista vacía cuando no hay productos registrados', async () => {
      (mockProducts.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.listProducts({ });

      expect(result).toHaveLength(0);
    });

    it('debe retornar el id como número entero en cada producto', async () => {
      (mockProducts.findMany as jest.Mock).mockResolvedValue([MOCK_PRODUCT]);

      const result = await service.listProducts({ });

      expect(typeof result[0].id).toBe('number');
    });

    it('debe filtrar los productos cuyo stock es igual o menor al mínimo cuando se indica bajo stock', async () => {
      const lowStockProduct = {
        ...MOCK_PRODUCT,
        productDetails: [{ purchasePrice: { toNumber: () => 25000 }, quantity: 2n, minQuantity: 2n }],
      };
      const normalProduct = {
        ...MOCK_PRODUCT,
        id: 2n,
        productDetails: [{ purchasePrice: { toNumber: () => 25000 }, quantity: 10n, minQuantity: 2n }],
      };
      (mockProducts.findMany as jest.Mock).mockResolvedValue([lowStockProduct, normalProduct]);

      const result = await service.listProducts({ lowStock: true });

      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBeLessThanOrEqual(result[0].minQuantity);
    });

    it('debe buscar productos cuyo nombre contenga el texto indicado sin distinguir mayúsculas', async () => {
      (mockProducts.findMany as jest.Mock).mockResolvedValue([]);

      await service.listProducts({ search: 'camiseta' });

      expect(mockProducts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: expect.objectContaining({ contains: 'camiseta', mode: 'insensitive' }),
          }),
        })
      );
    });

    it('debe filtrar por estado activo o inactivo cuando se indica', async () => {
      (mockProducts.findMany as jest.Mock).mockResolvedValue([]);

      await service.listProducts({ state: false });

      expect(mockProducts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ state: false }),
        })
      );
    });
  });

  describe('getProductById()', () => {
    it('debe retornar el producto con sus datos cuando el id existe', async () => {
      (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);

      const result = await service.getProductById(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Camiseta básica');
    });

    it('debe lanzar error cuando el id no corresponde a ningún producto registrado', async () => {
      (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProductById(999))
        .rejects.toThrow('El producto con ID 999 no existe');
    });

    it('debe retornar el id, precio, cantidad y cantidad mínima como números enteros', async () => {
      (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);

      const result = await service.getProductById(1);

      expect(typeof result.id).toBe('number');
      expect(typeof result.quantity).toBe('number');
      expect(typeof result.minQuantity).toBe('number');
    });
  });
});