import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FailureTicket, TicketStatus } from '../../types';
import { TicketModal } from './TicketModal';
import { 
  AlertOctagon, 
  CheckCircle, 
  Clock, 
  Filter, 
  Kanban, 
  List, 
  Plus, 
  Search, 
  User, 
  Wrench, 
  ShieldAlert,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export const TicketBoard: React.FC = () => {
  const { 
    tickets, 
    equipments, 
    ticketModalOpen, 
    setTicketModalOpen,
    preselectedForTicket 
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTicket, setSelectedTicket] = useState<FailureTicket | null>(null);
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const columns: { id: TicketStatus; label: string; color: string }[] = [
    { id: 'REPORTADO', label: '1. REPORTADO', color: 'border-[#2A2A2A] bg-[#0A0A0A] text-[#D1D1D1]' },
    { id: 'DIAGNÓSTICO', label: '2. DIAGNÓSTICO', color: 'border-amber-500/40 bg-amber-950/20 text-[#FFD700]' },
    { id: 'PLANIFICADO', label: '3. PLANIFICADO', color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' },
    { id: 'EN_REPARACIÓN', label: '4. EN REPARACIÓN', color: 'border-orange-500/40 bg-orange-950/20 text-orange-300' },
    { id: 'PRUEBAS', label: '5. PRUEBAS', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300' },
    { id: 'CERRADO', label: '6. CERRADO', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
  ];

  const filteredTickets = tickets.filter(t => {
    if (filterEquipment !== 'all' && t.equipmentId !== filterEquipment) return false;
    if (filterSeverity !== 'all' && t.severity.toString() !== filterSeverity) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchCode = t.ticketCode.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchEq = t.equipmentName.toLowerCase().includes(q);
      const matchCmp = t.componentName.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchEq && !matchCmp) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Metric Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[#FFD700] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            CMMS &bull; GESTIÓN DE MANTENIMIENTO & FALLAS
          </div>
          <h1 className="text-lg font-bold text-white mt-0.5">
            Órdenes de Trabajo y Mantenimiento Predictivo
          </h1>
          <p className="text-[11px] text-[#888] font-mono mt-0.5">
            Flujo de estados riguroso, trazabilidad por auditoría y asignación de técnicos especialistas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#050505] p-1 rounded border border-[#2A2A2A]">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              TABLERO
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              LISTA
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTicket(null);
              setTicketModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-mono font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            NUEVA ORDEN DE FALLA
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por código, equipo, componente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-8 pr-3 py-1.5 text-xs text-[#D1D1D1] focus:outline-none focus:border-[#FFD700] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#888]" />
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
              className="bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:border-[#FFD700]"
            >
              <option value="all">Todos los Equipos</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>[{eq.tag}] {eq.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:border-[#FFD700]"
            >
              <option value="all">Todas las Severidades</option>
              <option value="5">Severidad 5 (Catastrófica)</option>
              <option value="4">Severidad 4 (Crítica)</option>
              <option value="3">Severidad 3 (Media)</option>
              <option value="2">Severidad 2 (Menor)</option>
              <option value="1">Severidad 1 (Leve)</option>
            </select>
          </div>
        </div>

        <div className="text-[#888] font-mono text-[11px]">
          MOSTRANDO <strong className="text-[#FFD700]">{filteredTickets.length}</strong> ÓRDENES
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 min-h-[550px]">
          {columns.map(col => {
            const colTickets = filteredTickets.filter(t => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-2.5 flex flex-col gap-2.5"
              >
                <div className={`p-2 rounded border text-[10px] font-mono font-bold flex items-center justify-between ${col.color}`}>
                  <span>{col.label}</span>
                  <span className="w-4 h-4 rounded bg-[#050505] flex items-center justify-center text-[9px] font-mono border border-[#2A2A2A]">
                    {colTickets.length}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
                  {colTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketModalOpen(true);
                      }}
                      className="bg-[#080808] hover:border-[#FFD700]/60 border border-[#1A1A1A] p-3 rounded transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#888] mb-1">
                        <span className="font-bold text-[#FFD700] group-hover:underline">
                          {ticket.ticketCode}
                        </span>
                        <span className={`px-1 py-0.2 rounded font-bold ${
                          ticket.severity >= 4 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-[#FFD700] border border-amber-800'
                        }`}>
                          SEV {ticket.severity}
                        </span>
                      </div>

                      <h4 className="font-semibold text-white text-xs line-clamp-2 leading-snug">
                        {ticket.title}
                      </h4>

                      <div className="mt-1.5 text-[10px] font-mono">
                        <div className="text-[#FFD700] font-medium truncate">[{ticket.equipmentTag}]</div>
                        <div className="truncate text-[#888]">{ticket.componentName}</div>
                      </div>

                      {ticket.assignedToUser && (
                        <div className="mt-2.5 pt-2 border-t border-[#1A1A1A] flex items-center justify-between text-[10px] text-[#888] font-mono">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{ticket.assignedToUser.fullName.split(' ')[0]}</span>
                          </div>
                          <span className="font-mono text-[#FFD700]">${(ticket.estimatedCostUSD / 1000).toFixed(0)}k</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {colTickets.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-[#2A2A2A] rounded p-4 text-center text-[#666] text-[11px] font-mono">
                      SIN ÓRDENES
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050505] text-[#888] border-b border-[#2A2A2A] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="p-3">CÓDIGO</th>
                  <th className="p-3">EQUIPO</th>
                  <th className="p-3">COMPONENTE</th>
                  <th className="p-3">TÍTULO / FALLA</th>
                  <th className="p-3">SEVERIDAD</th>
                  <th className="p-3">ESTADO</th>
                  <th className="p-3">TÉCNICO</th>
                  <th className="p-3">COSTO ESTIMADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#D1D1D1]">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setTicketModalOpen(true);
                    }}
                    className="hover:bg-[#151515] transition-colors cursor-pointer"
                  >
                    <td className="p-3 font-mono font-bold text-[#FFD700]">{ticket.ticketCode}</td>
                    <td className="p-3 font-mono text-white">[{ticket.equipmentTag}]</td>
                    <td className="p-3 text-[#888] font-mono text-[11px]">{ticket.componentName}</td>
                    <td className="p-3 font-medium text-white max-w-xs truncate">{ticket.title}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ticket.severity >= 4 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-[#FFD700] border border-amber-800'
                      }`}>
                        {ticket.severity} / 5
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1A1A1A] text-[#D1D1D1] border border-[#2A2A2A]">
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-400 font-mono text-[11px]">
                      {ticket.assignedToUser?.fullName || <span className="text-[#666]">Sin Asignar</span>}
                    </td>
                    <td className="p-3 font-mono text-[#FFD700]">
                      ${ticket.estimatedCostUSD.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Action Modal */}
      <TicketModal
        isOpen={ticketModalOpen}
        onClose={() => {
          setTicketModalOpen(false);
          setSelectedTicket(null);
        }}
        ticketToView={selectedTicket}
      />
    </div>
  );
};
