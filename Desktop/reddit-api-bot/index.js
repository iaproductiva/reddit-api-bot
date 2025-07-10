app.post('/api/reddit', async (req, res) => {
  const { query, subreddit } = req.body;

  if (!query || !subreddit) {
    return res.status(400).json({ error: "Faltan 'query' o 'subreddit'" });
  }

  // Simulación de resultados reales
  const resultadosFake = [
    {
      titulo: `Cómo ${query} sin inversión`,
      autor: "usuario123",
      url: "https://reddit.com/fake-post1"
    },
    {
      titulo: `Estrategias reales para ${query}`,
      autor: "negociosoportunos",
      url: "https://reddit.com/fake-post2"
    }
  ];

  res.json({
    resultados: resultadosFake,
    resumen: `Se encontraron ${resultadosFake.length} resultados para "${query}" en r/${subreddit}`
  });
});
