import prisma from "../../config/prisma";
import { CreateNotificationDTO } from "./notifications.schema";

export class NotificationsRepository {
  async findAll() {
    return prisma.notifications.findMany({
      select: {
        currentStock: true,
        minStock: true,
        createdAt: true,
        Products: {
          select: {
            id: true,
            name: true,
            barcode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByProductId(productId: number) {
    return prisma.notifications.findFirst({
      where: { productId: BigInt(productId) },
    });
  }

  async insert(dto: CreateNotificationDTO): Promise<void> {
    await prisma.notifications.create({
      data: {
        currentStock: dto.currentStock,
        minStock: dto.minStock,
        productId: BigInt(dto.productId),
      },
    });
  }

  async deleteByProductId(productId: number): Promise<void> {
    await prisma.notifications.deleteMany({
      where: { productId: BigInt(productId) },
    });
  }

  async countAll(): Promise<number> {
    return prisma.notifications.count();
  }
}