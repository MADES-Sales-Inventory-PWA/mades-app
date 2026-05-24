import { loginSchema } from '../../src/modules/auth/auth.schema';

describe('auth.schema - loginSchema', () => {

  describe('Casos válidos', () => {
    it('debería parsear credenciales correctas', () => {
      const result = loginSchema.parse({
        userName: 'usuario@correo.com',
        password: 'miPassword123',
      });
      expect(result.userName).toBe('usuario@correo.com');
      expect(result.password).toBe('miPassword123');
    });

    it('debería recortar espacios en blanco del userName y password', () => {
      const result = loginSchema.parse({
        userName: '  admin@test.com  ',
        password: '  clave123  ',
      });
      expect(result.userName).toBe('admin@test.com');
      expect(result.password).toBe('clave123');
    });

    it('debería aceptar cualquier string como userName', () => {
      const result = loginSchema.parse({
        userName: 'soloNombre',
        password: 'pass',
      });
      expect(result.userName).toBe('soloNombre');
    });
  });

  describe('Casos inválidos', () => {
    it('debería fallar si userName está vacío', () => {
      expect(() =>
        loginSchema.parse({ userName: '', password: 'password123' })
      ).toThrow('El usuario es requerido');
    });

    it('debería fallar si password está vacío', () => {
      expect(() =>
        loginSchema.parse({ userName: 'usuario@test.com', password: '' })
      ).toThrow('La contraseña es requerida');
    });

    it('debería fallar si userName está ausente', () => {
      expect(() =>
        loginSchema.parse({ password: 'password123' })
      ).toThrow();
    });

    it('debería fallar si password está ausente', () => {
      expect(() =>
        loginSchema.parse({ userName: 'usuario@test.com' })
      ).toThrow();
    });

    it('debería fallar si el body está completamente vacío', () => {
      expect(() => loginSchema.parse({})).toThrow();
    });

    it('debería fallar si userName es solo espacios en blanco', () => {
      expect(() =>
        loginSchema.parse({ userName: '   ', password: 'password123' })
      ).toThrow('El usuario es requerido');
    });

    it('debería fallar si password es solo espacios en blanco', () => {
      expect(() =>
        loginSchema.parse({ userName: 'usuario@test.com', password: '   ' })
      ).toThrow('La contraseña es requerida');
    });
  });
});