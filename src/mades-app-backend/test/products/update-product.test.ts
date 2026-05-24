import { ProductsService } from '../../src/modules/products/products.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    sizeTypes: { findUnique: jest.fn() },
    sizeValues: { findFirst: jest.fn() },
    products: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    productDetails: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockSizeTypes = prisma.sizeTypes as jest.Mocked<typeof prisma.sizeTypes>;
const mockSizeValues = prisma.sizeValues as jest.Mocked<typeof prisma.sizeValues>;
const mockProducts = prisma.products as jest.Mocked<typeof prisma.products>;
const mockTransaction = prisma.$transaction as jest.Mock;

const MOCK_EXISTING_PRODUCT = {
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

describe('ProductsService - Actualizar Producto', () => {
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        products: {
          update: jest.fn().mockResolvedValue(MOCK_EXISTING_PRODUCT),
          findUnique: jest.fn().mockResolvedValue(MOCK_EXISTING_PRODUCT),
        },
        productDetails: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
      })
    );
  });

  it('debe retornar el producto con los datos actualizados', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_EXISTING_PRODUCT);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.updateProduct(1, { name: 'Camiseta nueva' });

    expect(result).toBeDefined();
    expect(typeof result.id).toBe('number');
  });

  it('debe lanzar error cuando el producto a actualizar no existe', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.updateProduct(999, { name: 'Camiseta nueva' }))
      .rejects.toThrow('El producto con ID 999 no existe');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando se cambia el tipo de talla a uno que no existe', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_EXISTING_PRODUCT);
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.updateProduct(1, { sizeTypeId: 99 }))
      .rejects.toThrow('El tipo de talla con ID 99 no existe');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el nuevo código de barras ya está en uso por otro producto', async () => {
    (mockProducts.findUnique as jest.Mock)
      .mockResolvedValueOnce(MOCK_EXISTING_PRODUCT)
      .mockResolvedValueOnce({ ...MOCK_EXISTING_PRODUCT, id: 99n });
    (mockProducts.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.updateProduct(1, { barcode: '99999999' }))
      .rejects.toThrow('Ya existe un producto con el código de barras');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el nuevo valor de talla no pertenece al tipo indicado', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_EXISTING_PRODUCT);
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue({ id: 1n, name: 'Talla de ropa' });
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.updateProduct(1, { sizeTypeId: 1, sizeValueId: 99 }))
      .rejects.toThrow('no existe o no pertenece al tipo de talla');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el nuevo nombre ya existe con la misma combinación de talla', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_EXISTING_PRODUCT);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_EXISTING_PRODUCT, id: 99n });

    await expect(service.updateProduct(1, { name: 'Camiseta duplicada' }))
      .rejects.toThrow('Ya existe un producto con el nombre');

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});