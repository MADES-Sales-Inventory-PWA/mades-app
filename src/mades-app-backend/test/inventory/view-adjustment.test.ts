import { InventoryService } from '../../src/modules/inventory/inventory.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    inventoryMovements: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  }
}));

import prisma from '../../src/config/prisma';

const mockMovements = prisma.inventoryMovements as jest.Mocked<typeof prisma.inventoryMovements>;

const MOCK_MOVEMENT = {
  id: 1n,
  movementType: 'DECREASE',
  creationDate: new Date('2024-01-15'),
  sellerId: 5n,
  asyncStatus: false,
  description: 'Ajuste LOSS | razon: DAMAGED | nota: bodega',
  MovementDetails: [
    {
      id: 1n,
      productId: 1n,
      quantity: 5n,
      price: { toNumber: () => 0 },
      Products: { id: 1n, barcode: 'BAR001' },
    },
  ],
};

describe('InventoryService - Ver Ajustes', () => {
  let service: InventoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new InventoryService();
  });

  describe('listAdjustments()', () => {
    it('debe retornar lista paginada de ajustes', async () => {
      (mockMovements.count as jest.Mock).mockResolvedValue(1);
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.listAdjustments({ page: 1, pageSize: 20 });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.data).toHaveLength(1);
    });

    it('debe retornar lista vacía si no hay ajustes', async () => {
      (mockMovements.count as jest.Mock).mockResolvedValue(0);
      (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.listAdjustments({ page: 1, pageSize: 20 });

      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('debe mapear movementType DECREASE a tipo LOSS', async () => {
      (mockMovements.count as jest.Mock).mockResolvedValue(1);
      (mockMovements.findMany as jest.Mock).mockResolvedValue([MOCK_MOVEMENT]);

      const result = await service.listAdjustments({ page: 1, pageSize: 20 });

      expect(result.data[0].type).toBe('LOSS');
    });

    it('debe mapear movementType SALE a tipo GAIN', async () => {
      (mockMovements.count as jest.Mock).mockResolvedValue(1);
      (mockMovements.findMany as jest.Mock).mockResolvedValue([
        { ...MOCK_MOVEMENT, movementType: 'SALE' },
      ]);

      const result = await service.listAdjustments({ page: 1, pageSize: 20 });

      expect(result.data[0].type).toBe('GAIN');
    });

    it('debe filtrar por productId si se pasa', async () => {
      (mockMovements.count as jest.Mock).mockResolvedValue(0);
      (mockMovements.findMany as jest.Mock).mockResolvedValue([]);

      await service.listAdjustments({ page: 1, pageSize: 20, productId: 99 });

      expect(mockMovements.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            MovementDetails: expect.objectContaining({
              some: expect.objectContaining({ productId: 99n }),
            }),
          }),
        })
      );
    });
  });

  describe('getAdjustmentById()', () => {
    const MOCK_DETAIL_MOVEMENT = {
      ...MOCK_MOVEMENT,
      MovementDetails: [
        {
          ...MOCK_MOVEMENT.MovementDetails[0],
          Products: { id: 1n, barcode: 'BAR001', name: 'Producto Test' },
        },
      ],
    };

    it('debe retornar el ajuste si existe', async () => {
      (mockMovements.findUnique as jest.Mock).mockResolvedValue(MOCK_DETAIL_MOVEMENT);

      const result = await service.getAdjustmentById(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.type).toBe('LOSS');
    });

    it('debe retornar null si no existe el ajuste', async () => {
      (mockMovements.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getAdjustmentById(999);

      expect(result).toBeNull();
    });

    it('debe incluir datos del producto en el resultado', async () => {
      (mockMovements.findUnique as jest.Mock).mockResolvedValue(MOCK_DETAIL_MOVEMENT);

      const result = await service.getAdjustmentById(1);

      expect(result!.product).not.toBeNull();
      expect(result!.product!.barcode).toBe('BAR001');
      expect(result!.product!.name).toBe('Producto Test');
    });

    it('debe convertir BigInt a number en el resultado', async () => {
      (mockMovements.findUnique as jest.Mock).mockResolvedValue(MOCK_DETAIL_MOVEMENT);

      const result = await service.getAdjustmentById(1);

      expect(typeof result!.id).toBe('number');
      expect(typeof result!.productId).toBe('number');
    });

    it('debe llamar a findUnique con el id correcto como BigInt', async () => {
      (mockMovements.findUnique as jest.Mock).mockResolvedValue(null);

      await service.getAdjustmentById(5);

      expect(mockMovements.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5n } })
      );
    });
  });
});