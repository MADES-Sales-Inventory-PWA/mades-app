import express = require("express");
import cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend corriendo");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Intento de login con:", email, password);

  return res.json({ message: `Intento de login con las credenciales: ${email}, ${password}` });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});