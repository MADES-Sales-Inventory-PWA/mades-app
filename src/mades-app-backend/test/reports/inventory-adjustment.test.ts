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

const MOCK_ADJUSTMENT = {
  id: 1n,
  movementType: 'DECREASE',
  creationDate: new Date('2024-03-15'),
  sellerId: 5n,
  asyncStatus: false,
  description: 'Ajuste LOSS | razon: DAMAGED | nota: se cayó',
  Persons: {
    id: 5n,
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    documentNumber: '123456789',
  },
  MovementDetails: [
    {
      quantity: 3n,
      price: { toNumber: () => 0 },
      Products: { id: 1n, name: 'Camiseta', barcode: '12345678' },
      productId: 1n,
    },
  ],
};

const DEFAULT_FILTERS = { page: 1, pageSize: 20 };

describe('ReportsService - Ajustes de Inventario', () => {
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService();
  });

  it('debe retornar el total de ajustes, la página actual y el tamaño de página', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_ADJUSTMENT]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('debe retornar lista vacía y total en cero cuando no hay ajustes registrados', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(0);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  it('debe transformar el tipo DECREASE a LOSS en la respuesta', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_ADJUSTMENT]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].type).toBe('LOSS');
  });

  it('debe transformar el tipo SALE a GAIN en la respuesta', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([
      { ...MOCK_ADJUSTMENT, movementType: 'SALE' },
    ]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].type).toBe('GAIN');
  });

  it('debe extraer la razón del ajuste desde la descripción del movimiento', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_ADJUSTMENT]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].reason).toBe('DAMAGED');
    expect(result.data[0].reasonLabel).toBe('Daño');
  });

  it('debe extraer la nota del ajuste desde la descripción del movimiento', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_ADJUSTMENT]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].notes).toBe('se cayó');
  });

  it('debe retornar la razón como nula cuando la descripción no la contiene', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([
      { ...MOCK_ADJUSTMENT, description: 'Ajuste sin razon' },
    ]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].reason).toBeNull();
    expect(result.data[0].reasonLabel).toBeNull();
  });

  it('debe incluir el nombre y código de barras del producto en cada ajuste', async () => {
    (mockMovements.count as jest.Mock).mockResolvedValue(1);
    (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_ADJUSTMENT]);

    const result = await service.getInventoryAdjustments(DEFAULT_FILTERS);

    expect(result.data[0].product).not.toBeNull();
    expect(result.data[0].product!.name).toBe('Camiseta');
    expect(result.data[0].product!.barcode).toBe('12345678');
  });
});