import "dotenv/config";
import express from "express";
import cors from "cors";
import personRoutes from "./modules/persons/persons.routes"
import userRoutes from "./modules/users/users.routes"
import { UserController } from "./modules/users/users.controller";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;
const userController = new UserController();

app.use(cors());
app.use(express.json());

app.use("/api/persons", personRoutes)
app.use("/api/users", userRoutes)

// Temporary compatibility aliases while clients migrate to /api/users/login
app.post("/login", userController.login.bind(userController));
app.post("/api/login", userController.login.bind(userController));
app.post("/api/auth/login", userController.login.bind(userController));

app.get("/", (req, res) => {
  res.send("Backend corriendo");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});