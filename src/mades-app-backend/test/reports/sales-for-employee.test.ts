import { ReportsService } from '../../src/modules/reports/reports.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    inventoryMovements: {
      findMany: jest.fn(),
    },
  }
}));

import prisma from '../../src/config/prisma';

const mockMovements = prisma.inventoryMovements as jest.Mocked<typeof prisma.inventoryMovements>;

const MOCK_SALES = [
  {
    sellerId: 1n,
    Persons: { name: 'Juan', lastName: 'Pérez' },
    Invoices: [{ total: 50000 }],
  },
  {
    sellerId: 1n,
    Persons: { name: 'Juan', lastName: 'Pérez' },
    Invoices: [{ total: 30000 }],
  },
  {
    sellerId: 2n,
    Persons: { name: 'María', lastName: 'López' },
    Invoices: [{ total: 80000 }],
  },
];

describe('ReportsService - Ventas por Empleado', () => {
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService();
  });

  it('debe retornar el total vendido sumando todas las ventas de todos los empleados', async () => {
    (mockMovements.findMany as jest.Mock).mockResolvedValue(MOCK_SALES);

    const result = await service.getSalesPerEmployee();

    expect(result.total).toBe(160000);
  });

  it('debe agrupar las ventas por empleado y contar cuántas realizó cada uno', async () => {
    (mockMovements.findMany as jest.Mock).mockResolvedValue(MOCK_SALES);

    const result = await service.getSalesPerEmployee();

    const juan = result.data.find((e: any) => e.Vendedor === 'Juan Pérez')!;
    expect(juan.ventas_realizadas).toBe(2);
    expect(juan.total_vendido).toBe(80000);
  });

  it('debe ordenar los empleados de mayor a menor total vendido', async () => {
    (mockMovements.findMany as jest.Mock).mockResolvedValue(MOCK_SALES);

    const result = await service.getSalesPerEmployee();

    expect(result.data[0].total_vendido).toBeGreaterThanOrEqual(result.data[1].total_vendido);
  });

  it('debe retornar lista vacía cuando no hay ventas registradas', async () => {
    (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.getSalesPerEmployee();

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('debe mostrar el nombre del empleado como desconocido cuando no tiene persona asociada', async () => {
    (mockMovements.findMany as jest.Mock).mockResolvedValue([
      { sellerId: 9n, Persons: null, Invoices: [{ total: 10000 }] },
    ]);

    const result = await service.getSalesPerEmployee();

    expect(result.data[0].Vendedor).toBe('Desconocido');
  });
});