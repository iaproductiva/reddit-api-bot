const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/reddit", async (req, res) => {
  const { subreddit } = req.body;

  if (!subreddit) {
    return res.status(400).json({ error: "Falta el parámetro: subreddit" });
  }

  try {
    const response = await fetch(
      `https://reddit-search.deno.dev/?type=top&subreddit=${encodeURIComponent(subreddit)}&limit=5`
    );
    const data = await response.json();

    const resultados = (data.results || []).map((post) => ({
      titulo: post.title,
      votos: post.score,
      url: post.url
    }));

    res.json({ subreddit, resultados });
  } catch (error) {
    console.error("❌ Error al buscar en reddit-search.deno.dev:", error);
    res.status(500).json({ error: "No se pudo obtener resultados desde reddit-search.deno.dev" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

