import { NotificationDTO } from "./notifications.schema";

type RawNotification = {
  currentStock: number;
  minStock: number;
  createdAt: Date;
  Products: {
    id: bigint;
    name: string;
    barcode: string;
  } | null;
};

export class NotificationsMapper {
    static toDTO(raw: RawNotification): NotificationDTO {
        return {
            currentStock: raw.currentStock,
            minStock: raw.minStock,
            createdAt: raw.createdAt.toISOString().slice(0, 16) + "Z",
            product: {
                id: Number(raw.Products?.id),
                name: raw.Products?.name ?? "N/A",
                barcode: raw.Products?.barcode ?? "N/A",
            },
        };
    }

    static toDTOList(raws: RawNotification[]): NotificationDTO[] {
        return raws.map((raw) => this.toDTO(raw));
    }
}