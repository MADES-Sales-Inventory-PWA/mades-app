import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key-para-jest';
process.env.JWT_SECRET = TEST_SECRET;

import TokenService from '../../src/core/services/token.service';
import { TokenPayload } from '../../src/shared/models/auth/token-payload.model';

afterAll(() => {
  delete process.env.JWT_SECRET;
});

const VALID_PAYLOAD: TokenPayload = {
  userId: 1,
  userName: 'admin@mades.com',
  roleId: 1,
};

describe('TokenService', () => {

  describe('generateToken()', () => {
    it('debería generar un string JWT no vacío', () => {
      const token = TokenService.generateToken(VALID_PAYLOAD);

      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(token.split('.')).toHaveLength(3);
    });

    it('debería generar tokens distintos para payloads distintos', () => {
      const token1 = TokenService.generateToken(VALID_PAYLOAD);
      const token2 = TokenService.generateToken({ userId: 2, userName: 'otro@test.com', roleId: 2 });

      expect(token1).not.toBe(token2);
    });

    it('el token generado debería ser verificable y contener el payload correcto', () => {
      const token = TokenService.generateToken(VALID_PAYLOAD);
      const decoded = jwt.verify(token, TEST_SECRET) as TokenPayload & { exp: number; iat: number };

      expect(decoded.userId).toBe(VALID_PAYLOAD.userId);
      expect(decoded.userName).toBe(VALID_PAYLOAD.userName);
      expect(decoded.roleId).toBe(VALID_PAYLOAD.roleId);
    });

    it('el token debería expirar en aproximadamente 9 horas', () => {
      const token = TokenService.generateToken(VALID_PAYLOAD);
      const decoded = jwt.decode(token) as { exp: number; iat: number };
      const expiresInSeconds = decoded.exp - decoded.iat;

      expect(expiresInSeconds).toBeGreaterThanOrEqual(32395);
      expect(expiresInSeconds).toBeLessThanOrEqual(32405);
    });
  });

  describe('verifyToken()', () => {
    it('debería retornar el payload original si el token es válido', () => {
      const token = TokenService.generateToken(VALID_PAYLOAD);
      const result = TokenService.verifyToken(token);

      expect(result.userId).toBe(VALID_PAYLOAD.userId);
      expect(result.userName).toBe(VALID_PAYLOAD.userName);
      expect(result.roleId).toBe(VALID_PAYLOAD.roleId);
    });

    it('debería lanzar error si el token es inválido', () => {
      expect(() => TokenService.verifyToken('token.invalido.firma')).toThrow();
    });

    it('debería lanzar error si el token está expirado', () => {
      const expiredToken = jwt.sign(VALID_PAYLOAD, TEST_SECRET, { expiresIn: -1 });

      expect(() => TokenService.verifyToken(expiredToken)).toThrow();
    });

    it('debería lanzar error si el token fue firmado con otro secret', () => {
      const tokenOtroSecret = jwt.sign(VALID_PAYLOAD, 'otro-secret-diferente');

      expect(() => TokenService.verifyToken(tokenOtroSecret)).toThrow();
    });

    it('debería lanzar error si el token está vacío', () => {
      expect(() => TokenService.verifyToken('')).toThrow();
    });
  });
});