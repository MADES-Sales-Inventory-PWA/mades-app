import { Router } from "express"
import { PersonController } from "./persons.controller"

const router = Router();
const personController = new PersonController();

router.post("/", personController.createPerson.bind(personController));

export default router;