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

const MOCK_MOVEMENT = {
  id: 1n,
  creationDate: new Date('2024-03-15'),
  sellerId: 5n,
  description: 'Venta',
  Persons: { name: 'Juan', lastName: 'Pérez', documentType: 'CC', documentNumber: '123456789' },
  Invoices: [{ invoceNumber: 'INV-001', total: 50000 }],
  MovementDetails: [
    {
      quantity: 2n,
      Products: { name: 'Camiseta', barcode: '12345678', sellingPrice: 25000 },
    },
  ],
};

describe('ReportsService - Ventas por Período', () => {
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReportsService();
  });

  describe('getSalesPerDay()', () => {
    it('debe retornar el total de ventas y la cantidad de movimientos del día indicado', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.getSalesPerDay({ date: new Date('2024-03-15') });

      expect(result.period).toBe('daily');
      expect(result.count).toBe(1);
      expect(result.totalSales).toBe(50000);
    });

    it('debe retornar total en cero y lista vacía cuando no hay ventas en el día', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getSalesPerDay({ date: new Date('2024-03-15') });

      expect(result.totalSales).toBe(0);
      expect(result.count).toBe(0);
    });

    it('debe lanzar error cuando se consulta una fecha futura', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await expect(service.getSalesPerDay({ date: tomorrow }))
        .rejects.toThrow('No se pueden consultar reportes de fechas futuras');

      expect(mockMovements.findMany).not.toHaveBeenCalled();
    });

    it('debe incluir el nombre del vendedor en cada venta del reporte', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.getSalesPerDay({ date: new Date('2024-03-15') });

      expect(result.data[0].seller).toBe('Juan Pérez');
    });

    it('debe mostrar el vendedor como texto por defecto cuando la venta no tiene persona asociada', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([
        { ...MOCK_MOVEMENT, Persons: null },
      ]);

      const result = await service.getSalesPerDay({ date: new Date('2024-03-15') });

      expect(result.data[0].seller).toBe('Cliente General');
    });
  });

  describe('getSalesPerWeek()', () => {
    it('debe retornar el período como semanal con la etiqueta de la semana', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.getSalesPerWeek({ date: new Date('2024-03-15') });

      expect(result.period).toBe('weekly');
      expect(result.label).toContain('Semana del');
    });

    it('debe sumar el total de todas las ventas de la semana', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT, MOCK_MOVEMENT]);

      const result = await service.getSalesPerWeek({ date: new Date('2024-03-15') });

      expect(result.totalSales).toBe(100000);
      expect(result.count).toBe(2);
    });
  });

  describe('getSalesPerMonth()', () => {
    it('debe retornar el período como mensual con el nombre del mes y año', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.getSalesPerMonth({ date: new Date('2024-03-15') });

      expect(result.period).toBe('monthly');
      expect(result.label).toContain('marzo');
    });

    it('debe sumar el total de todas las ventas del mes', async () => {
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT, MOCK_MOVEMENT]);

      const result = await service.getSalesPerMonth({ date: new Date('2024-03-15') });

      expect(result.totalSales).toBe(100000);
      expect(result.count).toBe(2);
    });
  });
});