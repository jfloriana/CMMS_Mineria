# MineTwin AI — CMMS Minería | Digital Twin & Predictive Maintenance

Enterprise predictive maintenance, 3D Digital Twin, RUL ML models y CMMS de flota pesada para tajo abierto (P&H 4100XPC, Cat 797F, Komatsu 980E).

> Stack: React 19 + Vite 6 + Express 4 + Gemini 3.7 Flash + Three.js + Recharts + Tailwind 4

**Repo:** https://github.com/jfloriana/CMMS_Mineria

## Run Locally

**Prerrequisitos:** Node.js 22+

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear `.env.local` a partir de `.env.example` y poner tu key:
   ```bash
   cp .env.example .env.local
   # editar GEMINI_API_KEY="tu_key_real"
   ```
3. Correr en dev (Vite + Express):
   ```bash
   npm run dev
   # abre http://localhost:3000
   ```
4. Build producción:
   ```bash
   npm run build && npm start
   ```

## Deploy en Vercel

1. Importar repo en https://vercel.com/new
2. Framework: `Vite` — Build Command: `npm run build` — Output: `dist`
3. Variables de entorno (Settings > Environment Variables):
   - `GEMINI_API_KEY` = tu key de AI Studio (obligatoria para IA diagnóstica)
   - `APP_URL` = URL de Vercel (ej: https://cmms-mineria.vercel.app)
4. Redeploy. Endpoints: `/api/health`, `/api/equipment`, `/api/tickets`, `/api/ai/diagnostics`

Ver `vercel.json` y `api/index.ts` para el adaptador serverless (Express → Vercel Function). En local el servidor Express sirve Vite; en Vercel el frontend es estático y `/api` va a la función.

## Estructura

- `server.ts` — API Express (equipments, tickets CMMS, audit-logs, Gemini diagnostics)
- `api/index.ts` — Wrapper serverless para Vercel
- `src/modules/` — Dashboard, DigitalTwin3D, CMMS TicketBoard, PredictiveAnalytics
- `vercel.json` — rewrites SPA + API
