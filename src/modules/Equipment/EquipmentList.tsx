import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { PitMap } from './PitMap';
import { 
  Filter, 
  Search, 
  Truck, 
  Wrench, 
  Zap, 
  Clock, 
  MapPin, 
  Activity, 
  ChevronRight, 
  DollarSign 
} from 'lucide-react';

export const EquipmentList: React.FC = () => {
  const { equipments, setSelectedEquipment, setActiveTab } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewSubTab, setViewSubTab] = useState<'cards' | 'map'>('cards');

  const filtered = equipments.filter(eq => {
    if (filterType !== 'all' && eq.type !== filterType) return false;
    if (filterStatus !== 'all' && eq.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!eq.tag.toLowerCase().includes(q) && !eq.name.toLowerCase().includes(q) && !eq.model.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleSelectEquipment = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setActiveTab('equipment-detail');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            GESTIÓN DE ACTIVOS & FLOTA DE CARGUÍO MINERO
          </div>
          <h1 className="text-base font-bold text-white font-mono mt-0.5">
            Catálogo & Monitoreo de Equipos Críticos
          </h1>
          <p className="text-[11px] text-[#888] font-mono mt-0.5">
            Palas eléctricas P&H 4100XPC, Bucyrus 495HR, Camiones Cat 797F, Komatsu 980E y Cargadores L-2350.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#050505] p-1 rounded border border-[#2A2A2A]">
          <button
            onClick={() => setViewSubTab('cards')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
              viewSubTab === 'cards' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            CUADRÍCULA FLOTA
          </button>
          <button
            onClick={() => setViewSubTab('map')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              viewSubTab === 'map' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            MAPA TAJO ABIERTO
          </button>
        </div>
      </div>

      {viewSubTab === 'map' ? (
        <PitMap />
      ) : (
        <>
          {/* Filters Bar */}
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#666] absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Buscar tag o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-8 pr-2.5 py-1 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1 text-xs text-[#D1D1D1] font-mono"
              >
                <option value="all">TODOS LOS TIPOS</option>
                <option value="Pala Eléctrica de Cables">Palas Eléctricas</option>
                <option value="Camión de Acarreo">Camiones Ultra-Clase</option>
                <option value="Cargador Frontal">Cargadores Frontales</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1 text-xs text-[#D1D1D1] font-mono"
              >
                <option value="all">TODOS LOS ESTADOS</option>
                <option value="Operativo">Operativo</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Standby">Standby</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>

            <div className="text-[#888] font-mono text-xs">
              TOTAL: <strong className="text-[#FFD700]">{filtered.length}</strong> EQUIPOS
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map(eq => (
              <div
                key={eq.id}
                onClick={() => handleSelectEquipment(eq)}
                className="bg-[#0A0A0A] hover:border-[#FFD700] border border-[#2A2A2A] rounded overflow-hidden shadow transition-all cursor-pointer group flex flex-col"
              >
                {/* Equipment Image & Tag Overlay */}
                <div className="relative h-36 bg-[#050505] overflow-hidden">
                  <img
                    src={eq.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80'}
                    alt={eq.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/60" />
                  
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-black/90 text-[#FFD700] border border-[#FFD700]/50 backdrop-blur-sm">
                      {eq.tag}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm border ${
                      eq.status === 'Operativo'
                        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                        : eq.status === 'En Mantenimiento'
                        ? 'bg-orange-950/90 text-orange-400 border-orange-800'
                        : 'bg-black/90 text-[#888] border-[#2A2A2A]'
                    }`}>
                      {eq.status}
                    </span>
                  </div>

                  <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-[#D1D1D1]">
                    <span className="font-semibold text-white font-mono drop-shadow">{eq.model}</span>
                    <span className="text-[10px] font-mono text-[#FFD700] drop-shadow">{eq.location.pitBench}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-[#FFD700] transition-colors font-mono">
                      {eq.name}
                    </h3>
                    <p className="text-[11px] text-[#888] mt-0.5 font-mono">
                      Fabricante: {eq.manufacturer} | Año: {eq.year}
                    </p>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-1.5 bg-[#050505] p-2 rounded border border-[#2A2A2A] text-center text-xs">
                    <div>
                      <div className="text-[9px] text-[#666] font-mono uppercase">DISP.</div>
                      <div className="font-bold text-emerald-400 font-mono mt-0.5 text-xs">{eq.availabilityRate}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#666] font-mono uppercase">MTBF</div>
                      <div className="font-bold text-cyan-400 font-mono mt-0.5 text-xs">{eq.mtbfHours}h</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#666] font-mono uppercase">SALUD</div>
                      <div className="font-bold text-[#FFD700] font-mono mt-0.5 text-xs">{eq.healthScore}%</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-[#888]">
                    <span className="flex items-center gap-1 font-mono text-[10px] text-[#666]">
                      <Clock className="w-3 h-3" />
                      {eq.totalOperatingHours.toLocaleString()} HRS
                    </span>
                    <span className="text-[#FFD700] font-mono text-xs font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      FICHA TÉCNICA <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
