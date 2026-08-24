import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { 
  BrainCircuit, 
  Activity, 
  Thermometer, 
  Gauge, 
  ShieldAlert, 
  Sparkles, 
  TrendingDown, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  Clock 
} from 'lucide-react';
import { GeminiDiagnosticsModal } from './GeminiDiagnosticsModal';

export const PredictiveAnalytics: React.FC = () => {
  const { selectedEquipment, selectedComponent, liveTelemetryHistory, isSimulatingTelemetry } = useApp();
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [selectedModelType, setSelectedModelType] = useState<'isolation_forest' | 'random_forest_rul'>('isolation_forest');

  // Synthetic RUL degradation curve dataset (NASA Turbofan FD001 Adapted)
  const rulForecastData = [
    { cycle: 0, actualHealth: 100, predictedRUL: 120, confLow: 110, confHigh: 130 },
    { cycle: 20, actualHealth: 94, predictedRUL: 100, confLow: 90, confHigh: 110 },
    { cycle: 40, actualHealth: 88, predictedRUL: 80, confLow: 72, confHigh: 88 },
    { cycle: 60, actualHealth: 79, predictedRUL: 60, confLow: 52, confHigh: 68 },
    { cycle: 80, actualHealth: 66, predictedRUL: 40, confLow: 32, confHigh: 48 },
    { cycle: 95, actualHealth: 48, predictedRUL: 25, confLow: 18, confHigh: 32 },
    { cycle: 110, actualHealth: 32, predictedRUL: 10, confLow: 4, confHigh: 16 },
    { cycle: 120, actualHealth: 15, predictedRUL: 0, confLow: 0, confHigh: 4 },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5" />
            MACHINE LEARNING INDUSTRIAL & NASA TURBOFAN ENGINE
          </div>
          <h1 className="text-base font-bold text-white font-mono mt-0.5">
            Motor Predictivo de Anomalías y Vida Útil Remanente (RUL)
          </h1>
          <p className="text-[11px] text-[#888] font-mono mt-0.5">
            Modelos de ensamble (Isolation Forest + XGBoost/Random Forest Regressor) con telemetría SCADA continua.
          </p>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold font-mono text-xs rounded shadow transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          DIAGNÓSTICO FMEA GEMINI AI
        </button>
      </div>

      {/* Model Selection Tabs */}
      <div className="flex bg-[#0A0A0A] border border-[#2A2A2A] p-1 rounded w-fit text-xs font-mono">
        <button
          onClick={() => setSelectedModelType('isolation_forest')}
          className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            selectedModelType === 'isolation_forest' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
          }`}
        >
          <Activity className="w-3 h-3" />
          ISOLATION FOREST (TELEMETRÍA EN VIVO)
        </button>
        <button
          onClick={() => setSelectedModelType('random_forest_rul')}
          className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            selectedModelType === 'random_forest_rul' ? 'bg-[#FFD700] text-black' : 'text-[#888] hover:text-white'
          }`}
        >
          <TrendingDown className="w-3 h-3" />
          CURVA RUL NASA (FD001)
        </button>
      </div>

      {/* Main Visualizer Area */}
      {selectedModelType === 'isolation_forest' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Timeseries Multi-sensor Chart */}
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5">
              <div>
                <h3 className="font-bold text-white font-mono text-xs">
                  ESPECTRO MULTIVARIABLE — {selectedEquipment.tag}
                </h3>
                <span className="text-[10px] text-[#888] font-mono">
                  Monitoreo simultáneo: Temperatura (°C), Vibración (mm/s), Presión (Bar)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-[10px]">STREAM 4.0s</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveTelemetryHistory} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#222" />
                  <XAxis dataKey="timestamp" stroke="#666" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#666" fontSize={10} domain={[0, 'auto']} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#2A2A2A', borderRadius: '4px', fontSize: '11px', color: '#D1D1D1', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px', fontFamily: 'monospace' }} />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    name="Temperatura (°C)" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vibration" 
                    name="Vibración RMS (mm/s)" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    name="Presión (Bar)" 
                    stroke="#FFD700" 
                    strokeWidth={1.5} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A] text-[11px] text-[#888] font-mono flex items-center justify-between">
              <span>Umbral Anomaly Score: <strong className="text-[#FFD700]">0.78 / 1.00 (Alerta)</strong></span>
              <span>Algoritmo: <strong className="text-white">Isolation Forest (150 Estimators)</strong></span>
            </div>
          </div>

          {/* Mathematical Health Score Formula Breakdown */}
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm space-y-3">
            <div className="border-b border-[#2A2A2A] pb-2.5">
              <h3 className="font-bold text-white font-mono text-xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#FFD700]" />
                DESGLOSE DE SALUD COMPUESTA
              </h3>
              <p className="text-[10px] text-[#888] font-mono mt-0.5">
                Ponderación matemática de degradación
              </p>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A]">
                <div className="flex justify-between mb-1">
                  <span className="text-[#888]">1. Anomalías Recientes (40%):</span>
                  <span className="font-mono text-red-400 font-bold">28 / 40 pts</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[70%]" />
                </div>
              </div>

              <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A]">
                <div className="flex justify-between mb-1">
                  <span className="text-[#888]">2. RUL Remanente (30%):</span>
                  <span className="font-mono text-cyan-400 font-bold">14 / 30 pts</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[46%]" />
                </div>
              </div>

              <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A]">
                <div className="flex justify-between mb-1">
                  <span className="text-[#888]">3. Horómetro vs Vida (20%):</span>
                  <span className="font-mono text-[#FFD700] font-bold">15 / 20 pts</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#FFD700] h-full w-[75%]" />
                </div>
              </div>

              <div className="p-2.5 bg-[#050505] rounded border border-[#2A2A2A]">
                <div className="flex justify-between mb-1">
                  <span className="text-[#888]">4. Historial Fallas (10%):</span>
                  <span className="font-mono text-emerald-400 font-bold">8 / 10 pts</span>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[80%]" />
                </div>
              </div>

              <div className="p-2.5 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded flex items-center justify-between">
                <span className="font-bold text-[#FFD700]">HEALTH SCORE TOTAL:</span>
                <span className="text-sm font-mono font-bold text-white">
                  {selectedEquipment.healthScore} / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RUL Curve & Confidence Percentile Bands (NASA Turbofan) */
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 rounded shadow-sm space-y-3">
          <div className="border-b border-[#2A2A2A] pb-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-white font-mono text-xs">
                CURVA DE VIDA ÚTIL REMANENTE (RUL) — NASA TURBOFAN FD001
              </h3>
              <p className="text-[10px] text-[#888] font-mono mt-0.5">
                Estimación de ciclos operativos con bandas de incertidumbre p05 (peor caso) y p95 (mejor caso).
              </p>
            </div>
            <div className="text-[11px] font-mono text-[#FFD700] bg-[#FFD700]/10 px-2.5 py-1 rounded border border-[#FFD700]/30">
              RUL ESTIMADO: 48 CICLOS
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rulForecastData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#222" />
                <XAxis dataKey="cycle" stroke="#666" fontFamily="monospace" fontSize={10} label={{ value: 'Ciclos Operativos', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#888' }} />
                <YAxis stroke="#666" fontFamily="monospace" fontSize={10} label={{ value: 'Salud / RUL', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#2A2A2A', borderRadius: '4px', fontSize: '11px', color: '#D1D1D1', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px', fontFamily: 'monospace' }} />
                
                {/* Confidence Area */}
                <Area 
                  type="monotone" 
                  dataKey="confHigh" 
                  name="Percentil 95 (Mejor Caso)" 
                  stroke="#38bdf8" 
                  fill="#0284c7" 
                  fillOpacity={0.12} 
                />
                <Area 
                  type="monotone" 
                  dataKey="confLow" 
                  name="Percentil 05 (Peor Caso)" 
                  stroke="#f97316" 
                  fill="#c2410c" 
                  fillOpacity={0.18} 
                />
                <Line 
                  type="monotone" 
                  dataKey="actualHealth" 
                  name="Salud Física (%)" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="bg-[#050505] p-3 rounded border border-[#2A2A2A]">
              <span className="text-[#888] block font-mono text-[10px] uppercase">Ventana de Reemplazo:</span>
              <span className="text-white font-mono text-[11px] font-bold mt-1 block">Próximas 18 a 32 hrs de operación.</span>
            </div>
            <div className="bg-[#050505] p-3 rounded border border-[#2A2A2A]">
              <span className="text-[#888] block font-mono text-[10px] uppercase">Repuesto en Pañol:</span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold mt-1 block">Kit Sellos #980-HYD (4 uds disponibles).</span>
            </div>
            <div className="bg-[#050505] p-3 rounded border border-[#2A2A2A]">
              <span className="text-[#888] block font-mono text-[10px] uppercase">Impacto Operacional:</span>
              <span className="text-[#FFD700] font-mono text-[11px] font-bold mt-1 block">Coordinar con relevo turno 19:00 hrs.</span>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Diagnostics Modal */}
      <GeminiDiagnosticsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        equipmentTag={selectedEquipment.tag}
        componentName={selectedComponent?.name || 'Sellos de Bomba Rexroth A4VSO'}
      />
    </div>
  );
};
