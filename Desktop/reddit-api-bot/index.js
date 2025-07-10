// Ruta para recibir consultas desde ChatGPT
app.post("/api/reddit", (req, res) => {
  const { query, subreddit } = req.body;
  console.log("📥 Consulta recibida:", query, "Subreddit:", subreddit);

  res.json({ 
    respuesta: `Consulta recibida: "${query}" en el subreddit "${subreddit}"` 
  });
});
