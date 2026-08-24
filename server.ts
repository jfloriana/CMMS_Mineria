import express from "express";
import path from "path";
import dotenv from "dotenv";
import app from "./api/app.js";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

// Re-export for Vercel (also available via api/app)
export { app };
export default app;

async function startServer() {
  // Vite middleware for development (dynamic import to avoid bundling on Vercel)
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    // Solo servir estáticos con Express cuando NO estamos en Vercel
    // En Vercel, el frontend se sirve como output estático (dist) y /api va a serverless
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MineTwin AI Server running on http://0.0.0.0:${PORT}`);
  });
}

// No iniciar servidor HTTP cuando se ejecuta como Vercel Serverless Function
if (!process.env.VERCEL) {
  startServer();
}
