import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BrainCircuit, 
  CheckCircle2, 
  Copy, 
  Loader2, 
  ShieldAlert, 
  Sparkles, 
  Wrench, 
  X,
  FileCheck2,
  DollarSign
} from 'lucide-react';

interface GeminiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentName?: string;
  equipmentTag?: string;
}

export const GeminiDiagnosticsModal: React.FC<GeminiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  componentName = 'Sellos de Bomba Rexroth A4VSO',
  equipmentTag = 'SH-4100-01'
}) => {
  const { selectedEquipment, selectedComponent, openCreateTicketWithComponent } = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunAiDiagnosis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentTag: equipmentTag || selectedEquipment.tag,
          equipmentName: selectedEquipment.name,
          componentName: componentName || selectedComponent?.name || 'Sellos de Alta Presión',
          sensorData: {
            temperature: selectedComponent?.temperatureC || 94.6,
            vibration: selectedComponent?.vibrationMmS || 9.3,
            pressure: selectedComponent?.pressureBar || 340,
            hours: selectedComponent?.currentHours || 5740
          },
          failureDescription: 'Pico anómalo de temperatura a 94.6°C con microvibraciones continuas de 9.3 mm/s y pulsaciones de presión hidráulica a 340 Bar detectadas en telemetría SCADA.',
          severity: 4
        })
      });
      const data = await res.json();
      if (data.data) {
        setDiagnosticResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!diagnosticResult) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                ANÁLISIS DE CAUSA RAÍZ & FMEA CON GEMINI AI
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30">
                  GEMINI 3.7 FLASH
                </span>
              </h2>
              <p className="text-[11px] text-[#888] font-mono">
                {equipmentTag} — {componentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#888] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[75vh] overflow-y-auto space-y-4 text-xs text-[#D1D1D1]">
          {!diagnosticResult && !loading && (
            <div className="p-6 text-center space-y-3 bg-[#050505] rounded border border-[#2A2A2A]">
              <div className="w-12 h-12 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700] mx-auto">
                <Sparkles className="w-6 h-6 fill-[#FFD700]" />
              </div>
              <div>
                <h3 className="font-bold text-white font-mono text-sm">
                  Iniciar Diagnóstico Predictivo Automatizado
                </h3>
                <p className="text-[#888] font-mono text-[11px] mt-1 max-w-md mx-auto">
                  El modelo Gemini procesará la telemetría SCADA, espectro de vibraciones y parámetros de diseño minero para calcular RPN, causa raíz tribológica y procedimiento prescriptivo.
                </p>
              </div>
              <button
                onClick={handleRunAiDiagnosis}
                className="px-4 py-2 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold font-mono text-xs shadow transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <BrainCircuit className="w-4 h-4" />
                EJECUTAR ANÁLISIS FMEA & RCA
              </button>
            </div>
          )}

          {loading && (
            <div className="p-10 text-center space-y-2.5 bg-[#050505] rounded border border-[#2A2A2A]">
              <Loader2 className="w-6 h-6 text-[#FFD700] animate-spin mx-auto" />
              <p className="text-white font-mono font-bold text-xs">PROCESANDO TELEMETRÍA CON GEMINI AI...</p>
              <p className="text-[#888] font-mono text-[10px]">Calculando modos de falla, índice RPN y costo evitado de parada.</p>
            </div>
          )}

          {diagnosticResult && (
            <div className="space-y-3">
              {/* Root Cause Card */}
              <div className="p-3 bg-[#050505] rounded border border-[#2A2A2A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    DIAGNÓSTICO DE CAUSA RAÍZ FÍSICA
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] font-mono text-[#888] hover:text-white cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIADO' : 'COPIAR JSON'}
                  </button>
                </div>
                <p className="text-[#D1D1D1] text-[11px] leading-relaxed font-mono">
                  {diagnosticResult.rootCause}
                </p>
              </div>

              {/* FMEA Matrix Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-[#050505] p-2.5 rounded border border-[#2A2A2A] text-center font-mono">
                  <div className="text-[9px] text-[#888] uppercase">SEVERIDAD (S)</div>
                  <div className="text-base font-bold text-red-400 mt-0.5">
                    {diagnosticResult.fmeaSeverity || 4} / 5
                  </div>
                </div>
                <div className="bg-[#050505] p-2.5 rounded border border-[#2A2A2A] text-center font-mono">
                  <div className="text-[9px] text-[#888] uppercase">OCURRENCIA (O)</div>
                  <div className="text-base font-bold text-[#FFD700] mt-0.5">
                    {diagnosticResult.fmeaOccurrence || 3} / 5
                  </div>
                </div>
                <div className="bg-[#050505] p-2.5 rounded border border-[#2A2A2A] text-center font-mono">
                  <div className="text-[9px] text-[#888] uppercase">DETECCIÓN (D)</div>
                  <div className="text-base font-bold text-cyan-400 mt-0.5">
                    {diagnosticResult.fmeaDetection || 2} / 5
                  </div>
                </div>
                <div className="bg-[#050505] p-2.5 rounded border border-[#2A2A2A] text-center font-mono">
                  <div className="text-[9px] text-[#888] uppercase">ÍNDICE RPN</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {diagnosticResult.rpnScore || 24}
                  </div>
                </div>
              </div>

              {/* Financial Risk Avoided */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-800 rounded flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-emerald-400 text-xs block">PÉRDIDA DE PRODUCCIÓN EVITADA</span>
                    <span className="text-[10px] text-emerald-500/80">Basado en $2.1M USD/hr parada no planificada</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  ${((diagnosticResult.productionLossPreventedUSD || 7350000) / 1000000).toFixed(2)}M USD
                </span>
              </div>

              {/* Prescriptive Steps Checklist */}
              <div className="p-3 bg-[#050505] rounded border border-[#2A2A2A] space-y-2">
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                  PROCEDIMIENTO PRESCRIPTIVO DE CAMPO
                </span>
                <div className="space-y-1.5">
                  {diagnosticResult.prescriptiveSteps?.map((step: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 bg-[#0A0A0A] p-2 rounded border border-[#2A2A2A]">
                      <span className="w-4 h-4 rounded bg-[#FFD700]/10 text-[#FFD700] font-bold font-mono flex items-center justify-center shrink-0 text-[9px] border border-[#FFD700]/30">
                        {idx + 1}
                      </span>
                      <span className="text-[#D1D1D1] font-mono text-[11px] leading-normal">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#050505] border-t border-[#2A2A2A] flex items-center justify-between font-mono">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-[#2A2A2A] text-[#888] hover:text-white hover:bg-[#1A1A1A] text-xs font-bold cursor-pointer"
          >
            CERRAR
          </button>

          {diagnosticResult && (
            <button
              onClick={() => {
                onClose();
                openCreateTicketWithComponent(selectedEquipment, selectedComponent || { name: componentName } as any);
              }}
              className="px-4 py-1.5 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 fill-black" />
              TRANSFERIR A ORDEN DE TRABAJO CMMS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
