# Supabase — Preparación (cuando me pases la BD)

Este folder se rellena cuando me pases `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `DATABASE_URL`.

## Qué haré cuando me pases las credenciales

1. `supabase/schema.sql` — DDL con PostGIS + TimescaleDB:
   - `equipments` (id, tag, name, model, status, location GEOGRAPHY, availability, healthScore...)
   - `tickets` (id, ticketCode, equipmentId FK, status enum TicketStatus, severity, timeline JSONB, RLS)
   - `audit_logs` (id, userId, action, resource, details JSONB, ip, createdAt)
   - `users` (id, email, role, specialty, workload)
2. `prisma/schema.prisma` (si prefieres Prisma) o `supabase/migrations/`
3. `api/repository.ts` → activar `createSupabaseRepository()` (hoy es `InMemory`, mañana Supabase sin cambiar endpoints)
4. `vercel env add SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + redeploy

## Qué necesito de ti

- En Supabase Dashboard → Project Settings → Database → Connection string (URI)
- En Supabase Dashboard → Project Settings → API → `service_role` key (no `anon`)
- ¿Quieres RLS activo? (recomendado) → te creo policies por `role`

Por ahora `api/app.ts` sigue con `let currentEquipments` en memoria (funcional) pero `api/repository.ts` ya define la interfaz para el switch sin downtime.

Cuando me pases la URL, lo migro en un solo commit sin romper `GET /api/*`.
