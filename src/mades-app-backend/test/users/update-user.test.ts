import { UserService } from '../../src/modules/users/users.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    users: { findUnique: jest.fn(), update: jest.fn() },
    persons: { findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockUsers = prisma.users as jest.Mocked<typeof prisma.users>;
const mockPersons = prisma.persons as jest.Mocked<typeof prisma.persons>;
const mockTransaction = prisma.$transaction as jest.Mock;

const MOCK_USER = {
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

describe('UserService - Actualizar Usuario', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        users: {
          update: jest.fn().mockResolvedValue(MOCK_USER),
          findUnique: jest.fn().mockResolvedValue(MOCK_USER),
        },
        persons: {
          update: jest.fn().mockResolvedValue(MOCK_USER.Persons),
        },
      })
    );
  });

  it('debe retornar los datos actualizados del usuario cuando la operación es exitosa', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(MOCK_USER);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue(null);

    const result = await service.updateUser(1, { name: 'Carlos' });

    expect(result).toBeDefined();
    expect(typeof result!.id).toBe('number');
  });

  it('debe lanzar error cuando el usuario a actualizar no existe', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.updateUser(999, { name: 'Carlos' }))
      .rejects.toThrow('Usuario no encontrado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el nuevo correo ya está en uso por otra persona', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(MOCK_USER);
    (mockPersons.findFirst as jest.Mock).mockResolvedValue({ id: 99n, email: 'otro@test.com' });

    await expect(service.updateUser(1, { email: 'otro@test.com' }))
      .rejects.toThrow('El correo electrónico ya se encuentra registrado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('debe lanzar error cuando el nuevo número de documento ya está en uso por otra persona', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(MOCK_USER);
    (mockPersons.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 99n, documentNumber: '999999999' });

    await expect(service.updateUser(1, { documentNumber: '999999999' }))
      .rejects.toThrow('Ya existe una persona con ese tipo y numero de documento');

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});