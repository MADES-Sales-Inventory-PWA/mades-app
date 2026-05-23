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
router.get("/sales-per-day", authMiddleware, adminMiddleware, controller.getSalesPerDay.bind(controller))
router.get("/sales-per-month", authMiddleware, adminMiddleware, controller.getSalesPerMonth.bind(controller))
router.get("/sales-per-week", authMiddleware, adminMiddleware, controller.getSalesPerWeek.bind(controller))
router.get("/sales-per-employee", authMiddleware, adminMiddleware, controller.getSalesPerEmployee.bind(controller))

export default router;