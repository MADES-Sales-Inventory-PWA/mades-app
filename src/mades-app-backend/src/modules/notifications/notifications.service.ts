import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsRepository } from "./notifications.repository";
import { CreateNotificationDTO, NotificationDTO } from "./notifications.schema";

export class NotificationsService {
  constructor(private readonly repository = new NotificationsRepository()) {}

  async getNotifications(): Promise<NotificationDTO[]> {
    const raw = await this.repository.findAll();
    return NotificationsMapper.toDTOList(raw);
  }

  async getCount(): Promise<number> {
    return this.repository.countAll();
  }

  async createNotification(dto: CreateNotificationDTO): Promise<void> {
    await this.deleteNotificationByProductId(dto.productId);
    await this.repository.insert(dto);
  }

  async deleteNotificationByProductId(productId: number): Promise<void> {
    const existing = await this.repository.findByProductId(productId);
    if (!existing) return;
    await this.repository.deleteByProductId(productId);
  }
}