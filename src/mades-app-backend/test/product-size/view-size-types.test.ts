import { SizeService } from '../../src/modules/product-sizes/sizes.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    sizeTypes: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    sizeValues: {
      findMany: jest.fn(),
    },
  }
}));

import prisma from '../../src/config/prisma';

const mockSizeTypes = prisma.sizeTypes as jest.Mocked<typeof prisma.sizeTypes>;

const MOCK_SIZE_TYPES = [
  { id: 1n, name: 'Talla de ropa' },
  { id: 2n, name: 'Talla de zapato' },
];

describe('SizeService - Ver Tipos de Talla', () => {
  let service: SizeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SizeService();
  });

  it('debe retornar la lista de tipos de talla disponibles', async () => {
    (mockSizeTypes.findMany as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPES);

    const result = await service.listSizeTypes();

    expect(result).toHaveLength(2);
  });

  it('debe retornar el id como número entero y el nombre de cada tipo de talla', async () => {
    (mockSizeTypes.findMany as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPES);

    const result = await service.listSizeTypes();

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Talla de ropa');
    expect(typeof result[0].id).toBe('number');
  });

  it('debe retornar lista vacía cuando no hay tipos de talla registrados', async () => {
    (mockSizeTypes.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.listSizeTypes();

    expect(result).toHaveLength(0);
  });

  it('debe consultar los tipos de talla ordenados por nombre', async () => {
    (mockSizeTypes.findMany as jest.Mock).mockResolvedValue([]);

    await service.listSizeTypes();

    expect(mockSizeTypes.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: 'asc' } })
    );
  });
});