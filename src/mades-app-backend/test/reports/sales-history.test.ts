import { ReportsService } from '../../src/modules/reports/reports.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    inventoryMovements: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  }
}));

import prisma from '../../src/config/prisma';

const mockMovements = prisma.inventoryMovements as jest.Mocked<typeof prisma.inventoryMovements>;

const MOCK_MOVEMENT = {
  id: 1n,
  movementType: 'SALE',
  creationDate: new Date('2024-03-15'),
  sellerId: 5n,
  asyncStatus: true,
  description: 'Venta',
  Persons: {
    id: 5n,
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    documentNumber: '123456789',
  },
  Invoices: [{ invoceNumber: 'INV-001', total: { toNumber: () => 50000 } }],
  MovementDetails: [
    {
      quantity: 2n,
      price: 25000, 
      Products: { id: 1n, name: 'Camiseta', barcode: '12345678' },
      productId: 1n,
    },
  ],
};

const DEFAULT_FILTERS = { page: 1, pageSize: 20 };

describe('ReportsService - Historial de Ventas', () => {
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService();
  });

  it('debe retornar el total de ventas, la página actual y el tamaño de página', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('debe retornar lista vacía y total en cero cuando no hay ventas registradas', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(0);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  it('debe retornar el id de la venta, el número de factura y el total como número entero', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(typeof result.data[0].id).toBe('number');
    expect(result.data[0].invoiceNumber).toBe('INV-001');
    expect(typeof result.data[0].total).toBe('number');
  });

  it('debe incluir el nombre y apellido del empleado en cada venta', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.data[0].employee).not.toBeNull();
    expect(result.data[0].employee!.name).toBe('Juan');
    expect(result.data[0].employee!.lastName).toBe('Pérez');
  });

  it('debe retornar el empleado como nulo cuando la venta no tiene vendedor asociado', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([
      { ...MOCK_MOVEMENT, Persons: null },
    ]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.data[0].employee).toBeNull();
  });

  it('debe incluir los productos con su cantidad y precio en cada venta', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.data[0].products).toHaveLength(1);
    expect(result.data[0].products[0].name).toBe('Camiseta');
    expect(result.data[0].products[0].quantity).toBe(2);
  });

  it('debe calcular el total de cada línea multiplicando el precio por la cantidad', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

    const result = await service.getSalesHistory(DEFAULT_FILTERS);

    expect(result.data[0].products[0].lineTotal).toBe(50000);
  });

  it('debe filtrar las ventas por el id del empleado cuando se indica', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(0);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

    await service.getSalesHistory({ ...DEFAULT_FILTERS, employeeId: 5 });

    expect(mockMovements.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ sellerId: 5n }),
      })
    );
  });
});