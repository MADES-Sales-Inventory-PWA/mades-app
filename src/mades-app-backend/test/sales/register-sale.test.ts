import { SalesService } from '../../src/modules/sales/sales.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    products: { findUnique: jest.fn() },
    persons: { findFirst: jest.fn() },
    productDetails: { update: jest.fn() },
    inventoryMovements: { create: jest.fn() },
    invoices: { create: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockProducts = prisma.products as jest.Mocked<typeof prisma.products>;
const mockPersons = prisma.persons as jest.Mocked<typeof prisma.persons>;
const mockTransaction = prisma.$transaction as jest.Mock;

const VALID_DTO = {
  items: [{ productId: 1, quantity: 2, price: 25000 }],
};

const MOCK_PRODUCT = {
  id: 1n,
  name: 'Camiseta básica',
  barcode: '12345678',
  state: true,
  productDetails: [{ id: 10n, quantity: 20n }],
};

const MOCK_REGISTERED_SALE = {
  id: 1,
  invoiceNumber: 'INV-123456',
  total: 50000,
  itemCount: 1,
};

describe('SalesService - Registrar Venta', () => {
  let service: SalesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SalesService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        productDetails: { update: jest.fn() },
        inventoryMovements: {
          create: jest.fn().mockResolvedValue({ id: 1n }),
        },
        invoices: { create: jest.fn() },
      })
    );
  });

  it('debe retornar el id, número de factura, total y cantidad de productos de la venta registrada', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);

    const result = await service.registerSale(1, VALID_DTO);

    expect(result.id).toBeDefined();
    expect(result.invoiceNumber).toBeDefined();
    expect(result.total).toBe(50000);
    expect(result.itemCount).toBe(1);
  });

  it('debe lanzar error cuando el usuario no tiene persona asociada', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(service.registerSale(1, VALID_DTO))
      .rejects.toThrow('No se encontró la persona asociada al usuario autenticado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el producto no existe', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.registerSale(1, VALID_DTO))
      .rejects.toThrow('No se encontró el producto con id 1');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el producto está inactivo', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue({ ...MOCK_PRODUCT, state: false });

    await expect(service.registerSale(1, VALID_DTO))
      .rejects.toThrow('no está activo');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el producto no tiene stock registrado', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue({ ...MOCK_PRODUCT, productDetails: [] });

    await expect(service.registerSale(1, VALID_DTO))
      .rejects.toThrow('No se encontró stock para el producto');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando la cantidad solicitada supera el stock disponible', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue({
      ...MOCK_PRODUCT,
      productDetails: [{ id: 10n, quantity: 1n }],
    });

    await expect(service.registerSale(1, { items: [{ productId: 1, quantity: 5, price: 25000 }] }))
      .rejects.toThrow('Stock insuficiente');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe calcular el total multiplicando el precio por la cantidad de cada producto', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock).mockResolvedValue(MOCK_PRODUCT);

    const result = await service.registerSale(1, {
      items: [{ productId: 1, quantity: 3, price: 10000 }],
    });

    expect(result.total).toBe(30000);
  });

  it('debe retornar la cantidad de productos incluidos en la venta', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 5n });
    (mockProducts.findUnique as jest.Mock)
      .mockResolvedValueOnce(MOCK_PRODUCT)
      .mockResolvedValueOnce({ ...MOCK_PRODUCT, id: 2n, name: 'Pantalón' });

    const result = await service.registerSale(1, {
      items: [
        { productId: 1, quantity: 1, price: 25000 },
        { productId: 2, quantity: 1, price: 30000 },
      ],
    });

    expect(result.itemCount).toBe(2);
  });
});