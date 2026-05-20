import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.middleware";
import { SalesController } from "./sales.controller";

const router = Router();
const controller = new SalesController();

router.post("/", authMiddleware, controller.registerSale.bind(controller));

export default router;