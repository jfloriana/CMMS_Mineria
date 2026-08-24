import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Flame, 
  Layers, 
  Play, 
  Pause, 
  ShieldAlert, 
  Sparkles, 
  Truck, 
  Wrench, 
  Zap 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export const MiningDashboard: React.FC = () => {
  const { 
    equipments, 
    tickets, 
    kpis, 
    setSelectedEquipment, 
    setActiveTab, 
    openCreateTicketWithComponent,
    isSimulatingTelemetry,
    setIsSimulatingTelemetry
  } = useApp();

  // Equipment availability dataset for chart
  const availabilityData = equipments.map(eq => ({
    tag: eq.tag,
    name: eq.name,
    availability: eq.availabilityRate,
    health: eq.healthScore,
    status: eq.status
  }));

  // Critical alerts from active tickets with severity >= 4
  const criticalTickets = tickets.filter(t => t.severity >= 4 && t.status !== 'CERRADO');

  return (
    <div className="space-y-4">
      {/* Top Bar: Operations Shift & Real-time Live Stream Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700]">
            <Activity className="w-3.5 h-3.5" />
            CENTRO DE CONTROL &bull; OPERACIONES MINA TAJO ABIERTO
          </div>
          <h1 className="text-lg font-bold text-white mt-0.5">
            MineTwin AI &bull; Monitor Predictivo de Flota de Carguío
          </h1>
          <p className="text-[11px] text-[#888] font-mono mt-0.5">
            TURNO A (DÍA) | MINA CHUQUICAMATA &bull; TAJO ABIERTO | PROD: 185,000 TON/DÍA
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSimulatingTelemetry(!isSimulatingTelemetry)}
            className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isSimulatingTelemetry 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400' 
                : 'bg-[#111] border-[#2A2A2A] text-[#888]'
            }`}
          >
            {isSimulatingTelemetry ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Pause className="w-3 h-3" />
                SCADA TELEMETRY (4S STREAM)
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#FFD700]" />
                REANUDAR SCADA
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('digital-twin')}
            className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold text-[11px] font-mono rounded shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            GEMELO 3D
          </button>
        </div>
      </div>

      {/* Critical Alert Callout Banner if High Severity */}
      {criticalTickets.length > 0 && (
        <div className="bg-[#0A0A0A] border border-red-600/80 border-l-4 border-l-red-500 rounded p-3 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-red-950/80 border border-red-600/50 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
                  {criticalTickets.length} ALERTA(S) CRÍTICA(S) DE FALLA INMINENTE
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-950 text-red-300 font-bold border border-red-800">
                  DOWNTIME RISK ~$2.1M/HR
                </span>
              </div>
              <p className="text-xs text-[#D1D1D1] mt-0.5">
                [{criticalTickets[0].equipmentTag}] {criticalTickets[0].equipmentName}: {criticalTickets[0].title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const targetEq = equipments.find(e => e.id === criticalTickets[0].equipmentId);
                if (targetEq) setSelectedEquipment(targetEq);
                setActiveTab('digital-twin');
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-[10px] rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              INSPECCIONAR 3D <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setActiveTab('cmms')}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#222] text-[#D1D1D1] font-mono text-[10px] rounded transition-colors border border-[#2A2A2A] cursor-pointer"
            >
              VER EN CMMS
            </button>
          </div>
        </div>
      )}

      {/* 4 Executive KPI Metric Cards - High Density HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Availability */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] uppercase">
            <span>DISPONIBILIDAD GLOBAL</span>
            <div className="p-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-white">
              {kpis.fleetAvailabilityRate}%
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-[#888]">
              <span>META MINERA: 85.0%</span>
              <span className="text-emerald-400 font-semibold">+3.4% MES</span>
            </div>
          </div>
        </div>

        {/* KPI 2: MTBF */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] uppercase">
            <span>MTBF (TIEMPO ENTRE FALLAS)</span>
            <div className="p-1 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-white">
              {kpis.fleetMTBFHours} <span className="text-xs text-[#888] font-normal">HRS</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-[#888]">
              <span>CONFIABILIDAD</span>
              <span className="text-cyan-400 font-semibold">ALTO RENDIMIENTO</span>
            </div>
          </div>
        </div>

        {/* KPI 3: MTTR */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] uppercase">
            <span>MTTR (TIEMPO REPARACIÓN)</span>
            <div className="p-1 rounded bg-orange-950/80 text-orange-400 border border-orange-800/40">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-white">
              {kpis.fleetMTTRHours} <span className="text-xs text-[#888] font-normal">HRS</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-[#888]">
              <span>META: &lt;5.0 HRS</span>
              <span className="text-orange-400 font-semibold">-0.8 HRS (MEJORA)</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Financial Savings Avoided */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3.5 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#888] uppercase">
            <span>DOWNTIME EVITADO (YTD)</span>
            <div className="p-1 rounded bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-3xl font-bold font-mono text-[#FFD700]">
              ${(kpis.failurePreventionSavingsUSD / 1000000).toFixed(1)}M <span className="text-xs text-[#888] font-normal">USD</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono mt-1 text-[#888]">
              <span>7 PARADAS EVITADAS</span>
              <span className="text-emerald-400 font-semibold">ROI 420%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Overview & Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Availability by Equipment Bar Chart */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5">
            <div>
              <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wide">
                DISPONIBILIDAD FÍSICA POR EQUIPO DE CARGUÍO & ACARREO
              </h3>
              <p className="text-[10px] text-[#888] font-mono mt-0.5">
                UMBRAL CONTRACTUAL OPERACIÓN MINERA: 85.0%
              </p>
            </div>
            <span className="text-[10px] text-[#FFD700] font-mono font-bold">
              {equipments.length} EQUIPOS EN LÍNEA
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={availabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="tag" stroke="#666666" fontSize={10} font-family="monospace" />
                <YAxis domain={[50, 100]} stroke="#666666" fontSize={10} font-family="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#2a2a2a', borderRadius: '4px', fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="availability" radius={[2, 2, 0, 0]}>
                  {availabilityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.availability >= 88 ? '#10b981' : entry.availability >= 80 ? '#ffd700' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Fleet Status List */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5">
              <h3 className="font-bold text-white text-xs font-mono uppercase">ESTADO DE ACTIVOS</h3>
              <button
                onClick={() => setActiveTab('equipment-list')}
                className="text-[10px] text-[#FFD700] hover:underline font-mono font-bold"
              >
                VER TODOS &rarr;
              </button>
            </div>

            <div className="mt-2.5 space-y-1.5">
              {equipments.slice(0, 4).map(eq => (
                <div
                  key={eq.id}
                  onClick={() => {
                    setSelectedEquipment(eq);
                    setActiveTab('digital-twin');
                  }}
                  className="p-2.5 bg-[#080808] hover:bg-[#151515] border border-[#1A1A1A] hover:border-[#2A2A2A] rounded transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#FFD700]">
                        [{eq.tag}]
                      </span>
                      <span className="text-xs text-white font-medium">{eq.name}</span>
                    </div>
                    <span className="text-[10px] text-[#666] font-mono">{eq.location.pitBench}</span>
                  </div>

                  <div className="text-right">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                      eq.status === 'Operativo' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-amber-950/80 text-[#FFD700] border border-amber-800'
                    }`}>
                      {eq.status}
                    </span>
                    <div className="text-[10px] font-mono text-[#888] mt-0.5">
                      {eq.healthScore}% SALUD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('predictive-ai')}
            className="w-full py-2 rounded bg-[#111] hover:bg-[#1a1a1a] border border-[#2A2A2A] hover:border-[#FFD700]/50 text-[#FFD700] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-[#FFD700]" />
            EXPLORAR MODELOS PREDICTIVOS
          </button>
        </div>
      </div>
    </div>
  );
};
