import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware";
import { InventoryController } from "./inventory.controller";

const router = Router();
const controller = new InventoryController();

router.get(
  "/adjustments",
  authMiddleware,
  controller.listAdjustments.bind(controller)
);

router.get(
  "/adjustments/:id",
  authMiddleware,
  controller.getAdjustmentById.bind(controller)
);

router.post(
  "/adjustments",
  authMiddleware,
  controller.registerAdjustment.bind(controller)
);

export default router;
