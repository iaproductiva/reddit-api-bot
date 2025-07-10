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
      `https://api.pushshift.io/reddit/search/submission/?subreddit=${encodeURIComponent(subreddit)}&sort=desc&sort_type=score&size=5`
    );
    const data = await response.json();

    const resultados = (data.data || []).map((post) => ({
      titulo: post.title,
      votos: post.score,
      url: post.full_link || `https://reddit.com${post.permalink}`
    }));

    res.json({ subreddit, resultados });
  } catch (error) {
    console.error("❌ Error al buscar en Pushshift:", error);
    res.status(500).json({ error: "No se pudo obtener resultados desde Pushshift" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

