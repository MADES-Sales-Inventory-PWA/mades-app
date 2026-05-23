import { InventoryService } from '../../src/modules/inventory/inventory.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    products: { findUnique: jest.fn() },
    persons: { findFirst: jest.fn() },
    productDetails: { findFirst: jest.fn(), findFirstOrThrow: jest.fn(), update: jest.fn() },
    inventoryMovements: { create: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockProducts = prisma.products as jest.Mocked<typeof prisma.products>;
const mockPersons = prisma.persons as jest.Mocked<typeof prisma.persons>;
const mockProductDetails = prisma.productDetails as jest.Mocked<typeof prisma.productDetails>;
const mockTransaction = prisma.$transaction as jest.Mock;

const VALID_LOSS_DTO = {
  productId: 1,
  type: 'LOSS' as const,
  quantity: 5,
  reason: 'DAMAGED' as const,
};

const VALID_GAIN_DTO = {
  productId: 1,
  type: 'GAIN' as const,
  quantity: 5,
  reason: 'RESTOCK' as const,
};

const MOCK_PRODUCT = { id: 1n, barcode: 'BAR001' };
const MOCK_PERSON = { id: 5n };
const MOCK_STOCK = { id: 10n, productId: 1n, quantity: 20n };

describe('InventoryService - Registrar Ajuste', () => {
  let service: InventoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InventoryService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        productDetails: {
          findFirstOrThrow: jest.fn().mockResolvedValue({ id: 10n }),
          update: jest.fn(),
        },
        inventoryMovements: {
          create: jest.fn().mockResolvedValue({ id: 99n }),
        },
      })
    );
  });

  it('debe retornar el id del producto, la cantidad anterior y la cantidad nueva al registrar un ajuste de tipo LOSS', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue(MOCK_STOCK);

    const result = await service.registerAdjustment(1, VALID_LOSS_DTO);

    expect(result.productId).toBe(1);
    expect(result.previousQty).toBe(20);
    expect(result.newQty).toBe(15);
  });

  it('debe retornar el id del producto, la cantidad anterior y la cantidad nueva al registrar un ajuste de tipo GAIN', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue(MOCK_STOCK);

    const result = await service.registerAdjustment(1, VALID_GAIN_DTO);

    expect(result.newQty).toBe(25);
    expect(result.previousQty).toBe(20);
  });

  it('debe restar la cantidad indicada al stock actual cuando el tipo es LOSS', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_STOCK, quantity: 10n });

    const result = await service.registerAdjustment(1, { ...VALID_LOSS_DTO, quantity: 3 });

    expect(result.newQty).toBe(7);
    expect(result.previousQty).toBe(10);
  });

  it('debe sumar la cantidad indicada al stock actual cuando el tipo es GAIN', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_STOCK, quantity: 10n });

    const result = await service.registerAdjustment(1, { ...VALID_GAIN_DTO, quantity: 4 });

    expect(result.newQty).toBe(14);
  });

  it('debe lanzar error si el producto no existe', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.registerAdjustment(1, VALID_LOSS_DTO))
      .rejects.toThrow('No se encontro producto para el id indicado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error y no registrar el ajuste si el usuario no tiene persona asociada', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.registerAdjustment(1, VALID_LOSS_DTO))
      .rejects.toThrow('No se encontro la persona asociada al usuario autenticado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error si no hay stock para el producto', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.registerAdjustment(1, VALID_LOSS_DTO))
      .rejects.toThrow('No se encontro stock para el producto seleccionado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el stock es insuficiente para LOSS', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_STOCK, quantity: 3n });

    await expect(
      service.registerAdjustment(1, { ...VALID_LOSS_DTO, quantity: 5 })
    ).rejects.toThrow('Stock insuficiente para registrar la perdida');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('no debe lanzar error de stock insuficiente para GAIN', async () => {
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(MOCK_PERSON);
    (mockProductDetails.findFirst as jest.Mock).mockResolvedValue({ ...MOCK_STOCK, quantity: 1n });

    const result = await service.registerAdjustment(1, VALID_GAIN_DTO);

    expect(result.newQty).toBe(6);
  });
});