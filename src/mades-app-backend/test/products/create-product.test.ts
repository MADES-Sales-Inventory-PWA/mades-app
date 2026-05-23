import { ProductsService } from '../../src/modules/products/products.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    sizeTypes: { findUnique: jest.fn() },
    sizeValues: { findFirst: jest.fn() },
    products: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    productDetails: { create: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockSizeTypes = prisma.sizeTypes as jest.Mocked<typeof prisma.sizeTypes>;
const mockSizeValues = prisma.sizeValues as jest.Mocked<typeof prisma.sizeValues>;
const mockProducts = prisma.products as jest.Mocked<typeof prisma.products>;
const mockTransaction = prisma.$transaction as jest.Mock;

const VALID_DTO = {
  name: 'Camiseta básica',
  sizeTypeId: 1,
  sizeValueId: 1,
  barcode: '12345678',
  purchasePrice: 25000,
  quantity: 10,
  minQuantity: 2,
};

const MOCK_SIZE_TYPE = { id: 1n, name: 'Talla de ropa' };
const MOCK_SIZE_VALUE = { id: 1n, sizeTypeId: 1n, value: 'M', sortOrder: 0 };
const MOCK_CREATED_PRODUCT = {
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

describe('ProductsService - Crear Producto', () => {
  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        products: {
          create: jest.fn().mockResolvedValue(MOCK_CREATED_PRODUCT),
        },
      })
    );
  });

  it('debe retornar el producto creado con su id, nombre y estado activo', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUE);
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.createProduct(VALID_DTO);

    expect(result.name).toBe('Camiseta básica');
    expect(result.state).toBe(true);
    expect(typeof result.id).toBe('number');
  });

  it('debe lanzar error cuando el tipo de talla indicado no existe', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.createProduct(VALID_DTO))
      .rejects.toThrow('El tipo de talla con ID 1 no existe');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el valor de talla no pertenece al tipo de talla indicado', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.createProduct(VALID_DTO))
      .rejects.toThrow('El valor de talla con ID 1 no existe o no pertenece al tipo de talla 1');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando ya existe un producto con el mismo nombre y combinación de talla', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUE);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_CREATED_PRODUCT, id: 99n });

    await expect(service.createProduct(VALID_DTO))
      .rejects.toThrow('Ya existe un producto con el nombre Camiseta básica y esa combinación de talla');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando ya existe un producto con el mismo código de barras', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUE);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue(null);
    (mockProducts.findUnique as jest.Mock).mockResolvedValue({ ...MOCK_CREATED_PRODUCT, id: 99n });

    await expect(service.createProduct(VALID_DTO))
      .rejects.toThrow('Ya existe un producto con el código de barras 12345678');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('no debe lanzar error de código de barras duplicado si el producto encontrado es el mismo', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findFirst as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUE);
    (mockProducts.findFirst as jest.Mock).mockResolvedValue(null);
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await service.createProduct(VALID_DTO);

    expect(result).toBeDefined();
  });
});