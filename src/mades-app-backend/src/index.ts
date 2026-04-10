import express from "express";
import cors from "cors";
import userRoutes from "./modules/users/users.routes"
import authRoutes from "./modules/auth/auth.routes"

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Backend corriendo");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});