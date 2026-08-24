import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FailureTicket, FailureSeverity } from '../../types';
import { INITIAL_USERS } from '../../data/mockDatabase';
import { 
  AlertTriangle, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  Loader2, 
  Sparkles, 
  UserCheck, 
  Wrench, 
  X 
} from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketToView?: FailureTicket | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose, ticketToView }) => {
  const { 
    currentUser, 
    equipments, 
    selectedEquipment, 
    createTicket, 
    transitionTicket, 
    assignTechnician,
    suggestBestTechnician,
    preselectedForTicket 
  } = useApp();

  const [equipmentId, setEquipmentId] = useState<string>(
    ticketToView?.equipmentId || preselectedForTicket?.equipment?.id || selectedEquipment.id
  );
  const [componentName, setComponentName] = useState<string>(
    ticketToView?.componentName || preselectedForTicket?.component?.name || 'Sellos de Alta Presión & O-Rings Viton'
  );
  const [failureType, setFailureType] = useState<FailureTicket['failureType']>(
    ticketToView?.failureType || 'Hidráulica'
  );
  const [severity, setSeverity] = useState<FailureSeverity>(ticketToView?.severity || 4);
  const [title, setTitle] = useState<string>(ticketToView?.title || '');
  const [description, setDescription] = useState<string>(ticketToView?.description || '');
  const [priority, setPriority] = useState<FailureTicket['priority']>(ticketToView?.priority || 'Urgente');
  const [estimatedCostUSD, setEstimatedCostUSD] = useState<number>(ticketToView?.estimatedCostUSD || 18500);
  const [assignedTechId, setAssignedTechId] = useState<string>(
    ticketToView?.assignedToUser?.id || suggestBestTechnician(failureType)?.id || ''
  );
  const [transitionNotes, setTransitionNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  if (!isOpen && !ticketToView) return null;

  const currentEq = equipments.find(e => e.id === equipmentId) || selectedEquipment;
  const technicians = INITIAL_USERS.filter(u => u.role === 'Técnico de Campo' && u.isActive);

  // Auto technician recommendation
  const recommendedTech = suggestBestTechnician(failureType);

  const handleAutoFillAiDiagnosis = async () => {
    setIsAnalyzingAI(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentTag: currentEq.tag,
          equipmentName: currentEq.name,
          componentName: componentName,
          sensorData: { temperature: 94.6, vibration: 9.3, pressure: 340, hours: 5740 },
          failureDescription: description || `Pulsaciones anómalas de presión y pico térmico en ${componentName}`,
          severity: severity
        })
      });
      const data = await res.json();
      if (data.data) {
        setAiAnalysis(data.data);
        if (!title) {
          setTitle(`Falla Predictiva en ${componentName} - ${currentEq.tag}`);
        }
        if (!description) {
          setDescription(`Diagnóstico IA (${data.data.rootCause}). Pasos sugeridos:\n${data.data.prescriptiveSteps.join('\n')}`);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Por favor ingrese un título descriptivo para la orden de falla.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const assignedTech = technicians.find(t => t.id === assignedTechId) || recommendedTech;
      await createTicket({
        equipmentId: currentEq.id,
        equipmentTag: currentEq.tag,
        equipmentName: currentEq.name,
        componentName: componentName,
        failureType: failureType,
        severity: severity,
        title: title,
        description: description,
        priority: priority,
        estimatedCostUSD: estimatedCostUSD,
        assignedToUser: assignedTech
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusTransition = async (targetStatus: FailureTicket['status']) => {
    if (!ticketToView) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await transitionTicket(ticketToView.id, targetStatus, transitionNotes);
      if (!res.success) {
        setErrorMessage(res.error || 'No fue posible completar la transición');
      } else {
        setTransitionNotes('');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stages: FailureTicket['status'][] = [
    'REPORTADO',
    'DIAGNÓSTICO',
    'PLANIFICADO',
    'EN_REPARACIÓN',
    'PRUEBAS',
    'CERRADO'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#050505]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-[#FFD700]">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono">
                {ticketToView ? `ORDEN DE TRABAJO: ${ticketToView.ticketCode}` : 'NUEVO TICKET DE FALLA (CMMS)'}
              </h2>
              <p className="text-[11px] text-[#888] font-mono">
                {ticketToView ? ticketToView.equipmentName : `[${currentEq.tag}] ${currentEq.name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#888] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded text-red-200 text-xs flex items-start gap-2.5 font-mono">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Error de Validación:</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {ticketToView ? (
            /* ======================================================== */
            /* VIEW & WORKFLOW TRANSITION MODE FOR EXISTING TICKET      */
            /* ======================================================== */
            <div className="space-y-4">
              {/* Lifecycle Progress Bar */}
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#888] mb-1.5">
                  CICLO DE VIDA DE LA ORDEN DE TRABAJO
                </div>
                <div className="grid grid-cols-6 gap-1 bg-[#050505] p-1.5 rounded border border-[#2A2A2A]">
                  {stages.map((st, idx) => {
                    const currentIdx = stages.indexOf(ticketToView.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = st === ticketToView.status;
                    return (
                      <div
                        key={st}
                        className={`text-center py-1.5 px-1 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                          isCurrent
                            ? 'bg-[#FFD700] text-black shadow'
                            : isDone
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-[#111] text-[#555]'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#050505] p-3.5 rounded border border-[#2A2A2A]">
                <div>
                  <span className="text-[10px] text-[#888] font-mono">TÍTULO:</span>
                  <p className="font-semibold text-white mt-0.5">{ticketToView.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] font-mono">COMPONENTE:</span>
                  <p className="font-semibold text-[#FFD700] mt-0.5">{ticketToView.componentName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] font-mono">TIPO & SEVERIDAD:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1A1A1A] text-[#D1D1D1] font-mono border border-[#2A2A2A]">
                      {ticketToView.failureType}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      ticketToView.severity >= 4 ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-[#FFD700] border border-amber-800'
                    }`}>
                      Severidad {ticketToView.severity}/5
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#888] font-mono">TÉCNICO ASIGNADO:</span>
                  <p className="font-semibold text-[#FFD700] flex items-center gap-1 mt-0.5 font-mono">
                    <UserCheck className="w-3 h-3" />
                    {ticketToView.assignedToUser?.fullName || 'Sin Asignar (Requerido)'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] text-[#888] font-mono font-bold uppercase">DESCRIPCIÓN & SÍNTOMAS TELEMÉTRICOS:</span>
                <p className="mt-1 p-3 bg-[#050505] rounded border border-[#2A2A2A] text-[#D1D1D1] text-xs leading-relaxed font-mono">
                  {ticketToView.description}
                </p>
              </div>

              {/* Assign or Change Technician */}
              <div className="p-3 bg-[#050505] rounded border border-[#2A2A2A] flex flex-col md:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-white block font-mono">REASIGNAR TÉCNICO ESPECIALISTA</span>
                  <span className="text-[10px] text-[#888]">Sugerencia basada en carga y especialidad</span>
                </div>
                <select
                  value={ticketToView.assignedToUser?.id || ''}
                  onChange={(e) => assignTechnician(ticketToView.id, e.target.value)}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:border-[#FFD700]"
                >
                  <option value="">Seleccione Técnico...</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName} ({tech.specialty}) - Carga: {tech.currentWorkloadTickets || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Workflow Action Controls */}
              <div className="p-3.5 bg-[#050505] rounded border border-[#FFD700]/30 space-y-2.5">
                <div className="text-[10px] font-mono font-bold text-[#FFD700] uppercase tracking-wider">
                  AVANZAR ETAPA DE MANTENIMIENTO
                </div>
                
                <input
                  type="text"
                  placeholder="Bitácora de turno (ej: 'Pruebas de presión superadas a 350 Bar')..."
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-3 py-1.5 text-xs text-[#D1D1D1] focus:outline-none focus:border-[#FFD700] font-mono"
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {ticketToView.status === 'REPORTADO' && (
                    <button
                      onClick={() => handleStatusTransition('DIAGNÓSTICO')}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Aprobar e Iniciar DIAGNÓSTICO
                    </button>
                  )}
                  {ticketToView.status === 'DIAGNÓSTICO' && (
                    <button
                      onClick={() => handleStatusTransition('PLANIFICADO')}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Aprobar PLANIFICADO
                    </button>
                  )}
                  {ticketToView.status === 'PLANIFICADO' && (
                    <button
                      onClick={() => handleStatusTransition('EN_REPARACIÓN')}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Iniciar EN REPARACIÓN de Campo
                    </button>
                  )}
                  {ticketToView.status === 'EN_REPARACIÓN' && (
                    <button
                      onClick={() => handleStatusTransition('PRUEBAS')}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      Pasar a PRUEBAS Operativas
                    </button>
                  )}
                  {ticketToView.status === 'PRUEBAS' && (
                    <button
                      onClick={() => handleStatusTransition('CERRADO')}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      CERRAR Ticket & Reintegrar
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Timeline */}
              <div>
                <span className="text-[10px] font-mono font-bold text-[#888] uppercase tracking-wider block mb-2">
                  HISTORIAL DE AUDITORÍA & TRAZABILIDAD
                </span>
                <div className="space-y-2.5 pl-2 border-l border-[#2A2A2A]">
                  {ticketToView.timeline.map((entry, idx) => (
                    <div key={entry.id || idx} className="relative pl-3">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#FFD700] border-2 border-black" />
                      <div className="text-[11px] text-white font-mono font-semibold flex items-center justify-between">
                        <span>{entry.statusTo.replace('_', ' ')} por {entry.changedBy}</span>
                        <span className="text-[10px] text-[#888] font-mono">{entry.changedAt}</span>
                      </div>
                      <p className="text-[11px] text-[#888] mt-0.5 font-mono">{entry.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* NEW TICKET CREATION FORM                                 */
            /* ======================================================== */
            <form onSubmit={handleSubmitNew} className="space-y-3.5">
              {/* Equipment & Component selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Equipo Afectado</label>
                  <select
                    value={equipmentId}
                    onChange={(e) => setEquipmentId(e.target.value)}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  >
                    {equipments.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        [{eq.tag}] {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Componente / Subsistema</label>
                  <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                    placeholder="e.g. Sellos Bomba Principal A4VSO"
                    required
                  />
                </div>
              </div>

              {/* Type, Severity & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Tipo de Falla</label>
                  <select
                    value={failureType}
                    onChange={(e) => setFailureType(e.target.value as any)}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="Hidráulica">Hidráulica</option>
                    <option value="Mecánica">Mecánica</option>
                    <option value="Eléctrica">Eléctrica</option>
                    <option value="Estructural">Estructural</option>
                    <option value="Neumática">Neumática</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Severidad (1 a 5)</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value) as FailureSeverity)}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value={1}>1 - Leve (Preventivo)</option>
                    <option value={2}>2 - Menor (Monitoreo)</option>
                    <option value={3}>3 - Media (Degradación)</option>
                    <option value={4}>4 - Crítica (Inminente)</option>
                    <option value={5}>5 - Catastrófica (Detención)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Prioridad Operativa</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Emergencia">Emergencia</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-mono font-bold uppercase text-[#888]">Título de la Falla</label>
                  <button
                    type="button"
                    onClick={handleAutoFillAiDiagnosis}
                    disabled={isAnalyzingAI}
                    className="text-[10px] font-mono font-bold text-[#FFD700] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isAnalyzingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                    AUTOCOMPLETAR CON GEMINI AI
                  </button>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fuga de fluido y pulsación anómala en banco de sellos"
                  className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">
                  Descripción Técnica, Telemetría y Causa Probable
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalle síntomas observados, lecturas de temperatura, vibraciones triaxiales y horómetro..."
                  className="w-full bg-[#050505] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] focus:outline-none focus:border-[#FFD700] font-mono"
                />
              </div>

              {/* Technician Auto-Assignment */}
              <div className="p-3 bg-[#050505] rounded border border-[#2A2A2A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase text-[#888] flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ASIGNACIÓN DE TÉCNICO ESPECIALISTA
                  </label>
                  {recommendedTech && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Sugerido: {recommendedTech.fullName}
                    </span>
                  )}
                </div>
                <select
                  value={assignedTechId}
                  onChange={(e) => setAssignedTechId(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-2.5 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="">Seleccione Técnico...</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName} ({tech.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#888] mb-1">Costo Estimado de Reparación (USD)</label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2" />
                  <input
                    type="number"
                    value={estimatedCostUSD}
                    onChange={(e) => setEstimatedCostUSD(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-[#2A2A2A] rounded pl-8 pr-3 py-1.5 text-xs text-[#D1D1D1] font-mono focus:outline-none focus:border-[#FFD700]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded border border-[#2A2A2A] text-[#888] hover:text-white hover:bg-[#1A1A1A] text-xs font-mono font-bold cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-[#FFD700] hover:bg-[#ffe135] text-black font-mono font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5 fill-black" />}
                  EMITIR ORDEN CMMS
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
