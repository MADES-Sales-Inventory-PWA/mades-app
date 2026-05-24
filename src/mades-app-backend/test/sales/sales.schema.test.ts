import { createSaleSchema } from '../../src/modules/sales/sales.schema';

describe('sales.schema - createSaleSchema', () => {

  describe('Casos válidos', () => {
    it('debe parsear una venta con un producto válido', () => {
      const result = createSaleSchema.parse({
        items: [{ productId: 1, quantity: 2, price: 25000 }],
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe(1);
    });

    it('debe aceptar notas opcionales y recortar los espacios', () => {
      const result = createSaleSchema.parse({
        items: [{ productId: 1, quantity: 1, price: 10000 }],
        notes: '  entrega en tienda  ',
      });
      expect(result.notes).toBe('entrega en tienda');
    });

    it('debe aceptar precio igual a cero', () => {
      const result = createSaleSchema.parse({
        items: [{ productId: 1, quantity: 1, price: 0 }],
      });
      expect(result.items[0].price).toBe(0);
    });

    it('debe aceptar una venta sin notas', () => {
      const result = createSaleSchema.parse({
        items: [{ productId: 1, quantity: 1, price: 5000 }],
      });
      expect(result.notes).toBeUndefined();
    });
  });

  describe('Casos inválidos', () => {
    it('debe lanzar error cuando la lista de productos está vacía', () => {
      expect(() =>
        createSaleSchema.parse({ items: [] })
      ).toThrow('La venta debe tener al menos un producto');
    });

    it('debe lanzar error cuando el id del producto es cero o negativo', () => {
      expect(() =>
        createSaleSchema.parse({ items: [{ productId: 0, quantity: 1, price: 1000 }] })
      ).toThrow('El id del producto no es válido');
    });

    it('debe lanzar error cuando la cantidad es cero', () => {
      expect(() =>
        createSaleSchema.parse({ items: [{ productId: 1, quantity: 0, price: 1000 }] })
      ).toThrow('La cantidad debe ser mayor que cero');
    });

    it('debe lanzar error cuando el precio es negativo', () => {
      expect(() =>
        createSaleSchema.parse({ items: [{ productId: 1, quantity: 1, price: -100 }] })
      ).toThrow('El precio no puede ser negativo');
    });

    it('debe lanzar error cuando las notas superan los 250 caracteres', () => {
      expect(() =>
        createSaleSchema.parse({
          items: [{ productId: 1, quantity: 1, price: 1000 }],
          notes: 'a'.repeat(251),
        })
      ).toThrow('La nota no puede superar 250 caracteres');
    });
  });
});