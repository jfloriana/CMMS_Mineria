import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { MapPin, Navigation, Radio, ShieldAlert, Zap, Layers } from 'lucide-react';

export const PitMap: React.FC = () => {
  const { equipments, selectedEquipment, setSelectedEquipment, setActiveTab } = useApp();
  const [selectedEqId, setSelectedEqId] = useState<string>(selectedEquipment.id);

  // Map coordinates representation for Open-Pit benches
  // Coordinates mapped to visual percentages on the mine pit SVG
  const getCoordinatesPercent = (eq: Equipment) => {
    // Mapping lat: -22.3150 to -22.3250, lng: -68.8920 to -68.9100
    const latMin = -22.3260;
    const latMax = -22.3140;
    const lngMin = -68.9120;
    const lngMax = -68.8920;

    const top = ((latMax - eq.location.lat) / (latMax - latMin)) * 80 + 10;
    const left = ((eq.location.lng - lngMin) / (lngMax - lngMin)) * 80 + 10;
    return { top: `${Math.min(90, Math.max(10, top))}%`, left: `${Math.min(90, Math.max(10, left))}%` };
  };

  const currentFocus = equipments.find(e => e.id === selectedEqId) || selectedEquipment;

  return (
    <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded p-4 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-[#2A2A2A] pb-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            GEOLOCALIZACIÓN & TOPOGRAFÍA MINA (POSTGIS SPATIAL INDEX)
          </div>
          <h3 className="text-sm font-bold text-white font-mono mt-0.5">
            Mapa de Tajo Abierto y Flota en Bancos de Producción
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            GPS RTK ACTIVO (±5CM)
          </span>
        </div>
      </div>

      {/* Interactive Mine Pit SVG Map */}
      <div className="relative w-full h-[400px] bg-[#050505] rounded overflow-hidden border border-[#2A2A2A] select-none">
        {/* Pit Contour Rings / Topographic Benches (Bancos de Mina) */}
        <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 800 500">
          <ellipse cx="400" cy="250" rx="380" ry="220" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="6,4" />
          <ellipse cx="400" cy="250" rx="310" ry="175" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          <ellipse cx="390" cy="250" rx="240" ry="135" fill="none" stroke="#FFD700" strokeWidth="1.5" />
          <ellipse cx="380" cy="250" rx="170" ry="95" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="370" cy="250" rx="100" ry="55" fill="none" stroke="#b45309" strokeWidth="2" />
          
          {/* Main Haulage Roads (Rampas Principales) */}
          <path d="M 50 100 Q 300 200 750 420" fill="none" stroke="#444" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
          <path d="M 120 450 Q 400 350 700 80" fill="none" stroke="#444" strokeWidth="6" strokeLinecap="round" opacity="0.4" />

          {/* Bench Labels */}
          <text x="70" y="70" fill="#888" fontSize="11" fontFamily="monospace">Banco 3480m (Cresta Norte)</text>
          <text x="320" y="245" fill="#FFD700" fontSize="12" fontWeight="bold" fontFamily="monospace">Fondo Tajo 3280m</text>
          <text x="610" y="470" fill="#888" fontSize="11" fontFamily="monospace">Rampa Chancador Primario</text>
        </svg>

        {/* Equipment GPS Markers */}
        {equipments.map(eq => {
          const pos = getCoordinatesPercent(eq);
          const isSelected = eq.id === selectedEqId;
          return (
            <div
              key={eq.id}
              onClick={() => {
                setSelectedEqId(eq.id);
                setSelectedEquipment(eq);
              }}
              style={{ top: pos.top, left: pos.left }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-300 group`}
            >
              {/* Pulsing halo if critical */}
              {eq.status === 'Operativo' && (
                <div className="absolute -inset-1.5 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
              )}
              {eq.status === 'En Mantenimiento' && (
                <div className="absolute -inset-1.5 bg-orange-500/20 rounded-full animate-pulse pointer-events-none" />
              )}

              {/* Pin Badge */}
              <div className={`px-2 py-0.5 rounded border shadow-lg flex items-center gap-1 text-[11px] font-bold font-mono transition-transform group-hover:scale-110 ${
                isSelected 
                  ? 'bg-[#FFD700] text-black border-white ring-2 ring-[#FFD700]/50'
                  : eq.status === 'Operativo'
                  ? 'bg-[#0A0A0A]/95 text-emerald-400 border-emerald-800'
                  : eq.status === 'En Mantenimiento'
                  ? 'bg-[#0A0A0A]/95 text-orange-400 border-orange-800'
                  : 'bg-[#0A0A0A]/95 text-[#888] border-[#2A2A2A]'
              }`}>
                <MapPin className="w-3 h-3" />
                <span>{eq.tag}</span>
              </div>

              {/* Tooltip on Hover */}
              <div className="hidden group-hover:block absolute left-1/2 -top-14 transform -translate-x-1/2 bg-[#0A0A0A] border border-[#2A2A2A] px-2.5 py-1 rounded shadow-2xl text-[10px] text-white whitespace-nowrap z-30 pointer-events-none font-mono">
                <div className="font-bold text-[#FFD700]">{eq.name}</div>
                <div className="text-[#888]">{eq.location.pitBench} ({eq.location.altitudeMeters}m snm)</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Equipment Card on Map */}
      <div className="p-3 bg-[#050505] rounded border border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] font-bold text-xs font-mono">
            {currentFocus.tag.split('-')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-xs font-mono">{currentFocus.name}</h4>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                currentFocus.status === 'Operativo' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-orange-950 text-orange-400 border border-orange-800'
              }`}>
                {currentFocus.status}
              </span>
            </div>
            <p className="text-[11px] text-[#888] font-mono mt-0.5">
              Ubicación: <strong className="text-white">{currentFocus.location.pitBench}</strong> | Coordenadas: [{currentFocus.location.lat.toFixed(4)}, {currentFocus.location.lng.toFixed(4)}]
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedEquipment(currentFocus);
            setActiveTab('digital-twin');
          }}
          className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold font-mono text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          VER GEMELO DIGITAL 3D
        </button>
      </div>
    </div>
  );
};
