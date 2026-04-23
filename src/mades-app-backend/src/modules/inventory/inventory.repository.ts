import { Prisma, movement_type } from "@prisma/client";
import prisma from "../../config/prisma";
import { CreateInventoryAdjustmentDTO, AdjustmentFilters } from "./inventory.schema";

export interface RegisteredAdjustment {
  id: number;
  productId: number;
  barcode: string;
  previousQty: number;
  newQty: number;
}

export class InventoryRepository {
  async findProductById(productId: number) {
    return prisma.products.findUnique({
      where: {
        id: BigInt(productId),
      },
      select: {
        id: true,
        barcode: true,
      },
    });
  }

  async findOperatorPersonIdByUserId(userId: number): Promise<bigint | null> {
    const person = await prisma.persons.findFirst({
      where: {
        userId: BigInt(userId),
      },
      select: {
        id: true,
      },
    });

    return person?.id ?? null;
  }

  async findCurrentStock(productId: number) {
    return prisma.productDetails.findFirst({
      where: {
        productId: BigInt(productId),
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  async registerAdjustment(
    productId: number,
    barcode: string,
    operatorPersonId: bigint,
    data: CreateInventoryAdjustmentDTO,
    previousQty: number,
    newQty: number
  ): Promise<RegisteredAdjustment> {
    const movementType: movement_type =
      data.type === "LOSS" ? movement_type.DECREASE : movement_type.SALE;

    const movement = await prisma.$transaction(async (tx) => {
      await tx.productDetails.update({
        where: {
          id: (await tx.productDetails.findFirstOrThrow({
            where: { productId: BigInt(productId) },
            orderBy: { id: "desc" },
            select: { id: true },
          })).id,
        },
        data: {
          quantity: BigInt(newQty),
        },
      });

      return tx.inventoryMovements.create({
        data: {
          movementType,
          creationDate: new Date(),
          sellerId: operatorPersonId,
          asyncStatus: false,
          description: `Ajuste ${data.type} | razon: ${data.reason}${
            data.notes ? ` | nota: ${data.notes}` : ""
          }`,
          MovementDetails: {
            create: {
              createdAt: new Date(),
              productId: BigInt(productId),
              quantity: BigInt(data.quantity),
              price: new Prisma.Decimal(0),
            },
          },
        },
        select: {
          id: true,
        },
      });
    });

    return {
      id: Number(movement.id),
      productId,
      barcode,
      previousQty,
      newQty,
    };
  }

  async findAdjustments(filters: AdjustmentFilters) {
    const where: Prisma.InventoryMovementsWhereInput = {};

    if (filters.productId) {
      where.MovementDetails = {
        some: {
          productId: BigInt(filters.productId),
        },
      };
    }

    if (filters.type) {
      where.movementType = filters.type === "LOSS" ? "DECREASE" : "SALE";
    }

    if (filters.reason) {
      where.description = {
        contains: filters.reason,
      };
    }

    if (filters.from || filters.to) {
      where.creationDate = {};
      if (filters.from) {
        (where.creationDate as any).gte = filters.from;
      }
      if (filters.to) {
        (where.creationDate as any).lte = filters.to;
      }
    }

    const total = await prisma.inventoryMovements.count({ where });

    const skip = (filters.page - 1) * filters.pageSize;

    const adjustments = await prisma.inventoryMovements.findMany({
      where,
      include: {
        MovementDetails: {
          include: {
            Products: {
              select: {
                id: true,
                barcode: true,
              },
            },
          },
        },
      },
      orderBy: {
        creationDate: "desc",
      },
      skip,
      take: filters.pageSize,
    });

    const data = adjustments.map((adj) => {
      const detail = adj.MovementDetails[0];
      const type = adj.movementType === "DECREASE" ? "LOSS" : "GAIN";
      return {
        id: Number(adj.id),
        productId: Number(detail.productId),
        barcode: detail.Products?.barcode || "N/A",
        type,
        quantity: Number(detail.quantity),
        description: adj.description,
        createdAt: adj.creationDate,
      };
    });

    return {
      data,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async findAdjustmentById(id: number) {
    const adjustment = await prisma.inventoryMovements.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        MovementDetails: {
          include: {
            Products: {
              select: {
                id: true,
                barcode: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!adjustment) {
      return null;
    }

    const detail = adjustment.MovementDetails[0];
    const type = adjustment.movementType === "DECREASE" ? "LOSS" : "GAIN";

    return {
      id: Number(adjustment.id),
      productId: Number(detail.productId),
      product: detail.Products
        ? {
            name: detail.Products.name,
            barcode: detail.Products.barcode,
          }
        : null,
      type,
      quantity: Number(detail.quantity),
      description: adjustment.description,
      createdAt: adjustment.creationDate,
    };
  }
}
