import { CreateSaleDTO } from "./sales.schema";
import { SalesRepository, RegisteredSale } from "./sales.repository";
import { NotificationsService } from "../notifications/notifications.service";

export class SalesService {
  constructor(
    private readonly repository = new SalesRepository(),
    private readonly notificationsService = new NotificationsService()
  ) { }

  async registerSale(userId: number, data: CreateSaleDTO): Promise<RegisteredSale> {
    const operatorPersonId = await this.repository.findOperatorPersonIdByUserId(userId);

    if (!operatorPersonId) {
      throw new Error("No se encontró la persona asociada al usuario autenticado");
    }

    const productIds = data.items.map((item) => item.productId);
    const products = await this.repository.findProductsWithStockByIds(productIds);
    const productMap = new Map(products.map((p) => [Number(p.id), p]));

    const resolvedItems: Array<{
      productId: number;
      quantity: number;
      price: number;
      newQty: number;
      detailId: bigint;
      minQuantity: number;
    }> = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);

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
        minQuantity: Number(detail.minQuantity),
      });
    }

    const result = await this.repository.registerSale(operatorPersonId, data, resolvedItems);

    try {
      for (const item of resolvedItems) {
        if (item.newQty < item.minQuantity) {
          await this.notificationsService.createNotification({
            currentStock: item.newQty,
            minStock: item.minQuantity,
            productId: item.productId,
          });
        } else {
          await this.notificationsService.deleteNotificationByProductId(item.productId);
        }
      }
    } catch (notificationError) {
      console.error("[registerSale] Error al gestionar notificaciones:", notificationError);
    }

    return result;
  }
}