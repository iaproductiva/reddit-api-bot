const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// RUTA POST PARA CONSULTAR REDDIT DIRECTAMENTE
app.post("/api/reddit", async (req, res) => {
  const { query, subreddit } = req.body;

  if (!query || !subreddit) {
    return res.status(400).json({ error: "Faltan parámetros: query o subreddit" });
  }

  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=top&limit=5`);
    const data = await response.json();

    const resultados = data.data.children.map((post) => ({
      titulo: post.data.title,
      votos: post.data.ups,
      url: `https://reddit.com${post.data.permalink}`
    }));

    res.json({ query, subreddit, resultados });
  } catch (error) {
    console.error("❌ Error al buscar en Reddit:", error);
    res.status(500).json({ error: "No se pudo obtener resultados desde Reddit" });
  }
});

// RUTA GET FLEXIBLE PARA LLAMADOS DESDE NAVEGADOR O APPS
app.get("/tendencias", async (req, res) => {
  const { subreddit, query, accion } = req.query;

  if (accion === "guiones") {
    return res.json({
      idea: "Aquí puedes recibir ideas de guiones si activas esta función con el parámetro 'accion=guiones'."
    });
  }

  if (!subreddit || !query) {
    return res.status(400).json({ error: "Faltan parámetros: subreddit y query" });
  }

  try {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=top&limit=5`);
    const data = await response.json();

    const resultados = data.data.children.map((post) => ({
      titulo: post.data.title,
      votos: post.data.ups,
      url: `https://reddit.com${post.data.permalink}`
    }));

    res.json({ query, subreddit, resultados });
  } catch (error) {
    console.error("❌ Error al consultar desde /tendencias:", error);
    res.status(500).json({ error: "No se pudo obtener resultados desde Reddit" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
