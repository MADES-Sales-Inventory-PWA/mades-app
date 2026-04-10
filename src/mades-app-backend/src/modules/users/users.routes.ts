import { Router } from "express"
import { UserController } from "./users.controller"

const router = Router();
const userController = new UserController();

router.get("/admin-exists", userController.getAdminExists.bind(userController));
router.post("/", userController.createUser.bind(userController));

export default router;