import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes"
import userRoutes from "./modules/users/users.routes"
import { AuthController } from "./modules/auth/auth.controller"

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;
const authController = new AuthController();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

// Temporary compatibility aliases while clients migrate to /api/users/login
app.post("/login", authController.login.bind(authController));
app.post("/api/login", authController.login.bind(authController));
app.post("/api/auth/login", authController.login.bind(authController));

app.get("/", (req, res) => {
  res.send("Backend corriendo");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});