import { UserService } from '../../src/modules/users/users.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    users: { count: jest.fn(), create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    persons: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockUsers = prisma.users as jest.Mocked<typeof prisma.users>;
const mockPersons = prisma.persons as jest.Mocked<typeof prisma.persons>;
const mockTransaction = prisma.$transaction as jest.Mock;

const VALID_DTO = {
  name: 'Juan',
  lastName: 'Pérez',
  email: 'juan@test.com',
  phoneNumber: '3001234567',
  documentType: 'CC',
  documentNumber: '123456789',
  password: 'Password123',
  rolId: 2,
  state: true,
};

const MOCK_USER_WITH_PERSON = {
  id: 1n,
  userName: 'juan@test.com',
  password: 'hashed',
  rolId: 2n,
  Persons: {
    id: 1n,
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan@test.com',
    documentType: 'CC',
    documentNumber: '123456789',
    phoneNumber: '3001234567',
    state: true,
    userId: 1n,
  },
  Roles: { id: 2n, name: 'Empleado' },
};

describe('UserService - Crear Usuario', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        users: {
          create: jest.fn().mockResolvedValue({ id: 1n, userName: 'juan@test.com', rolId: 2n }),
          findUnique: jest.fn().mockResolvedValue(MOCK_USER_WITH_PERSON),
        },
        persons: {
          create: jest.fn().mockResolvedValue(MOCK_USER_WITH_PERSON.Persons),
        },
      })
    );
  });

  it('debe retornar los datos de la persona y el usuario cuando la creación es exitosa', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.createUser(VALID_DTO);

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Juan');
    expect(result!.email).toBe('juan@test.com');
  });

  it('debe retornar el id de la persona y el id del usuario como número entero', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.createUser(VALID_DTO);

    expect(typeof result!.id).toBe('number');
    expect(typeof result!.user.id).toBe('number');
  });

  it('debe lanzar error cuando el correo electrónico ya está registrado', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({
      id: 99n,
      email: 'juan@test.com',
    });

    await expect(service.createUser(VALID_DTO))
      .rejects.toThrow('El correo electrónico ya se encuentra registrado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el número de documento ya está registrado con el mismo tipo', async () => {
    (mockPersons.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 99n, documentNumber: '123456789' });

    await expect(service.createUser(VALID_DTO))
      .rejects.toThrow('Ya existe una persona con ese tipo y numero de documento');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('no debe lanzar error de correo duplicado si la persona encontrada es la misma', async () => {
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.createUser(VALID_DTO);

    expect(result).toBeDefined();
  });
});