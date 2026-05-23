import { createInventoryAdjustmentSchema } from '../../src/modules/inventory/inventory.schema';

describe('inventory.schema - createInventoryAdjustmentSchema', () => {

  describe('Casos válidos', () => {
    it('debe retornar el tipo y la razón correctos al parsear un ajuste de pérdida con razón permitida', () => {
      const result = createInventoryAdjustmentSchema.parse({
        productId: 1,
        type: 'LOSS',
        quantity: 5,
        reason: 'DAMAGED',
      });
      expect(result.type).toBe('LOSS');
      expect(result.reason).toBe('DAMAGED');
    });

    it('debe retornar el tipo y la razón correctos al parsear un ajuste de ganancia con razón permitida', () => {
      const result = createInventoryAdjustmentSchema.parse({
        productId: 1,
        type: 'GAIN',
        quantity: 10,
        reason: 'RESTOCK',
      });
      expect(result.type).toBe('GAIN');
      expect(result.reason).toBe('RESTOCK');
    });

    it('debe aceptar notes opcionales y recortar espacios', () => {
      const result = createInventoryAdjustmentSchema.parse({
        productId: 1,
        type: 'LOSS',
        quantity: 1,
        reason: 'LOST',
        notes: '  nota con espacios  ',
      });
      expect(result.notes).toBe('nota con espacios');
    });

    it('debe aceptar ajuste manual tanto para pérdida como para ganancia', () => {
      expect(createInventoryAdjustmentSchema.parse({ productId: 1, type: 'LOSS', quantity: 1, reason: 'MANUAL' }).reason).toBe('MANUAL');
      expect(createInventoryAdjustmentSchema.parse({ productId: 1, type: 'GAIN', quantity: 1, reason: 'MANUAL' }).reason).toBe('MANUAL');
    });
  });

  describe('Casos inválidos - campos', () => {
    it('debe aceptar ajuste manual tanto para pérdida como para ganancia', () => {
      expect(() => createInventoryAdjustmentSchema.parse({ productId: 0, type: 'LOSS', quantity: 1, reason: 'DAMAGED' })).toThrow();
    });

    it('debe lanzar error con mensaje claro si la cantidad es cero', () => {
      expect(() => createInventoryAdjustmentSchema.parse({ productId: 1, type: 'LOSS', quantity: 0, reason: 'DAMAGED' }))
        .toThrow('La cantidad debe ser mayor que cero');
    });

    it('debe lanzar error con mensaje claro si las notas superan los 250 caracteres', () => {
      expect(() => createInventoryAdjustmentSchema.parse({
        productId: 1, type: 'LOSS', quantity: 1, reason: 'DAMAGED', notes: 'a'.repeat(251),
      })).toThrow('La nota no puede superar los 250 caracteres');
    });
  });

  describe('Validación combinaciones type/reason', () => {
    it('debe lanzar error si se intenta registrar una reposición como pérdidad', () => {
      expect(() => createInventoryAdjustmentSchema.parse({ productId: 1, type: 'LOSS', quantity: 1, reason: 'RETURN' }))
        .toThrow('La razon RETURN no es valida para el tipo LOSS');
    });

    it('debe lanzar error si se intenta registrar uN daño como ganancia', () => {
      expect(() => createInventoryAdjustmentSchema.parse({ productId: 1, type: 'GAIN', quantity: 1, reason: 'DAMAGED' }))
        .toThrow('La razon DAMAGED no es valida para el tipo GAIN');
    });

    it('debe lanzar error si se intenta registrar una perdida como ganancia', () => {
      expect(() => createInventoryAdjustmentSchema.parse({ productId: 1, type: 'GAIN', quantity: 1, reason: 'STOLEN' }))
        .toThrow('La razon STOLEN no es valida para el tipo GAIN');
    });
  });
});