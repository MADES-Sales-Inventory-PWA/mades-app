import { Router } from "express"
import { UserController } from "./users.controller"

const router = Router();
const userController = new UserController();

router.get("/admin-exists", userController.getAdminExists.bind(userController));
router.post("/register-initial-admin", userController.createFirstAdmin.bind(userController)); 
router.post("/", userController.createUser.bind(userController));
router.patch("/:id", userController.updateUser.bind(userController));
router.get("/", userController.findAll.bind(userController));

export default router;