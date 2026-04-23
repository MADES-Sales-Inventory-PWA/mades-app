import { Router } from "express"
import { UserController } from "./users.controller"
import { authMiddleware } from "../../core/middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.get("/admin-exists", userController.getAdminExists.bind(userController));
router.post("/register-initial-admin", userController.createFirstAdmin.bind(userController)); 
router.post("/", authMiddleware,userController.createUser.bind(userController));
router.patch("/:id",authMiddleware, userController.updateUser.bind(userController));
router.get("/", authMiddleware,userController.findAll.bind(userController));
router.patch("/:id/status",authMiddleware, userController.changeStatus.bind(userController));

export default router;