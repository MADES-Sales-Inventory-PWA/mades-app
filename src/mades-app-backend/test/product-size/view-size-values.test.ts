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
const mockSizeValues = prisma.sizeValues as jest.Mocked<typeof prisma.sizeValues>;

const MOCK_SIZE_TYPE = { id: 1n, name: 'Talla de ropa' };

const MOCK_SIZE_VALUES = [
  { id: 1n, sizeTypeId: 1n, value: 'S', sortOrder: 0 },
  { id: 2n, sizeTypeId: 1n, value: 'M', sortOrder: 1 },
  { id: 3n, sizeTypeId: 1n, value: 'L', sortOrder: 2 },
];

describe('SizeService - Ver Valores de Talla', () => {
  let service: SizeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SizeService();
  });

  it('debe retornar los valores de talla asociados al tipo indicado', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findMany as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUES);

    const result = await service.listSizeValuesByTypeId(1);

    expect(result).toHaveLength(3);
  });

  it('debe retornar el id como número entero y el valor de cada talla', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findMany as jest.Mock).mockResolvedValue(MOCK_SIZE_VALUES);

    const result = await service.listSizeValuesByTypeId(1);

    expect(result[0].id).toBe(1);
    expect(result[0].value).toBe('S');
    expect(typeof result[0].id).toBe('number');
  });

  it('debe retornar lista vacía cuando el tipo de talla no tiene valores registrados', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findMany as jest.Mock).mockResolvedValue([]);

    const result = await service.listSizeValuesByTypeId(1);

    expect(result).toHaveLength(0);
  });

  it('debe lanzar error cuando el id no corresponde a ningún tipo de talla registrado', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.listSizeValuesByTypeId(999))
      .rejects.toThrow('El tipo de talla con ID 999 no existe');

    expect(mockSizeValues.findMany).not.toHaveBeenCalled();
  });

  it('no debe buscar los valores si el tipo de talla no existe', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.listSizeValuesByTypeId(5)).rejects.toThrow();

    expect(mockSizeValues.findMany).not.toHaveBeenCalled();
  });

  it('debe consultar los valores usando el id del tipo de talla convertido a entero grande', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findMany as jest.Mock).mockResolvedValue([]);

    await service.listSizeValuesByTypeId(1);

    expect(mockSizeValues.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sizeTypeId: 1n },
      })
    );
  });

  it('debe consultar los valores ordenados por el campo de orden', async () => {
    (mockSizeTypes.findUnique as jest.Mock).mockResolvedValue(MOCK_SIZE_TYPE);
    (mockSizeValues.findMany as jest.Mock).mockResolvedValue([]);

    await service.listSizeValuesByTypeId(1);

    expect(mockSizeValues.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { sortOrder: 'asc' },
      })
    );
  });
});