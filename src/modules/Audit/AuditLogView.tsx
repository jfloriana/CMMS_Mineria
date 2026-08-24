import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Search, Filter, Clock, User, FileText, CheckCircle2 } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.entityType.toLowerCase().includes(q) ||
        log.userFullName.toLowerCase().includes(q) ||
        log.userRole.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            TRAZABILIDAD & CUMPLIMIENTO MINERO (ISO 55001 / OSHA)
          </div>
          <h1 className="text-base font-bold text-white font-mono mt-0.5">
            Registro de Auditoría Inmutable de Operaciones
          </h1>
          <p className="text-[11px] text-[#888] font-mono mt-0.5">
            Registro secuencial de cambios de estado en equipos, aprobaciones de órdenes de falla y diagnósticos de campo.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/20 px-3 py-1.5 rounded border border-emerald-800 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>FIRMA SHA-256 VERIFICADA</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar en bitácora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#050505] border border-[#2A2A2A] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFD700]"
          >
            <option value="all">TODAS LAS ACCIONES</option>
            <option value="TICKET_TRANSITION">TRANSICIÓN DE TICKET</option>
            <option value="TICKET_CREATED">CREACIÓN DE TICKET</option>
            <option value="TECHNICIAN_ASSIGNED">ASIGNACIÓN DE TÉCNICO</option>
            <option value="EQUIPMENT_STATUS_CHANGE">CAMBIO ESTADO DE EQUIPO</option>
            <option value="AI_DIAGNOSTIC_RUN">DIAGNÓSTICO GEMINI IA</option>
          </select>
        </div>

        <div className="text-[#888] font-mono text-[11px]">
          <strong className="text-[#FFD700]">{filteredLogs.length}</strong> EVENTOS REGISTRADOS
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#050505] text-[#888] border-b border-[#2A2A2A] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">USUARIO & ROL</th>
                <th className="p-3">ACCIÓN</th>
                <th className="p-3">ENTIDAD</th>
                <th className="p-3">ESTADO ANTERIOR</th>
                <th className="p-3">NUEVO ESTADO</th>
                <th className="p-3">DETALLES / NOTAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] text-[#D1D1D1]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#111] transition-colors">
                  <td className="p-3 font-mono text-[#888] text-[10px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-white text-xs">{log.userFullName}</div>
                    <div className="text-[9px] text-[#FFD700] font-mono">{log.userRole}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#1A1A1A] text-[#D1D1D1] border border-[#2A2A2A]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {log.entityType}
                  </td>
                  <td className="p-3 text-[#888] font-mono text-[10px]">
                    {log.previousState ? JSON.stringify(log.previousState) : '—'}
                  </td>
                  <td className="p-3 text-emerald-400 font-mono font-semibold text-[10px]">
                    {log.newState ? JSON.stringify(log.newState) : '—'}
                  </td>
                  <td className="p-3 text-[#888] max-w-xs truncate text-[10px]">
                    {log.details || 'Operación registrada en sistema'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
