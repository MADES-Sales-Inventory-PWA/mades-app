import { Router } from "express"
import { UserController } from "./users.controller"

const router = Router();
const userController = new UserController();

router.post("/", userController.createUser.bind(userController));

export default router;