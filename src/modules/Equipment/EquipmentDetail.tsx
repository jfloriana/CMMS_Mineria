import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComponentItem, Equipment } from '../../types';
import { 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  Thermometer, 
  Activity, 
  Clock, 
  Wrench, 
  Sparkles,
  Zap,
  Gauge
} from 'lucide-react';

export const EquipmentDetail: React.FC = () => {
  const { 
    selectedEquipment, 
    updateEquipmentStatus, 
    openCreateTicketWithComponent,
    setSelectedComponent,
    selectedComponent,
    setActiveTab 
  } = useApp();

  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    'cmp-sys-01': true,
    'cmp-sub-01-1': true,
    'cmp-cmp-01-1-1': true,
    'cmp-subcmp-01-1-1-1': true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const components = selectedEquipment.components || [];

  // Group components by hierarchy level
  const rootSystems = components.filter(c => c.level === 1);

  const renderComponentTree = (item: ComponentItem) => {
    const children = components.filter(c => c.parentId === item.id);
    const isExpanded = expandedNodes[item.id] !== false;
    const isSelected = selectedComponent?.id === item.id;

    return (
      <div key={item.id} className="text-xs">
        <div 
          onClick={() => setSelectedComponent(item)}
          className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
            isSelected 
              ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700] ring-1 ring-[#FFD700]/30'
              : 'bg-[#050505] hover:bg-[#111] border-[#2A2A2A] text-[#D1D1D1]'
          }`}
          style={{ marginLeft: `${(item.level - 1) * 14}px` }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {children.length > 0 ? (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(item.id);
                }}
                className="text-[#666] hover:text-white p-0.5"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            ) : (
              <span className="w-3 inline-block" />
            )}

            <div className="flex items-center gap-1.5 truncate">
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-[#1A1A1A] border border-[#2A2A2A] text-[#888]">
                L{item.level}
              </span>
              <span className="font-semibold font-mono truncate text-[11px]">{item.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 ml-2">
            <span className="text-[10px] font-mono text-[#888]">
              {item.temperatureC}°C | {item.vibrationMmS} mm/s
            </span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
              item.status === 'Crítico'
                ? 'bg-red-950 text-red-400 border border-red-800'
                : item.status === 'Advertencia'
                ? 'bg-amber-950 text-[#FFD700] border border-amber-800'
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {item.status}
            </span>
          </div>
        </div>

        {/* Children Render */}
        {children.length > 0 && isExpanded && (
          <div className="mt-1 space-y-1">
            {children.map(child => renderComponentTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Equipment Specification Card */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm flex flex-col lg:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] font-black font-mono text-base">
            {selectedEquipment.tag.split('-')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">{selectedEquipment.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#FFD700] border border-[#2A2A2A]">
                {selectedEquipment.tag}
              </span>
            </div>
            <p className="text-[11px] text-[#888] font-mono mt-0.5">
              Fabricante: <strong className="text-white">{selectedEquipment.manufacturer}</strong> | Modelo: <strong className="text-white">{selectedEquipment.model}</strong> | Año: {selectedEquipment.year}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-[#888]">
              <span>UBICACIÓN: <strong className="text-[#FFD700]">{selectedEquipment.location.pitBench}</strong></span>
              <span>HORÓMETRO: <strong className="text-white font-mono">{selectedEquipment.totalOperatingHours.toLocaleString()} HRS</strong></span>
              <span>DISPONIBILIDAD: <strong className="text-emerald-400 font-mono">{selectedEquipment.availabilityRate}%</strong></span>
              <span>MTBF: <strong className="text-cyan-400 font-mono">{selectedEquipment.mtbfHours} HRS</strong></span>
              <span>MTTR: <strong className="text-orange-400 font-mono">{selectedEquipment.mttrHours} HRS</strong></span>
            </div>
          </div>
        </div>

        {/* Operational Status Selector */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="text-[10px] font-mono font-bold uppercase text-[#888]">ESTADO OPERATIVO EN MINA:</div>
          <select
            value={selectedEquipment.status}
            onChange={(e) => updateEquipmentStatus(selectedEquipment.id, e.target.value as any)}
            className="bg-[#050505] border border-[#2A2A2A] rounded px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FFD700]"
          >
            <option value="Operativo">Operativo (En Producción)</option>
            <option value="En Mantenimiento">En Mantenimiento (Bahía)</option>
            <option value="Standby">Standby (Reserva Operacional)</option>
            <option value="Fuera de Servicio">Fuera de Servicio (Parada)</option>
          </select>
        </div>
      </div>

      {/* 5-Level Component Hierarchy Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                DESGLOSE JERÁRQUICO DE COMPONENTES (5 NIVELES)
              </div>
              <h3 className="font-bold text-white font-mono text-xs mt-0.5">
                Árbol de Subsistemas y Piezas Críticas
              </h3>
            </div>
            <span className="text-[10px] text-[#888] font-mono">
              {components.length} COMPONENTES MONITOREADOS
            </span>
          </div>

          <div className="space-y-1.5">
            {rootSystems.map(sys => renderComponentTree(sys))}
          </div>
        </div>

        {/* Selected Component Telemetry & Action Drilldown */}
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm space-y-3">
          <div className="border-b border-[#2A2A2A] pb-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              INSPECCIÓN DE COMPONENTE
            </div>
            <h4 className="font-bold text-white font-mono text-sm mt-0.5">
              {selectedComponent ? selectedComponent.name : 'Seleccione un nodo del árbol'}
            </h4>
          </div>

          {selectedComponent ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#888]">NIVEL:</span>
                  <span className="text-white">Nivel {selectedComponent.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">DISCIPLINA:</span>
                  <span className="font-semibold text-white">{selectedComponent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">INSTALACIÓN:</span>
                  <span className="text-[#888]">{selectedComponent.installationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">HORÓMETRO:</span>
                  <span className="text-[#FFD700] font-bold">
                    {selectedComponent.currentHours} / {selectedComponent.expectedLifeHours} HRS
                  </span>
                </div>
              </div>

              {/* Real-time telemetry indicators */}
              <div className="space-y-1.5">
                <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A] flex items-center justify-between">
                  <span className="text-[#888] flex items-center gap-1.5 font-mono">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    TEMPERATURA
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {selectedComponent.temperatureC} °C
                  </span>
                </div>

                <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A] flex items-center justify-between">
                  <span className="text-[#888] flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    VIBRACIÓN TRIAXIAL
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {selectedComponent.vibrationMmS} mm/s
                  </span>
                </div>

                <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A] flex items-center justify-between">
                  <span className="text-[#888] flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    HEALTH & RUL
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    {selectedComponent.healthScore}% ({selectedComponent.currentRULCycles} ciclos)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 space-y-1.5">
                <button
                  onClick={() => openCreateTicketWithComponent(selectedEquipment, selectedComponent)}
                  className="w-full py-2 bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold font-mono rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Wrench className="w-3.5 h-3.5 fill-black" />
                  EMITIR ORDEN DE FALLA CMMS
                </button>
                <button
                  onClick={() => setActiveTab('digital-twin')}
                  className="w-full py-1.5 bg-[#050505] hover:bg-[#111] border border-[#2A2A2A] text-[#888] hover:text-white font-mono font-bold rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#FFD700]" />
                  INSPECCIONAR EN GEMELO 3D
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#666] font-mono text-xs">
              Seleccione un componente del árbol para ver su detalle de ingeniería.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
