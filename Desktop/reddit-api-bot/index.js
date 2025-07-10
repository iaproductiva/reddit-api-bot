const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Ruta raíz para testear
app.get("/", (req, res) => {
  res.send("¡Servidor IA activo desde Render!");
});

// Ruta para recibir comandos desde ChatGPT
app.post("/api/reddit", (req, res) => {
  const { comando } = req.body;
  console.log("📥 Comando recibido desde ChatGPT:", comando);

  // Acá va la lógica de respuesta, por ahora simple
  res.json({ respuesta: `Comando recibido: ${comando}` });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
