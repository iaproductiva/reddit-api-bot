const express = require("express");
const bodyParser = require("body-parser");
const app = express(); // <-- ESTA línea define "app"
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡Servidor IA activo desde Render!");
});

// ✅ Ruta POST mejorada
app.post("/api/reddit", (req, res) => {
  const { query, subreddit } = req.body;

  res.json({
    respuesta: `Consulta recibida: "${query}" en el subreddit "${subreddit}"`
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
