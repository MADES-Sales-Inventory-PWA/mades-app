import { CreateInventoryAdjustmentDTO, AdjustmentFilters } from "./inventory.schema";
import {
  InventoryRepository,
  RegisteredAdjustment,
} from "./inventory.repository";

export class InventoryService {
  constructor(private readonly repository = new InventoryRepository()) {}

  async registerAdjustment(
    userId: number,
    data: CreateInventoryAdjustmentDTO
  ): Promise<RegisteredAdjustment> {

    const product = await this.repository.findProductById(data.productId);

    if (!product) {
      throw new Error("No se encontro producto para el id indicado");
    }

    const productId = Number(product.id);

    const operatorPersonId = await this.repository.findOperatorPersonIdByUserId(
      userId
    );

    if (!operatorPersonId) {
      throw new Error("No se encontro la persona asociada al usuario autenticado");
    }

    const currentStockRow = await this.repository.findCurrentStock(productId);

    if (!currentStockRow) {
      throw new Error("No se encontro stock para el producto seleccionado");
    }

    const previousQty = Number(currentStockRow.quantity);

    const newQty =
      data.type === "LOSS"
        ? previousQty - data.quantity
        : previousQty + data.quantity;

    if (newQty < 0) {
      throw new Error("Stock insuficiente para registrar la perdida");
    }

    return this.repository.registerAdjustment(
      productId,
      product.barcode ?? "N/A",
      operatorPersonId,
      data,
      previousQty,
      newQty
    );
  }

  async listAdjustments(filters: AdjustmentFilters) {
    return this.repository.findAdjustments(filters);
  }

  async getAdjustmentById(id: number) {
    return this.repository.findAdjustmentById(id);
  }
}
