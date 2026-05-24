import { UserService } from '../../src/modules/users/users.service';

jest.mock('../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    users: { findUnique: jest.fn(), findMany: jest.fn() },
    persons: { findFirst: jest.fn() },
  }
}));

import prisma from '../../src/config/prisma';

const mockUsers = prisma.users as jest.Mocked<typeof prisma.users>;

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

describe('UserService - Ver Usuarios', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  describe('getAll()', () => {
    it('debe retornar la lista de usuarios con sus datos de persona', async () => {
      (mockUsers.findMany as jest.Mock).mockResolvedValue([MOCK_USER]);

      const result = await service.getAll({});

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Juan');
      expect(result[0].email).toBe('juan@test.com');
    });

    it('debe retornar lista vacía cuando no hay usuarios registrados', async () => {
      (mockUsers.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAll({});

      expect(result).toHaveLength(0);
    });

    it('debe retornar el id de la persona y el id del usuario como número entero', async () => {
      (mockUsers.findMany as jest.Mock).mockResolvedValue([MOCK_USER]);

      const result = await service.getAll({});

      expect(typeof result[0].id).toBe('number');
      expect(typeof result[0].user.id).toBe('number');
    });

    it('debe excluir usuarios que no tienen persona asociada', async () => {
      const userSinPersona = { ...MOCK_USER, Persons: null };
      (mockUsers.findMany as jest.Mock).mockResolvedValue([MOCK_USER, userSinPersona]);

      const result = await service.getAll({});

      expect(result).toHaveLength(1);
    });
  });
});