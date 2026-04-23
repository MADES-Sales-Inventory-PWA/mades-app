import { Router } from "express";
import { SizeController } from "./sizes.controller";
import { sizeTypeIdRequestSchema } from "./schemas/sizes.request.schema";
import { validateMiddleware } from "../../core/middleware/validate-schema.middleware";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();
const sizeController = new SizeController();

router.get("/types", authMiddleware,
    sizeController.listSizeTypes.bind(sizeController));
router.get("/values/:id", authMiddleware,
    validateMiddleware(sizeTypeIdRequestSchema, "params"),
    sizeController.listSizeValuesByTypeId.bind(sizeController))

export default router;