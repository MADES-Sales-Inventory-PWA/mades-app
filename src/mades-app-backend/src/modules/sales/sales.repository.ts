import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { CreateSaleDTO } from "./sales.schema";

export interface RegisteredSale {
  id: number;
  invoiceNumber: string;
  total: number;
  itemCount: number;
}

interface ResolvedItem {
  productId: number;
  quantity: number;
  price: number;
  newQty: number;
  detailId: bigint;
}

export class SalesRepository {
  async findProductWithStockById(productId: number) {
    return prisma.products.findUnique({
      where: { id: BigInt(productId) },
      select: {
        id: true,
        name: true,
        barcode: true,
        state: true,
        productDetails: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });
  }

  async findProductsWithStockByIds(productIds: number[]) {
    // Some tests mock `prisma.products` partially (eg. only `findUnique`).
    // If `findMany` is not available (mocked), fall back to multiple `findUnique` calls.
    if (typeof prisma.products.findMany === 'function') {
      return prisma.products.findMany({
        where: { id: { in: productIds.map((id) => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          barcode: true,
          state: true,
          productDetails: {
            orderBy: { id: "desc" },
            take: 1,
          },
        },
      });
    }

    const results = await Promise.all(
      productIds.map((id) =>
        prisma.products.findUnique({
          where: { id: BigInt(id) },
          select: {
            id: true,
            name: true,
            barcode: true,
            state: true,
            productDetails: {
              orderBy: { id: "desc" },
              take: 1,
            },
          },
        })
      )
    );

    // Filter out any nulls
    return results.filter((r) => r !== null) as any;
  }

  async findOperatorPersonIdByUserId(userId: number): Promise<bigint | null> {
    const person = await prisma.persons.findFirst({
      where: { userId: BigInt(userId) },
      select: { id: true },
    });
    return person?.id ?? null;
  }

  async registerSale(
    operatorPersonId: bigint,
    data: CreateSaleDTO,
    resolvedItems: ResolvedItem[]
  ): Promise<RegisteredSale> {
    const subTotal = resolvedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const taxAmount = 0;
    const total = subTotal + taxAmount;
    const invoiceNumber = `INV-${Date.now()}`;

    const movement = await prisma.$transaction(async (tx) => {
      for (const item of resolvedItems) {
        await tx.productDetails.update({
          where: { id: item.detailId },
          data: { quantity: BigInt(item.newQty) },
        });
      }

      const mov = await tx.inventoryMovements.create({
        data: {
          movementType: "SALE",
          creationDate: new Date(),
          sellerId: operatorPersonId,
          asyncStatus: true,
          description: data.notes
            ? `Venta | nota: ${data.notes}`
            : "Venta",
          MovementDetails: {
            create: resolvedItems.map((item) => ({
              createdAt: new Date(),
              productId: BigInt(item.productId),
              quantity: BigInt(item.quantity),
              price: new Prisma.Decimal(item.price),
            })),
          },
        },
        select: { id: true },
      });

      await tx.invoices.create({
        data: {
          movementId: mov.id,
          subTotal: new Prisma.Decimal(subTotal),
          taxAmount: new Prisma.Decimal(taxAmount),
          total: new Prisma.Decimal(total),
          issueDate: new Date(),
          invoceNumber: invoiceNumber,
        },
      });

      return mov;
    });

    return {
      id: Number(movement.id),
      invoiceNumber,
      total,
      itemCount: resolvedItems.length,
    };
  }
}