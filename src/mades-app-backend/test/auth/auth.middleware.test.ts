// test/auth/auth.middleware.test.ts
import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from 'src/core/middleware/auth.middleware';
import { adminMiddleware } from 'src/core/middleware/admin.middleware';
import TokenService from 'src/core/services/token.service';

jest.mock('src/core/services/token.service');
const MockedTokenService = TokenService as jest.Mocked<typeof TokenService>;

const mockRequest = (overrides: Partial<AuthRequest> = {}): AuthRequest => ({
  headers: {},
  ...overrides,
} as AuthRequest);

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

const VALID_PAYLOAD = { userId: 1, userName: 'admin@mades.com', roleId: 1 };
const VALID_TOKEN = 'Bearer valid.jwt.token';

describe('authMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Token válido', () => {
    it('debería llamar next() y asignar req.user cuando el token es válido', () => {
      (MockedTokenService.verifyToken as jest.Mock).mockReturnValue(VALID_PAYLOAD);
      const req = mockRequest({ headers: { authorization: VALID_TOKEN } });
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(req.user).toEqual(VALID_PAYLOAD);
    });
  });

  describe('Token ausente o mal formado', () => {
    it('debería retornar 401 si no se envía el header Authorization', () => {
      const req = mockRequest({ headers: {} });
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'INVALID_TOKEN_ERROR' })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el header no empieza con "Bearer "', () => {
      const req = mockRequest({ headers: { authorization: 'Basic abc123' } });
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token está vacío después de "Bearer "', () => {
      const req = mockRequest({ headers: { authorization: 'Bearer ' } });
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token es inválido o expirado', () => {
      (MockedTokenService.verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });
      const req = mockRequest({ headers: { authorization: VALID_TOKEN } });
      const res = mockResponse();

      authMiddleware(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe('adminMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('debería llamar next() si el usuario tiene roleId === 1 (ADMIN)', () => {
    const req = mockRequest({ user: VALID_PAYLOAD });
    const res = mockResponse();

    adminMiddleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('debería retornar 403 si el usuario tiene roleId !== 1 (EMPLOYEE)', () => {
    const req = mockRequest({ user: { userId: 2, userName: 'emp@test.com', roleId: 2 } });
    const res = mockResponse();

    adminMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTHORIZATION_ERROR' })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('debería retornar 401 si req.user no está definido', () => {
    const req = mockRequest({ user: undefined });
    const res = mockResponse();

    adminMiddleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});