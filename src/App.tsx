import React from 'react';
import { useApp } from './context/AppContext';
import { MiningDashboard } from './modules/Dashboard/MiningDashboard';
import { DigitalTwin3D } from './modules/DigitalTwin/DigitalTwin3D';
import { TicketBoard } from './modules/CMMS/TicketBoard';
import { EquipmentList } from './modules/Equipment/EquipmentList';
import { EquipmentDetail } from './modules/Equipment/EquipmentDetail';
import { PredictiveAnalytics } from './modules/PredictiveAI/PredictiveAnalytics';
import { ArchitectureDiagrams } from './modules/Architecture/ArchitectureDiagrams';
import { AuditLogView } from './modules/Audit/AuditLogView';
import { INITIAL_USERS } from './data/mockDatabase';
import { 
  Activity, 
  Boxes, 
  BrainCircuit, 
  Cpu, 
  FileText, 
  Layers, 
  LayoutDashboard, 
  Radio, 
  ShieldCheck, 
  Truck, 
  UserCheck, 
  Wrench, 
  Zap 
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    equipments, 
    selectedEquipment, 
    setSelectedEquipment, 
    currentUser, 
    setCurrentUser,
    isSimulatingTelemetry 
  } = useApp();

  return (
    <div className="min-h-screen bg-[#050505] text-[#D1D1D1] flex flex-col font-sans selection:bg-[#FFD700] selection:text-black">
      {/* Top Enterprise Industrial Header - High Density */}
      <header className="bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-40 px-4 lg:px-6 h-14 flex items-center justify-between shadow-2xl">
        {/* Left: Brand & Mine Tag */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center text-black font-black text-sm shadow-md">
            M
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-widest text-white">
                MINETWIN <span className="text-[#FFD700]">V2.4</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-[#1A1A1A] text-[#888] border border-[#2A2A2A]">
                ENTERPRISE
              </span>
            </div>
            <span className="text-[10px] text-[#666] font-mono tracking-tight leading-none">
              OPERATIONS COMMAND CENTER &bull; MINA TAJO ABIERTO
            </span>
          </div>
        </div>

        {/* Center: Equipment Switcher Dropdown */}
        <div className="hidden md:flex items-center gap-2 bg-[#080808] border border-[#2A2A2A] px-3 py-1.5 rounded">
          <Truck className="w-3.5 h-3.5 text-[#FFD700]" />
          <span className="text-[11px] text-[#888] font-mono">EQUIPO ACTIVO:</span>
          <select
            value={selectedEquipment.id}
            onChange={(e) => {
              const eq = equipments.find(item => item.id === e.target.value);
              if (eq) setSelectedEquipment(eq);
            }}
            className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer font-mono"
          >
            {equipments.map(eq => (
              <option key={eq.id} value={eq.id} className="bg-[#0A0A0A] text-[#D1D1D1]">
                [{eq.tag}] {eq.name} ({eq.status})
              </option>
            ))}
          </select>
        </div>

        {/* Right: User RBAC Role Switcher & Live Status */}
        <div className="flex items-center gap-4">
          {/* System Health dots */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[9px] text-[#666] font-mono font-bold tracking-tight">SYSTEM HEALTH</span>
            <div className="flex gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="SCADA Stream: OK"></div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="TimescaleDB: OK"></div>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="Gemini ML: OK"></div>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-[1px] bg-[#2A2A2A]"></div>

          <div className="hidden sm:flex items-center gap-2 bg-[#080808] px-2.5 py-1 rounded border border-[#2A2A2A] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#FFD700]" />
            <div className="flex flex-col text-right">
              <span className="font-semibold text-white text-[11px] leading-tight">{currentUser.fullName}</span>
              <span className="text-[9px] text-[#FFD700] font-mono">{currentUser.role}</span>
            </div>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = INITIAL_USERS.find(user => user.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-transparent text-[10px] text-[#888] focus:outline-none cursor-pointer ml-1 border-l border-[#2A2A2A] pl-1 font-mono"
              title="Cambiar perfil RBAC para probar permisos"
            >
              {INITIAL_USERS.map(u => (
                <option key={u.id} value={u.id} className="bg-[#0A0A0A] text-[#D1D1D1]">
                  {u.role.split(' ')[0]} ({u.fullName.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111] border border-[#2A2A2A] text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar - High Density */}
      <nav className="bg-[#080808] border-b border-[#2A2A2A] px-4 lg:px-6 overflow-x-auto scrollbar-none flex items-center gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          CENTRO DE CONTROL
        </button>

        <button
          onClick={() => setActiveTab('digital-twin')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'digital-twin'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          GEMELO DIGITAL 3D
        </button>

        <button
          onClick={() => setActiveTab('cmms')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'cmms'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          GESTIÓN CMMS
        </button>

        <button
          onClick={() => setActiveTab('equipment-list')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'equipment-list' || activeTab === 'equipment-detail'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          FLOTA & JERARQUÍA 5N
        </button>

        <button
          onClick={() => setActiveTab('predictive-ai')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'predictive-ai'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          PREDICTIVE AI & RUL
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'architecture'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          ARQUITECTURA & STACK
        </button>

        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`px-3 py-2.5 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'audit-logs'
              ? 'border-[#FFD700] text-[#FFD700] bg-[#FFD700]/5'
              : 'border-transparent text-[#888] hover:text-[#D1D1D1]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          AUDITORÍA & LOGS
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-3 lg:p-5 max-w-[1680px] w-full mx-auto">
        {activeTab === 'dashboard' && <MiningDashboard />}
        {activeTab === 'digital-twin' && <DigitalTwin3D />}
        {activeTab === 'cmms' && <TicketBoard />}
        {activeTab === 'equipment-list' && <EquipmentList />}
        {activeTab === 'equipment-detail' && <EquipmentDetail />}
        {activeTab === 'predictive-ai' && <PredictiveAnalytics />}
        {activeTab === 'architecture' && <ArchitectureDiagrams />}
        {activeTab === 'audit-logs' && <AuditLogView />}
      </main>

      {/* Industrial High Density Footer */}
      <footer className="h-8 bg-[#0A0A0A] border-t border-[#2A2A2A] px-4 flex items-center justify-between text-[10px] font-mono text-[#666]">
        <div className="flex items-center gap-6">
          <span className="text-[#888]">LAT: -23.6489 LON: -70.3944</span>
          <span className="hidden sm:inline text-[#888]">ALT: 2,400M ASL</span>
          <span className="hidden md:inline text-emerald-400">DATABASE: TIMESCALEDB CONNECTED</span>
          <span className="hidden lg:inline text-[#888]">AI ENGINE: GEMINI 3.7 FLASH</span>
        </div>
        <div className="text-[#888]">
          LAST RECALCULATION: 2026-08-24 12:00:08 UTC
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return <AppContent />;
}

export default App;
