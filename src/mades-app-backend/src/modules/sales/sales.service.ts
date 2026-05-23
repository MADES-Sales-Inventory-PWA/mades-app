import { CreateSaleDTO } from "./sales.schema";
import { SalesRepository, RegisteredSale } from "./sales.repository";

export class SalesService {
  constructor(private readonly repository = new SalesRepository()) {}

  async registerSale(userId: number, data: CreateSaleDTO): Promise<RegisteredSale> {
    const operatorPersonId = await this.repository.findOperatorPersonIdByUserId(userId);

    if (!operatorPersonId) {
      throw new Error("No se encontró la persona asociada al usuario autenticado");
    }

    const resolvedItems: Array<{
      productId: number;
      quantity: number;
      price: number;
      newQty: number;
      detailId: bigint;
    }> = [];

    for (const item of data.items) {
      const product = await this.repository.findProductWithStockById(item.productId);

      if (!product) {
        throw new Error(`No se encontró el producto con id ${item.productId}`);
      }

      if (!product.state) {
        throw new Error(`El producto "${product.name}" no está activo`);
      }

      const detail = product.productDetails[0];

      if (!detail) {
        throw new Error(`No se encontró stock para el producto "${product.name}"`);
      }

      const currentQty = Number(detail.quantity);
      const newQty = currentQty - item.quantity;

      if (newQty < 0) {
        throw new Error(
          `Stock insuficiente para "${product.name}". Disponible: ${currentQty}`
        );
      }

      resolvedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        newQty,
        detailId: detail.id,
      });
    }

    return this.repository.registerSale(operatorPersonId, data, resolvedItems);
  }
}