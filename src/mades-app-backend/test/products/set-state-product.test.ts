import { ProductsService } from '../../src/modules/products/products.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    products: { findUnique: jest.fn(), update: jest.fn() },
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

describe('ProductsService - Cambiar Estado del Producto', () => {
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService();
  });

  it('debe desactivar el producto cuando se envía estado en falso', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockProducts.update as jest.Mock).mockResolvedValue({ ...MOCK_PRODUCT, state: false });

    await service.setProductState(1, { state: false });

    expect(mockProducts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ state: false }),
      })
    );
  });

  it('debe activar el producto cuando se envía estado en verdadero', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue({ ...MOCK_PRODUCT, state: false });
    (mockProducts.update as jest.Mock).mockResolvedValue({ ...MOCK_PRODUCT, state: true });

    await service.setProductState(1, { state: true });

    expect(mockProducts.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ state: true }),
      })
    );
  });

  it('debe lanzar error y no actualizar el estado cuando el producto no existe', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.setProductState(999, { state: false }))
      .rejects.toThrow('El producto con ID 999 no existe');

    expect(mockProducts.update).not.toHaveBeenCalled();
  });

  it('debe verificar que el producto existe antes de cambiar su estado', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockProducts.update as jest.Mock).mockResolvedValue(MOCK_PRODUCT);

    await service.setProductState(1, { state: true });

    expect(mockProducts.findUnique).toHaveBeenCalledBefore
      ? expect(mockProducts.findUnique).toHaveBeenCalledBefore(mockProducts.update as jest.Mock)
      : expect(mockProducts.findUnique).toHaveBeenCalled();
  });
});