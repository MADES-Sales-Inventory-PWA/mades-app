import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes"
import userRoutes from "./modules/users/users.routes"
import inventoryRoutes from "./modules/inventory/inventory.routes"
import sizesRoutes from "./modules/product-sizes/sizes.routes"
import productsRoutes from "./modules/products/products.routes"
import salesRoutes from "./modules/sales/sales.routes"
import reportsRoutes from "./modules/reports/reports.routes"
import notificationsRoutes from "./modules/notifications/notifications.routes"
import { AuthController } from "./modules/auth/auth.controller"

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;
const authController = new AuthController();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/sizes", sizesRoutes)
app.use("/api/products", productsRoutes)
app.use("/api/sales", salesRoutes)
app.use("/api/reports", reportsRoutes)
app.use("/api/notifications", notificationsRoutes);

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