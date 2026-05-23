import { sizeTypeSchema, sizeValueSchema } from '../../src/modules/product-sizes/sizes.schema';

describe('sizes.schema - sizeTypeSchema', () => {

  describe('Casos válidos', () => {
    it('debe parsear un tipo de talla con id y nombre válidos', () => {
      const result = sizeTypeSchema.parse({ id: 1, name: 'Talla de ropa' });
      expect(result.id).toBe(1);
      expect(result.name).toBe('Talla de ropa');
    });

    it('debe aceptar nombres con letras, números y espacios', () => {
      const result = sizeTypeSchema.parse({ id: 1, name: 'Talla 42' });
      expect(result.name).toBe('Talla 42');
    });

    it('debe aceptar nombres con tildes y la letra ñ', () => {
      const result = sizeTypeSchema.parse({ id: 1, name: 'Tañas' });
      expect(result.name).toBe('Tañas');
    });
  });

  describe('Casos inválidos', () => {
    it('debe lanzar error si el nombre tiene menos de 2 caracteres', () => {
      expect(() => sizeTypeSchema.parse({ id: 1, name: 'A' }))
        .toThrow('El nombre debe tener al menos 2 caracteres');
    });

    it('debe lanzar error si el nombre supera los 50 caracteres', () => {
      expect(() => sizeTypeSchema.parse({ id: 1, name: 'A'.repeat(51) }))
        .toThrow('El nombre no puede superar los 50 caracteres');
    });

    it('debe lanzar error si el nombre contiene caracteres especiales no permitidos', () => {
      expect(() => sizeTypeSchema.parse({ id: 1, name: 'Talla@#!' }))
        .toThrow('El nombre contiene caracteres no permitidos');
    });

    it('debe lanzar error si el id es cero o negativo', () => {
      expect(() => sizeTypeSchema.parse({ id: 0, name: 'Talla de ropa' })).toThrow();
    });
  });
});

describe('sizes.schema - sizeValueSchema', () => {

  describe('Casos válidos', () => {
    it('debe parsear un valor de talla con todos los campos válidos', () => {
      const result = sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: 'M', sortOrder: 0 });
      expect(result.value).toBe('M');
      expect(result.sortOrder).toBe(0);
    });

    it('debe aceptar valores con formato de talla numérica', () => {
      const result = sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: '42', sortOrder: 1 });
      expect(result.value).toBe('42');
    });

    it('debe aceptar valores con formato de talla compuesta', () => {
      const result = sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: '28x30', sortOrder: 2 });
      expect(result.value).toBe('28x30');
    });

    it('debe asignar 0 como orden por defecto cuando no se envía', () => {
      const result = sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: 'S' });
      expect(result.sortOrder).toBe(0);
    });
  });

  describe('Casos inválidos', () => {
    it('debe lanzar error si el valor está vacío', () => {
      expect(() => sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: '' }))
        .toThrow('El valor no puede estar vacío');
    });

    it('debe lanzar error si el valor supera los 20 caracteres', () => {
      expect(() => sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: 'A'.repeat(21) }))
        .toThrow('El valor no puede superar los 20 caracteres');
    });

    it('debe lanzar error si el valor contiene caracteres no permitidos', () => {
      expect(() => sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: 'S@#!' }))
        .toThrow('Formato de talla inválido (ej: S, M, XL, 42, 28x30)');
    });

    it('debe lanzar error si el orden es negativo', () => {
      expect(() => sizeValueSchema.parse({ id: 1, sizeTypeId: 1, value: 'S', sortOrder: -1 }))
        .toThrow('El orden no puede ser negativo');
    });

    it('debe lanzar error si el id del tipo de talla es cero o negativo', () => {
      expect(() => sizeValueSchema.parse({ id: 1, sizeTypeId: 0, value: 'S' }))
        .toThrow('El tipo de talla debe ser un ID válido');
    });
  });
});