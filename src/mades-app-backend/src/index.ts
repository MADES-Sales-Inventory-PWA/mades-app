import "dotenv/config";
import express from "express";
import cors from "cors";
import personRoutes from "./modules/persons/persons.routes.js"
import userRoutes from "./modules/users/users.routes.js"
import prisma from "./config/prisma.js";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/persons", personRoutes)
app.use("/api/users", userRoutes)

app.get("/api/users/admin-exists", async (req, res) => {
  try {
    const totalAdmins = await prisma.users.count({
      where: {
        rolId: BigInt(1)
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        exists: totalAdmins > 0
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error al validar administrador"
    });
  }
});

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