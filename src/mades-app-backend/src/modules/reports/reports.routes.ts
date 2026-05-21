import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware";
import { adminMiddleware } from "../../core/middleware/admin.middleware";
import { ReportsController } from "./reports.controller";

const router = Router();
const controller = new ReportsController();

router.get("/sales", authMiddleware, adminMiddleware, controller.getSalesHistory.bind(controller));
router.get(
  "/inventory-adjustments",
  authMiddleware,
  adminMiddleware,
  controller.getInventoryAdjustments.bind(controller)
);

export default router;