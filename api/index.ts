import app from "../server";

// Vercel Serverless Function handler - delega todo a Express
// Todas las rutas /api/* llegan aquí vía vercel.json rewrite
export default app;
