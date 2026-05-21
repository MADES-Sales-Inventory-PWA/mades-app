import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { ReportFiltersDTO, ReportReason } from "./reports.schema";

type ReportEmployee = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  documentNumber: string;
};

type ReportProduct = {
  id: number;
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  lineTotal: number;
};

export type SalesHistoryItem = {
  id: number;
  createdAt: Date;
  employee: ReportEmployee | null;
  invoiceNumber: string | null;
  total: number;
  products: ReportProduct[];
};

export type InventoryAdjustmentItem = {
  id: number;
  createdAt: Date;
  employee: ReportEmployee | null;
  type: "LOSS" | "GAIN";
  reason: ReportReason | null;
  reasonLabel: string | null;
  quantity: number;
  description: string;
  notes: string | null;
  product: ReportProduct | null;
};

const reasonLabelMap: Record<ReportReason, string> = {
  DAMAGED: "Daño",
  LOST: "Pérdida",
  STOLEN: "Robo",
  RETURN: "Reposición",
  RESTOCK: "Reposición de inventario",
  MANUAL: "Ajuste manual",
};

function buildDateRange(where: Prisma.DateTimeFilter, from?: Date, to?: Date) {
  if (from) {
    where.gte = from;
  }

  if (to) {
    where.lte = to;
  }

  return where;
}

function parseAdjustmentReason(description: string): ReportReason | null {
  const match = description.match(/razon:\s*([A-Z_]+)/i);

  if (!match?.[1]) {
    return null;
  }

  const value = match[1].toUpperCase() as ReportReason;
  return value in reasonLabelMap ? value : null;
}

function parseAdjustmentNotes(description: string): string | null {
  const match = description.match(/\|\s*nota:\s*(.+)$/i);
  return match?.[1]?.trim() || null;
}

export class ReportsRepository {
  async findSalesHistory(filters: ReportFiltersDTO) {
    const where: Prisma.InventoryMovementsWhereInput = {
      movementType: "SALE",
    };

    if (filters.employeeId) {
      where.sellerId = BigInt(filters.employeeId);
    }

    if (filters.from || filters.to) {
      where.creationDate = buildDateRange({}, filters.from, filters.to);
    }

    const total = await prisma.inventoryMovements.count({ where });
    const skip = (filters.page - 1) * filters.pageSize;

    const movements = await prisma.inventoryMovements.findMany({
      where,
      include: {
        Persons: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            documentNumber: true,
          },
        },
        Invoices: {
          select: {
            invoceNumber: true,
            total: true,
          },
        },
        MovementDetails: {
          include: {
            Products: {
              select: {
                id: true,
                name: true,
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

    const data: SalesHistoryItem[] = movements.map((movement) => {
      const invoice = movement.Invoices[0] ?? null;

      return {
        id: Number(movement.id),
        createdAt: movement.creationDate,
        employee: movement.Persons
          ? {
            id: Number(movement.Persons.id),
            name: movement.Persons.name,
            lastName: movement.Persons.lastName,
            email: movement.Persons.email,
            documentNumber: movement.Persons.documentNumber,
          }
          : null,
        invoiceNumber: invoice?.invoceNumber ?? null,
        total: invoice ? Number(invoice.total) : 0,
        products: movement.MovementDetails.map((detail) => {
          const quantity = Number(detail.quantity);
          const price = Number(detail.price);

          return {
            id: Number(detail.Products?.id ?? detail.productId),
            name: detail.Products?.name ?? "Producto sin nombre",
            barcode: detail.Products?.barcode ?? "N/A",
            quantity,
            price,
            lineTotal: quantity * price,
          };
        }),
      };
    });

    return {
      data,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async findInventoryAdjustments(filters: ReportFiltersDTO) {
    const where: Prisma.InventoryMovementsWhereInput = {
      description: {
        contains: "Ajuste",
      },
    };

    if (filters.employeeId) {
      where.sellerId = BigInt(filters.employeeId);
    }

    if (filters.reason) {
      where.description = {
        contains: `razon: ${filters.reason}`,
      };
    }

    if (filters.from || filters.to) {
      where.creationDate = buildDateRange({}, filters.from, filters.to);
    }

    const total = await prisma.inventoryMovements.count({ where });
    const skip = (filters.page - 1) * filters.pageSize;

    const movements = await prisma.inventoryMovements.findMany({
      where,
      include: {
        Persons: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            documentNumber: true,
          },
        },
        MovementDetails: {
          include: {
            Products: {
              select: {
                id: true,
                name: true,
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

    const data: InventoryAdjustmentItem[] = movements.map((movement) => {
      const detail = movement.MovementDetails[0] ?? null;
      const type = movement.movementType === "DECREASE" ? "LOSS" : "GAIN";
      const reason = parseAdjustmentReason(movement.description);

      return {
        id: Number(movement.id),
        createdAt: movement.creationDate,
        employee: movement.Persons
          ? {
            id: Number(movement.Persons.id),
            name: movement.Persons.name,
            lastName: movement.Persons.lastName,
            email: movement.Persons.email,
            documentNumber: movement.Persons.documentNumber,
          }
          : null,
        type,
        reason,
        reasonLabel: reason ? reasonLabelMap[reason] : null,
        quantity: detail ? Number(detail.quantity) : 0,
        description: movement.description,
        notes: parseAdjustmentNotes(movement.description),
        product: detail
          ? {
            id: Number(detail.Products?.id ?? detail.productId),
            name: detail.Products?.name ?? "Producto sin nombre",
            barcode: detail.Products?.barcode ?? "N/A",
            quantity: Number(detail.quantity),
            price: Number(detail.price),
            lineTotal: Number(detail.quantity) * Number(detail.price),
          }
          : null,
      };
    });

    return {
      data,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }
  async findSalesPerDay(startDay: Date, endDay: Date) {

    return await prisma.inventoryMovements.findMany({
      where: {
        movementType: "SALE",
        creationDate: {
          gte: startDay,
          lte: endDay,
        }
      },
      include: {
        Persons: {
          select: {
            name: true,
            lastName: true,
            documentType: true,
            documentNumber: true
          },
        },
        Invoices: {
          select: {
            invoceNumber: true,
            total: true,
          },
        },
        MovementDetails: {
          include: {
            Products: {
              select: {
                name: true,
                barcode: true,
                sellingPrice: true
              },
            },
          },
        },
      },
      orderBy: {
        creationDate: "asc",
      },
    })
  }
  async salesPerEmployee() {
    return await prisma.inventoryMovements.findMany({
      where: {
        movementType: "SALE",
      }, select: {
        sellerId: true,
        Persons: {
          select: {
            name: true,
            lastName: true,
          },
        },
        Invoices: {
          select: {
            total: true,
          },
        },
      },
    });
  }
}