import { Router } from "express";
import { NotificationsController } from "./notifications.controller";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();
const notificationsController = new NotificationsController();

router.get("/count", authMiddleware, notificationsController.getCount.bind(notificationsController));
router.get("/", authMiddleware, notificationsController.getNotifications.bind(notificationsController));

export default router;