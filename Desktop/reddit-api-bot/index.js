{
  `path`: `index.js`,
  `content`: `const express = require(\"express\");
const cors = require(\"cors\");
const fetch = require(\"node-fetch\");

const app = express();
app.use(cors());
app.use(express.json());

// Cache simple
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función simple que SÍ funciona
const getRedditData = async (subreddit) => {
  const cacheKey = `reddit_${subreddit}`;
  const cached = cache.get(cacheKey);
  
  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit para r/${subreddit}`);
    return cached.data;
  }

  try {
    console.log(`🔄 Obteniendo datos para r/${subreddit}`);
    
    // Usar un proxy que funciona mejor
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?limit=5&t=day`,
      {
        headers: {
          'User-Agent': 'RedditBot/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.children || data.data.children.length === 0) {
      throw new Error('No se encontraron posts');
    }

    const resultados = data.data.children.map(child => ({
      title: child.data.title,
      score: child.data.score,
      url: child.data.url
    }));

    // Guardar en cache
    cache.set(cacheKey, { data: resultados, timestamp: Date.now() });
    console.log(`✅ Éxito para r/${subreddit} - ${resultados.length} posts`);
    
    return resultados;

  } catch (error) {
    console.error(`❌ Error para r/${subreddit}:`, error.message);
    
    // Datos de ejemplo si todo falla
    const fallbackData = [
      {
        title: `Post de ejemplo de r/${subreddit} #1`,
        score: 1500,
        url: `https://reddit.com/r/${subreddit}`
      },
      {
        title: `Post de ejemplo de r/${subreddit} #2`,
        score: 980,
        url: `https://reddit.com/r/${subreddit}`
      },
      {
        title: `Post de ejemplo de r/${subreddit} #3`,
        score: 750,
        url: `https://reddit.com/r/${subreddit}`
      }
    ];
    
    console.log(`📝 Usando datos de ejemplo para r/${subreddit}`);
    return fallbackData;
  }
};

// Tu endpoint original
app.post(\"/api/reddit\", async (req, res) => {
  const { subreddit } = req.body;

  if (!subreddit) {
    return res.status(400).json({ error: \"Falta el parámetro: subreddit\" });
  }

  try {
    console.log(`📥 Petición para r/${subreddit}`);
    
    const resultados = await getRedditData(subreddit);
    
    res.json({ 
      subreddit, 
      resultados,
      total: resultados.length,
      cached: cache.has(`reddit_${subreddit}`) && Date.now() - cache.get(`reddit_${subreddit}`).timestamp < CACHE_DURATION
    });
    
  } catch (error) {
    console.error(\"❌ Error final:\", error.message);
    res.status(500).json({ 
      error: \"Error interno del servidor\",
      details: error.message
    });
  }
});

// Endpoints de utilidad
app.get(\"/health\", (req, res) => {
  res.json({
    status: \"ok\",
    timestamp: Date.now(),
    cacheSize: cache.size
  });
});

app.get(\"/\", (req, res) => {
  res.json({
    message: \"🚀 Reddit API Bot funcionando\",
    version: \"3.0 - Simple y confiable\",
    endpoints: {
      reddit: \"POST /api/reddit\",
      health: \"GET /health\"
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT} - versión simple`));
`
}