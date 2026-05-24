import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import TokenService from '../../src/core/services/token.service';

jest.mock('../../src/modules/auth/auth.repository');
jest.mock('../../src/core/services/token.service');

const MockedAuthRepository = AuthRepository as jest.MockedClass<typeof AuthRepository>;
const MockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

const MOCK_DB_USER = {
  id: BigInt(1),
  userName: 'admin@mades.com',
  password: 'hashedpassword',
  rolId: BigInt(1),
};

describe('AuthService', () => {
  let authService: AuthService;
  let loginRepoMock: jest.Mock;

  beforeEach(() => {
    loginRepoMock = jest.fn();
    MockedAuthRepository.prototype.login = loginRepoMock;
    (MockedTokenService.generateToken as jest.Mock) = jest.fn().mockReturnValue('jwt.mocked.token');
    authService = new AuthService();
  });

  describe('login()', () => {
    it('debería retornar token y datos del usuario si las credenciales son correctas', async () => {
      loginRepoMock.mockResolvedValue(MOCK_DB_USER);

      const result = await authService.login('admin@mades.com', 'password123');

      expect(result).not.toBeNull();
      expect(result!.token).toBe('jwt.mocked.token');
      expect(result!.user).toEqual({
        id: 1,
        userName: 'admin@mades.com',
        roleId: 1,
      });
    });

    it('debería llamar a TokenService.generateToken con el payload correcto', async () => {
      loginRepoMock.mockResolvedValue(MOCK_DB_USER);

      await authService.login('admin@mades.com', 'password123');

      expect(MockedTokenService.generateToken).toHaveBeenCalledWith({
        userId: 1,
        userName: 'admin@mades.com',
        roleId: 1,
      });
    });

    it('debería retornar null si el repositorio no encuentra al usuario', async () => {
      loginRepoMock.mockResolvedValue(null);

      const result = await authService.login('noexiste@test.com', 'wrongpass');

      expect(result).toBeNull();
      expect(MockedTokenService.generateToken).not.toHaveBeenCalled();
    });

    it('debería convertir BigInt a Number correctamente en los datos del usuario', async () => {
      loginRepoMock.mockResolvedValue({
        id: BigInt(99),
        userName: 'empleado@test.com',
        password: 'pass',
        rolId: BigInt(2),
      });

      const result = await authService.login('empleado@test.com', 'pass');

      expect(result!.user.id).toBe(99);
      expect(result!.user.roleId).toBe(2);
      expect(typeof result!.user.id).toBe('number');
      expect(typeof result!.user.roleId).toBe('number');
    });

    it('debería propagar errores del repositorio', async () => {
      loginRepoMock.mockRejectedValue(new Error('Error de conexión a DB'));

      await expect(
        authService.login('admin@mades.com', 'password123')
      ).rejects.toThrow('Error de conexión a DB');
    });
  });
});