import express from "express";
import cors from "cors";
import userRoutes from "./modules/users/users.routes"

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes)

app.get("/", (req, res) => {
  res.send("Backend corriendo");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Intento de login con:", email, password);

  return res.json({ message: `Intento de login con las credenciales: ${email}, ${password}` });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});