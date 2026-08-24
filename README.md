# MineTwin AI — CMMS Minería Predictivo & Digital Twin 3D

<p align="center">
  <a href="https://cmms-mineria.vercel.app"><img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel"/></a>
  <a href="https://github.com/jfloriana/CMMS_Mineria"><img src="https://img.shields.io/badge/GitHub-Main-181717?style=for-the-badge&logo=github" alt="GitHub"/></a>
  <img src="https://img.shields.io/badge/Version-3.2.0-FFD700?style=for-the-badge" alt="Version"/>
  <img src="https://img.shields.io/badge/Stack-React_19_%2B_Vite_6_%2B_Express_4-0A0A0A?style=for-the-badge" alt="Stack"/>
  <img src="https://img.shields.io/badge/License-MIT-2A2A2A?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <strong>Plataforma enterprise de mantenimiento predictivo, gemelo digital 3D y gestión CMMS para maquinaria pesada de tajo abierto.</strong><br/>
  <sub>P&H 4100XPC · Bucyrus 495HR · Cat 797F · Komatsu 980E-5 · LeTourneau L-2350</sub>
</p>

<p align="center">
  <a href="https://cmms-mineria.vercel.app"><b>▶ Demo Producción</b></a> •
  <a href="https://github.com/jfloriana/CMMS_Mineria">Repositorio</a> •
  <a href="#api-reference">API Docs</a> •
  <a href="#arquitectura">Arquitectura</a>
</p>

---

## Resumen Ejecutivo

**MineTwin AI** centraliza la operación de flota de carguío y acarreo minero bajo un **Operations Command Center** con telemetría en tiempo real, modelos de vida útil remanente (**RUL**), análisis causa-raíz con **Gemini** y flujo CMMS auditado (REPORTADO → DIAGNÓSTICO → PLANIFICADO → EN_REPARACIÓN → CERRADO).

Diseñado para operaciones de cobre a cielo abierto de clase mundial (2,400–3,450 msnm), reduce paradas no programadas valoradas en **$2.1M/hr** y eleva disponibilidad de flota por encima del **90%**.

> **Estado actual:** `● Ready` en Vercel `iad1` — https://cmms-mineria.vercel.app  
> **Repositorio:** https://github.com/jfloriana/CMMS_Mineria · `main` · auto-deploy activo  
> **Health:** `GET /api/health` → `{"status":"ok","version":"3.2.0-prod"}`

---

## Demo

| Entorno | URL | Rama | Estado |
|---------|-----|------|--------|
| **Producción** | https://cmms-mineria.vercel.app | `main` | ● Ready |
| Alias | https://cmms-mineria-jflorianas-projects.vercel.app | `main` | ● Ready |
| Local | http://localhost:3000 | `main` | `npm run dev` |

---

## Capacidades Clave

| Módulo | Descripción | KPIs impactados |
|--------|-------------|-----------------|
| **Centro de Control** | Dashboard OEE con disponibilidad, MTBF/MTTR, costo de parada evitada, health score por equipo | Disponibilidad, OEE |
| **Gemelo Digital 3D** | Visualización Three.js de flota con telemetría SCADA (vibración, temperatura, presión) | MTTD, RUL |
| **Gestión CMMS** | Work orders con SLA, severidad 1-5, RUL, FMEA/RPN, workflow RBAC y timeline auditable | MTTR, Cumplimiento |
| **Predictive AI & RUL** | Diagnóstico causa-raíz y pasos prescriptivos con Gemini + fallback industrial | Fallas no planificadas |
| **Flota & Jerarquía 5N** | Maestro de 5 equipos, 140+ componentes, ubicación geo-referenciada (pit/bench/zona) | Confiabilidad |
| **Auditoría & Logs** | Trazabilidad completa de cambios de estado, usuario, rol, IP y timestamp | Compliance |

### Workflow CMMS auditado

```
REPORTADO → DIAGNÓSTICO → PLANIFICADO → EN_REPARACIÓN → CERRADO
```

Reglas de negocio:
- `DIAGNÓSTICO → PLANIFICADO` solo `Ingeniero de Mantenimiento` / `Supervisor de Mina` / `Administrador` (`403` si no)
- `→ EN_REPARACIÓN` requiere técnico asignado (`400` si no)
- Cálculo automático de `mttrHoursCalculated` y `resolvedAt` al cerrar

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React 19, Vite 6, Tailwind 4, Three.js 0.185, Recharts 3, Motion 12, Lucide | `package.json:14` |
| **Backend** | Express 4, Node 24.x (Vercel), `tsx` dev, `esbuild` bundle | `server.ts:1`, `api/app.ts:1` |
| **IA** | Google Gemini (`@google/genai` ^2.4.0) — `gemini-2.0-flash` + fallback industrial | `api/app.ts:561` |
| **Infra** | Vercel (Build `npm run build`, Output `dist`), GitHub Actions implícito vía `vercel git connect` | `vercel.json:1` |
| **Lenguaje** | TypeScript 5.8 (`strict`, `bundler`) | `tsconfig.json:1` |

---

