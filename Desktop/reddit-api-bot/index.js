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
      `https://www.reddit.com/r/${subreddit}/top.json?limit=5`,
      {
        headers: {
          "User-Agent": "ChatGPTMonetizadorBot/1.0"
        }
      }
    );
    const data = await response.json();

    const resultados = data.data.children.map((post) => ({
      titulo: post.data.title,
      votos: post.data.ups,
      url: `https://reddit.com${post.data.permalink}`
    }));

    res.json({ subreddit, resultados });
  } catch (error) {
    console.error("❌ Error al buscar en Reddit:", error);
    res.status(500).json({ error: "No se pudo obtener resultados desde Reddit" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
