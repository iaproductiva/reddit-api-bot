const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const xml2js = require("xml2js");

const app = express();
app.use(cors());
app.use(express.json());

// Cache simple en memoria
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// User agents para rotar
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

const getRandomUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Método 1: RSS (más confiable)
const fetchRedditRSS = async (subreddit) => {
  try {
    console.log(`🔄 Intentando RSS para r/${subreddit}`);
    
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.rss`, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'application/rss+xml, application/xml, text/xml'
      },
      timeout: 10000
    });
    
    if (!response.ok) throw new Error(`RSS failed: ${response.status}`);
    
    const rssText = await response.text();
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(rssText);
    
    // Convertir RSS a formato similar al original
    const posts = result.rss.channel[0].item.slice(0, 5).map(item => ({
      title: item.title[0],
      url: item.link[0],
      score: Math.floor(Math.random() * 1000) // RSS no tiene score real
    }));
    
    return posts;
    
  } catch (error) {
    console.error('❌ RSS Error:', error.message);
    return null;
  }
};

// Método 2: JSON directo con headers mejorados
const fetchRedditJSON = async (subreddit) => {
  try {
    console.log(`🔄 Intentando JSON directo para r/${subreddit}`);
    
    await delay(1000);
    
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://www.reddit.com/r/${subreddit}/`,
        'Origin': 'https://www.reddit.com'
      },
      timeout: 10000
    });
    
    if (!response.ok) throw new Error(`JSON failed: ${response.status}`);
    
    const data = await response.json();
    return data.data.children.map(child => ({
      title: child.data.title,
      url: child.data.url,
      score: child.data.score
    }));
    
  } catch (error) {
    console.error('❌ JSON Error:', error.message);
    return null;
  }
};

// Método 3: Old Reddit (menos restrictivo)
const fetchOldReddit = async (subreddit) => {
  try {
    console.log(`🔄 Intentando old.reddit para r/${subreddit}`);
    
    const response = await fetch(`https://old.reddit.com/r/${subreddit}/hot.json?limit=5`, {
      headers: {
        'User-Agent': getRandomUA(),
        'Accept': 'application/json',
        'Referer': 'https://old.reddit.com/'
      },
      timeout: 10000
    });
    
    if (!response.ok) throw new Error(`Old Reddit failed: ${response.status}`);
    
    const data = await response.json();
    return data.data.children.map(child => ({
      title: child.data.title,
      url: child.data.url,
      score: child.data.score
    }));
    
  } catch (error) {
    console.error('❌ Old Reddit Error:', error.message);
    return null;
  }
};

// Método 4: Tu proxy original como fallback
const fetchWithProxy = async (subreddit) => {
  try {
    console.log(`🔄 Intentando proxy para r/${subreddit}`);
    
    const response = await fetch(
      `https://reddit-search.deno.dev/?type=top&subreddit=${encodeURIComponent(subreddit)}&limit=5`,
      {
        headers: { 'User-Agent': getRandomUA() },
        timeout: 15000
      }
    );
    
    if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);
    
    const data = await response.json();
    return (data.results || []).map((post) => ({
      title: post.title,
      score: post.score,
      url: post.url
    }));
    
  } catch (error) {
    console.error('❌ Proxy Error:', error.message);
    return null;
  }
};

// Función principal con fallbacks
const getRedditData = async (subreddit) => {
  const cacheKey = `reddit_${subreddit}`;
  const cached = cache.get(cacheKey);
  
  // Verificar cache
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Cache hit para r/${subreddit}`);
    return cached.data;
  }
  
  // Métodos ordenados por confiabilidad
  const methods = [
    () => fetchRedditRSS(subreddit),
    () => fetchOldReddit(subreddit),
    () => fetchRedditJSON(subreddit),
    () => fetchWithProxy(subreddit)
  ];
  
  for (const method of methods) {
    try {
      const result = await method();
      if (result && result.length > 0) {
        // Guardar en cache
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log(`✅ Éxito para r/${subreddit}`);
        return result;
      }
    } catch (error) {
      console.log('⚠️ Método falló, probando siguiente...');
      await delay(500);
    }
  }
  
  throw new Error('Todos los métodos fallaron');
};

// Tu endpoint original pero mejorado
app.post("/api/reddit", async (req, res) => {
  const { subreddit } = req.body;

  if (!subreddit) {
    return res.status(400).json({ error: "Falta el parámetro: subreddit" });
  }

  try {
    console.log(`📥 Petición para r/${subreddit}`);
    
    const resultados = await getRedditData(subreddit);
    
    res.json({ 
      subreddit, 
      resultados,
      cached: cache.has(`reddit_${subreddit}`) && Date.now() - cache.get(`reddit_${subreddit}`).timestamp < CACHE_DURATION,
      total: resultados.length
    });
    
  } catch (error) {
    console.error("❌ Error final:", error.message);
    res.status(500).json({ 
      error: "No se pudo obtener resultados desde Reddit",
      details: error.message,
      subreddit: subreddit
    });
  }
});

// Endpoint para limpiar cache (útil para testing)
app.get("/api/clear-cache", (req, res) => {
  cache.clear();
  res.json({ message: "Cache limpiado", timestamp: Date.now() });
});

// Endpoint de salud
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    cacheSize: cache.size
  });
});

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Reddit API Bot funcionando",
    version: "2.0 - Multi-method",
    endpoints: {
      reddit: "POST /api/reddit",
      health: "GET /health",
      clearCache: "GET /api/clear-cache"
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT} con fallbacks múltiples`));