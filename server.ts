import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import https from "https";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to proxy the fetch request
  app.post("/api/fetch-url", (req, res) => {
    const { url } = req.body;
    
    if (!url || !url.startsWith("http")) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };

    https.get(url, options, (getRes) => {
      let data = '';
      getRes.on('data', (chunk) => {
        data += chunk;
      });
      getRes.on('end', () => {
        if (getRes.statusCode && (getRes.statusCode < 200 || getRes.statusCode >= 400)) {
            return res.status(getRes.statusCode || 500).json({ error: `Failed to fetch: ${getRes.statusCode}`, content: data });
        }
        res.json({ contents: data });
      });
    }).on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Determine the directory in an ES module environment
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
