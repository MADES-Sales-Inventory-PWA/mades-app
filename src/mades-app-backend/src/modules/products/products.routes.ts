import { Router } from "express";
import { ProductsController } from "./products.controller";
import { sizeTypeIdRequestSchema } from "../product-sizes/schemas/sizes.request.schema";
import { validateMiddleware } from "../../core/middleware/validate-schema.middleware";
import { createProductRequestSchema, listProductsQueryRequestSchema, updateProductRequestSchema } from "./schemas";
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();
const productsController = new ProductsController();

router.post("/", authMiddleware,
    validateMiddleware(createProductRequestSchema, "body"),
    productsController.createProduct.bind(productsController));
router.patch("/:id", authMiddleware,
    validateMiddleware(updateProductRequestSchema, "body"),
    productsController.updateProduct.bind(productsController));
router.get("/", authMiddleware,
    validateMiddleware(listProductsQueryRequestSchema, "query"),
    productsController.listProducts.bind(productsController));
router.get("/:id", authMiddleware,
    productsController.getProductById.bind(productsController));
router.patch("/:id/state", authMiddleware,
    productsController.setProductState.bind(productsController));

export default router;