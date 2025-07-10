const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("¡Servidor IA activo desde Render!");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

