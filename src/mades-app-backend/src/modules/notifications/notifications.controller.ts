import { Request, Response } from "express";
import { NotificationsService } from "./notifications.service";
import { sendError } from "../../core/utils/api-error-handler";
import { ApiErrorCode } from "../../shared/errors/api-error-codes";
import { GetNotificationsResponse } from "./notifications.schema";

const notificationsService = new NotificationsService();

export class NotificationsController {

    async getNotifications(req: Request, res: Response) {
        try {
            const data = await notificationsService.getNotifications();

            const response: GetNotificationsResponse = {
                success: true,
                message: "Notificaciones obtenidas correctamente",
                data,
            };

            return res.status(200).json(response);

        } catch (error) {
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al obtener las notificaciones");
        }
    }

    async getCount(req: Request, res: Response) {
        try {
            const count = await notificationsService.getCount();

            return res.status(200).json({
                success: true,
                message: "Cantidad de notificaciones obtenida correctamente",
                count,
            });

        } catch (error) {
            return sendError(res, 500, ApiErrorCode.INTERNAL_ERROR, "Error al obtener la cantidad de notificaciones");
        }
    }

}