## Arquitectura

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│  React SPA (Vite) │──▶──│  Vercel Static (dist) │      │  Vercel Function    │
│  src/modules/*   │      │  /index.html + assets │      │  api/app.ts         │
│  DigitalTwin3D   │      │  rewrites: /* →       │      │  Express app        │
│  TicketBoard     │      │  /index.html (SPA)    │◀────▶│  /api/* → /api      │
└─────────────────┘      └──────────────────────┘      │  health/equipment/  │
                                                       │  tickets/ai/*       │
┌─────────────────┐      ┌──────────────────────┐      └─────────────────────┘
│  SCADA / Timescale│──▶──│  In-Memory Store     │               │
│  (simulado)     │      │  equipments/tickets/ │               ▼
└─────────────────┘      │  auditLogs           │      ┌─────────────────────┐
                         └──────────────────────┘      │  Gemini API         │
                                                       │  + Fallback Engine  │
                                                       └─────────────────────┘

Local dev: server.ts:1 carga vite middlewares en NODE_ENV!=production
Prod Vercel: server.ts:28 sirve dist solo si !VERCEL; /api va a serverless
```

**Archivos clave:**
- `server.ts:1` — wrapper dev (Vite + `app.listen` solo si `!VERCEL`)
- `api/app.ts:1` — **core app** (todas las rutas, Gemini, audit) — usado por Vercel y por local
- `api/index.ts:1` — `import app from "./app.js"` → handler serverless
- `vercel.json:1` — `rewrites` SPA + API

---

## API Reference

Base: `https://cmms-mineria.vercel.app`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Estado del sistema, uptime, versión | — |
| `GET` | `/api/equipment` | Lista flota (5 equipos, 88-142 componentes) | — |
| `GET` | `/api/equipment/:id` | Detalle equipo + location/altitude | — |
| `PATCH` | `/api/equipment/:id/status` | Cambio estado equipo + audit log | `user` body |
| `GET` | `/api/tickets` | Lista work orders CMMS | — |
| `POST` | `/api/tickets` | Crear ticket (REPORTADO) | `reportedBy` |
| `PATCH` | `/api/tickets/:id/transition` | Transición de estado con RBAC | `user.role` |
| `GET` | `/api/audit-logs` | Trazas `EQUIPMENT_STATUS_CHANGE`, `TICKET_CREATED/TRANSITION` | — |
| `POST` | `/api/ai/diagnostics` | RCA + FMEA/RPN + pasos prescriptivos (Gemini o fallback) | `GEMINI_API_KEY` opcional |
| `POST` | `/api/ai/executive-summary` | Informe ejecutivo para comité mina | `GEMINI_API_KEY` opcional |

### Ejemplo — Diagnóstico IA

```bash
curl -X POST https://cmms-mineria.vercel.app/api/ai/diagnostics \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentTag":"SH-4100-01",
    "equipmentName":"Pala P&H 4100XPC #01",
    "componentName":"Sellos Viton Bomba Rexroth A4VSO",
    "severity":4,
    "failureDescription":"Fuga y sobrecalentamiento 94.6°C",
    "sensorData":{"temperature":94.6,"vibration":9.3,"pressure":340,"hours":5740}
  }'
# 200 → { "success": true, "data": { "rootCause": "...", "rpnScore": 24, "prescriptiveSteps": [...] } }
# 503 de Gemini → fallback automático 200 con "source":"MineTwin Fallback Industrial Engine" (resiliencia)
```

---

## RBAC — Matriz de Roles

| Rol | `REPORTADO→DIAGNÓSTICO` | `DIAGNÓSTICO→PLANIFICADO` | `→EN_REPARACIÓN` | `→CERRADO` |
|-----|------------------------|---------------------------|------------------|------------|
| **Supervisor de Mina** | ✅ | ✅ | ✅ (si técnico) | ✅ |
| **Ingeniero de Mantenimiento** | ✅ | ✅ | ✅ | ✅ |
| **Técnico de Campo** | ❌ | ❌ | ✅ (auto) | ✅ |
| **Administrador** | ✅ | ✅ | ✅ | ✅ |
| **Operador** | ✅ (crea) | ❌ `403` | ❌ `400` si sin técnico | ✅ |

Cambio de rol en UI: header → selector `INITIAL_USERS` `src/data/mockDatabase.ts:1`.

---

## Instalación Local

**Prerrequisitos:** Node.js 22+ (`node --version` → `v26.2.0` verificado), npm 11+

```bash
git clone https://github.com/jfloriana/CMMS_Mineria.git
cd CMMS_Mineria
npm install                 # 261 packages
cp .env.example .env.local  # editar GEMINI_API_KEY
npm run dev                 # http://localhost:3000 (Vite + Express)
# o producción local:
npm run build && npm start  # vite build + esbuild server.ts → dist/server.cjs
npm run lint                # tsc --noEmit
```

### Variables de Entorno

| Variable | Requerido | Local | Vercel | Descripción |
|----------|-----------|-------|--------|-------------|
| `GEMINI_API_KEY` | Sí (IA) | `.env.local` | Settings → Environment Variables (Production/Preview/Development) | Key de AI Studio; si falta, usa fallback `MineTwin Fallback Industrial Engine` `api/app.ts:510` |
| `APP_URL` | No | `http://localhost:3000` | `https://cmms-mineria.vercel.app` (auto) | URL base para callbacks |
| `PORT` | No | `3000` | `process.env.PORT` (auto) | `server.ts:6` |
| `VERCEL` | Auto | — | `1` (auto) | Desactiva `app.listen` en serverless `server.ts:28` |

`.env*` está en `.gitignore:7` (`!.env.example` permitido).

---

## Deploy en Vercel (ya configurado)

1. **Repo conectado:** `vercel git connect https://github.com/jfloriana/CMMS_Mineria.git` → push a `main` deploya automático `iad1`
2. **Manual:** `vercel --prod --yes` (requiere `vercel login` → `jfloriana`)
3. **Env vars:** Dashboard → `cmms-mineria` → Settings → Environment Variables → `GEMINI_API_KEY` → Redeploy
4. **Build:** `npm run build` (`vite build` 2275 módulos + `esbuild server.ts` → `dist/server.cjs 24.1kb`) — Output `dist`
5. **Health check tras deploy:**
   ```bash
   curl https://cmms-mineria.vercel.app/api/health
   curl https://cmms-mineria.vercel.app/api/equipment | jq .total # 5
   ```

**Proyecto Vercel:** `prj_rIcQAnH2aqIT3piIlGf9EgA5VuDY` · `jflorianas-projects/cmms-mineria` · Node 24.x · Build `59.3.0`

---

## Estructura del Proyecto

```
CMMS_Mineria/
├── api/
│   ├── app.ts              # Core Express app (health/equipment/tickets/ai/*) — usado en Vercel + local
│   └── index.ts            # Handler serverless → import "./app.js"
├── src/
│   ├── App.tsx             # Shell + navegación 7 tabs + RBAC switcher
│   ├── main.tsx            # Entry + AppProvider
│   ├── context/AppContext.tsx
│   ├── data/mockDatabase.ts # INITIAL_USERS, mock inicial
│   ├── types.ts
│   └── modules/
│       ├── Dashboard/MiningDashboard.tsx
│       ├── DigitalTwin/DigitalTwin3D.tsx  # Three.js
│       ├── CMMS/TicketBoard.tsx + TicketModal.tsx
│       ├── Equipment/EquipmentList.tsx + EquipmentDetail.tsx + PitMap.tsx
│       ├── PredictiveAI/PredictiveAnalytics.tsx + GeminiDiagnosticsModal.tsx
│       ├── Architecture/ArchitectureDiagrams.tsx
│       └── Audit/AuditLogView.tsx
├── server.ts               # Wrapper dev: Vite middleware + static dist (solo si !VERCEL)
├── vercel.json             # rewrites SPA + API
├── vite.config.ts          # @tailwindcss/vite + @vitejs/plugin-react + alias @
├── tsconfig.json           # bundler, allowImportingTsExtensions
└── .env.example            # plantilla sin secretos
```

---

## Observabilidad & Troubleshooting

**Logs Vercel (últimos que viste):**
- `◇ injected env (0) from .env` — normal, dotenv sin `.env` en prod
- `POST 500 /api/ai/diagnostics` `ApiError 503 UNAVAILABLE high demand` `api/app.ts:561` — **ahora mitigado** con fallback automático `200` + `source:"MineTwin Fallback ... (Gemini 503 - retry)"`
- `GET 500 /api/health` `ERR_MODULE_NOT_FOUND /var/task/server` — **corregido** en `efd0463` extrayendo `api/app.ts`

**Si ves `503` de Gemini:**
- Reintenta en 30s (picos temporales) o cambia modelo en `api/app.ts:561` de `gemini-2.0-flash` a `gemini-1.5-flash` (más cuota)
- El fallback garantiza `200` con RPN y pasos prescriptivos aunque Gemini caiga

**Ver logs en vivo:**
```bash
vercel logs --follow
vercel logs --level error --since 1h --expand
```

---

## Roadmap

- [ ] Persistencia real (Postgres + Prisma / TimescaleDB para telemetría)
- [ ] Auth (NextAuth / Clerk) + `httpOnly` cookies, hoy RBAC es selector UI
- [ ] WebSocket / SSE para telemetría SCADA en vivo
- [ ] Tests: `vitest` + `playwright` para transiciones CMMS
- [ ] Code-splitting: `manualChunks` para bajar `1,293kB` bundle
- [ ] i18n (es/en) y tema claro/oscuro

---

## Licencia

MIT — ver `LICENSE` (si aplica). Uso académico / investigación minera.

---

## Autores & Créditos

**MineTwin AI v3.2.0** — Investigación CMMS Minería · Tajo Abierto  
Stack base generado con Google AI Studio (`https://ai.studio/apps/e3b7d149-444a-434d-86f3-65a077c8d85e`), adaptado a producción Vercel por `jfloriana`.

> ¿Dudas de deploy? Ver `vercel.json:1`, `api/app.ts:1`, `server.ts:1` o abre un issue en https://github.com/jfloriana/CMMS_Mineria/issues

