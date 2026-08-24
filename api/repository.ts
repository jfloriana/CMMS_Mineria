/**
 * Repository abstraction — listo para Supabase.
 * Hoy api/app.ts usa let currentEquipments/currentTickets/auditLogs en memoria (volátil, ver api/app.ts:66).
 * Este archivo define la interfaz para migrar a Postgres sin romper código:
 *   1. Implementación InMemory (actual) → ya funciona
 *   2. Implementación Supabase (cuando me pases DATABASE_URL) → solo cambiar import
 *
 * Uso futuro en api/app.ts:
 *   import { createRepository } from "./repository.js";
 *   const repo = createRepository(); // auto-detecta SUPABASE_URL o usa InMemory
 *   const equipments = await repo.listEquipments({limit, offset});
 *
 * No se importa aún para no romper build. Cuando me pases Supabase, lo cableo.
 */

import type { Equipment, FailureTicket, AuditLog } from "../src/types.js";

export interface Pagination {
  limit: number;
  offset: number;
}

export interface Repository {
  // Equipments
  listEquipments(p: Pagination): Promise<{ data: Equipment[]; total: number }>;
  getEquipment(id: string): Promise<Equipment | null>;
  updateEquipmentStatus(id: string, status: Equipment["status"]): Promise<Equipment | null>;
  // Tickets
  listTickets(filter: Partial<Pick<FailureTicket, "status" | "equipmentId" | "severity">> & Pagination): Promise<{ data: FailureTicket[]; total: number }>;
  createTicket(data: FailureTicket): Promise<FailureTicket>;
  getTicket(id: string): Promise<FailureTicket | null>;
  updateTicket(ticket: FailureTicket): Promise<FailureTicket>;
  // Audit
  listAuditLogs(filter: Partial<Pick<AuditLog, "action" | "resource" | "userId">> & Pagination): Promise<{ data: AuditLog[]; total: number }>;
  createAuditLog(log: AuditLog): Promise<AuditLog>;
}

// --- InMemory implementation (actual, funcional) ---
export function createInMemoryRepository(state: {
  equipments: Equipment[];
  tickets: FailureTicket[];
  auditLogs: AuditLog[];
}): Repository {
  return {
    async listEquipments({ limit, offset }) {
      const total = state.equipments.length;
      const data = state.equipments.slice(offset, offset + limit);
      return { data, total };
    },
    async getEquipment(id) {
      return state.equipments.find(e => e.id === id) || null;
    },
    async updateEquipmentStatus(id, status) {
      const eq = state.equipments.find(e => e.id === id);
      if (!eq) return null;
      eq.status = status;
      return eq;
    },
    async listTickets(filter) {
      let filtered = [...state.tickets];
      if (filter.status) filtered = filtered.filter(t => t.status === filter.status);
      if (filter.equipmentId) filtered = filtered.filter(t => t.equipmentId === filter.equipmentId);
      if (filter.severity) filtered = filtered.filter(t => t.severity === filter.severity);
      const total = filtered.length;
      const data = filtered.slice(filter.offset, filter.offset + filter.limit);
      return { data, total };
    },
    async createTicket(data) {
      state.tickets.unshift(data);
      if (state.tickets.length > 500) state.tickets.length = 500;
      return data;
    },
    async getTicket(id) {
      return state.tickets.find(t => t.id === id) || null;
    },
    async updateTicket(ticket) {
      const idx = state.tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) state.tickets[idx] = ticket;
      return ticket;
    },
    async listAuditLogs(filter) {
      let filtered = [...state.auditLogs];
      if (filter.action) filtered = filtered.filter(l => l.action === filter.action);
      if (filter.resource) filtered = filtered.filter(l => l.resource === filter.resource);
      if (filter.userId) filtered = filtered.filter(l => l.userId === filter.userId);
      const total = filtered.length;
      const data = filtered.slice(filter.offset, filter.offset + filter.limit);
      return { data, total };
    },
    async createAuditLog(log) {
      state.auditLogs.unshift(log);
      if (state.auditLogs.length > 200) state.auditLogs.length = 200;
      return log;
    },
  };
}

// --- Supabase implementation (placeholder, se activa cuando exista SUPABASE_URL) ---
// Para producción: npm i @supabase/supabase-js
// export function createSupabaseRepository(): Repository { ... }
// export function createRepository(): Repository {
//   if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
//     return createSupabaseRepository();
//   }
//   return createInMemoryRepository({ equipments: currentEquipments, tickets: currentTickets, auditLogs });
// }
