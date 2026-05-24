import { UserService } from '../../src/modules/users/users.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    users: { findUnique: jest.fn() },
    persons: { update: jest.fn() },
    $transaction: jest.fn(),
  }
}));

import prisma from '../../src/config/prisma';

const mockUsers = prisma.users as jest.Mocked<typeof prisma.users>;
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

describe('UserService - Cambiar Estado del Usuario', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();

    mockTransaction.mockImplementation((cb: any) =>
      cb({
        persons: { update: jest.fn().mockResolvedValue(MOCK_USER.Persons) },
        users: { findUnique: jest.fn().mockResolvedValue(MOCK_USER) },
      })
    );
  });

  it('debe desactivar el usuario cuando se envía estado en falso', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(MOCK_USER);

    await service.changeStatus(1, false);

    expect(mockTransaction).toHaveBeenCalled();
  });

  it('debe activar el usuario cuando se envía estado en verdadero', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue({ ...MOCK_USER, Persons: { ...MOCK_USER.Persons, state: false } });

    await service.changeStatus(1, true);

    expect(mockTransaction).toHaveBeenCalled();
  });

  it('debe lanzar error y no actualizar el estado cuando el usuario no existe', async () => {
    (mockUsers.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.changeStatus(999, false))
      .rejects.toThrow('Usuario no encontrado');

    expect(mockTransaction).not.toHaveBeenCalled();
  });
});