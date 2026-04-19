import { Router } from "express"
import { PersonController } from "./persons.controller"

const router = Router();
const personController = new PersonController();

router.post("/register-initial-admin", personController.createPerson.bind(personController));

export default router;
