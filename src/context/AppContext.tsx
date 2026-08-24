import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Equipment, 
  ComponentItem, 
  User, 
  FailureTicket, 
  PredictionMetric, 
  AuditLog, 
  KpiSummary,
  RoleType,
  TicketStatus
} from '../types';
import { 
  INITIAL_EQUIPMENT, 
  INITIAL_USERS, 
  INITIAL_TICKETS, 
  INITIAL_PREDICTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_KPI_SUMMARY 
} from '../data/mockDatabase';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: RoleType) => void;
  equipments: Equipment[];
  selectedEquipment: Equipment;
  setSelectedEquipment: (eq: Equipment) => void;
  selectedComponent: ComponentItem | null;
  setSelectedComponent: (cmp: ComponentItem | null) => void;
  tickets: FailureTicket[];
  predictions: PredictionMetric[];
  auditLogs: AuditLog[];
  kpis: KpiSummary;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  createTicket: (ticketData: Partial<FailureTicket>) => Promise<FailureTicket>;
  transitionTicket: (ticketId: string, targetStatus: TicketStatus, notes?: string) => Promise<{ success: boolean; error?: string }>;
  assignTechnician: (ticketId: string, technicianId: string) => void;
  suggestBestTechnician: (failureType: string) => User | undefined;
  updateEquipmentStatus: (equipmentId: string, status: Equipment['status']) => void;
  isSimulatingTelemetry: boolean;
  setIsSimulatingTelemetry: (val: boolean) => void;
  liveTick: number;
  openCreateTicketWithComponent: (eq: Equipment, cmp: ComponentItem) => void;
  ticketModalOpen: boolean;
  setTicketModalOpen: (val: boolean) => void;
  preselectedForTicket: { equipment?: Equipment; component?: ComponentItem } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[2]); // Default: Dra. Valentina Flores (Ingeniero de Mantenimiento)
  const [equipments, setEquipments] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>(INITIAL_EQUIPMENT[0]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentItem | null>(
    INITIAL_EQUIPMENT[0].components?.[3] || null // Start with Sellos de Bomba
  );
  const [tickets, setTickets] = useState<FailureTicket[]>(INITIAL_TICKETS);
  const [predictions, setPredictions] = useState<PredictionMetric[]>(INITIAL_PREDICTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [kpis, setKpis] = useState<KpiSummary>(INITIAL_KPI_SUMMARY);
  const [activeTab, setActiveTab] = useState<string>('digital-twin');
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState<boolean>(true);
  const [liveTick, setLiveTick] = useState<number>(0);
  const [ticketModalOpen, setTicketModalOpen] = useState<boolean>(false);
  const [preselectedForTicket, setPreselectedForTicket] = useState<{ equipment?: Equipment; component?: ComponentItem } | null>(null);

  const switchRole = (role: RoleType) => {
    const userMatch = INITIAL_USERS.find(u => u.role === role) || {
      id: `usr-custom-${Date.now()}`,
      email: `${role.toLowerCase().replace(/\s+/g, '.')}@oreguard.corp`,
      fullName: `Usuario (${role})`,
      role: role,
      isActive: true,
    };
    setCurrentUser(userMatch);

    // Audit log
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: userMatch.id,
      userName: userMatch.fullName,
      userRole: userMatch.role,
      action: 'USER_ROLE_SWITCH',
      resource: 'auth_session',
      resourceId: userMatch.id,
      details: { switchedTo: role },
      ipAddress: '192.168.10.12',
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Telemetry real-time live pulse (5s loop as specified in acceptance criteria)
  useEffect(() => {
    if (!isSimulatingTelemetry) return;

    const interval = setInterval(() => {
      setLiveTick(prev => prev + 1);

      setEquipments(prevEquips => {
        return prevEquips.map(eq => {
          if (!eq.components) return eq;

          const updatedComponents = eq.components.map(cmp => {
            // Small realistic fluctuations
            const tempDelta = (Math.random() - 0.48) * 0.8;
            const vibDelta = (Math.random() - 0.48) * 0.15;
            const newTemp = Math.max(35, Math.min(120, +(cmp.temperatureC + tempDelta).toFixed(1)));
            const newVib = Math.max(1.0, Math.min(15, +(cmp.vibrationMmS + vibDelta).toFixed(1)));
            
            // Degradation if temperature or vibration is critically high
            let status = cmp.status;
            let health = cmp.healthScore;
            let rul = cmp.currentRULCycles;

            if (newTemp > 93 || newVib > 9.0) {
              status = 'Crítico';
              health = Math.max(20, health - 0.05);
              rul = Math.max(10, Math.floor(rul - 0.05));
            } else if (newTemp > 75 || newVib > 5.5) {
              status = 'Advertencia';
            } else {
              status = 'Normal';
            }

            return {
              ...cmp,
              temperatureC: newTemp,
              vibrationMmS: newVib,
              healthScore: Math.round(health),
              currentRULCycles: Math.round(rul),
              status
            };
          });

          return {
            ...eq,
            components: updatedComponents
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingTelemetry]);

  // Keep selected equipment / component in sync with updated list
  useEffect(() => {
    const fresh = equipments.find(e => e.id === selectedEquipment.id);
    if (fresh) {
      setSelectedEquipment(fresh);
      if (selectedComponent && fresh.components) {
        const freshCmp = fresh.components.find(c => c.id === selectedComponent.id);
        if (freshCmp) {
          setSelectedComponent(freshCmp);
        }
      }
    }
  }, [equipments]);

  // Suggest best technician by specialty and lowest workload
  const suggestBestTechnician = (failureType: string): User | undefined => {
    const technicians = INITIAL_USERS.filter(u => u.role === 'Técnico de Campo' && u.isActive);
    
    // Map failureType to technician specialty
    let targetSpecialty = 'Mecánica';
    if (failureType === 'Hidráulica') targetSpecialty = 'Hidráulica';
    if (failureType === 'Eléctrica') targetSpecialty = 'Eléctrica';
    if (failureType === 'Neumática') targetSpecialty = 'Hidráulica';

    // Filter by specialty
    const matching = technicians.filter(t => t.specialty === targetSpecialty);
    const pool = matching.length > 0 ? matching : technicians;

    // Sort by lowest current tickets workload
    pool.sort((a, b) => (a.currentWorkloadTickets || 0) - (b.currentWorkloadTickets || 0));
    return pool[0];
  };

  const createTicket = async (ticketData: Partial<FailureTicket>): Promise<FailureTicket> => {
    const bestTech = ticketData.assignedToUser || suggestBestTechnician(ticketData.failureType || 'Mecánica');
    const newTicket: FailureTicket = {
      id: `tkt-${Date.now()}`,
      ticketCode: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: ticketData.equipmentId || selectedEquipment.id,
      equipmentTag: ticketData.equipmentTag || selectedEquipment.tag,
      equipmentName: ticketData.equipmentName || selectedEquipment.name,
      componentId: ticketData.componentId || 'cmp-gen',
      componentName: ticketData.componentName || 'Componente General',
      failureType: ticketData.failureType || 'Mecánica',
      severity: ticketData.severity || 3,
      title: ticketData.title || 'Reporte de Falla Mecánica / Hidráulica',
      description: ticketData.description || '',
      reportedBy: currentUser.fullName,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assignedToUser: bestTech,
      status: 'REPORTADO',
      priority: ticketData.priority || (ticketData.severity && ticketData.severity >= 4 ? 'Urgente' : 'Media'),
      estimatedCostUSD: ticketData.estimatedCostUSD || 15000,
      actualCostUSD: 0,
      evidenceUrl: ticketData.evidenceUrl,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          ticketId: `tkt-${Date.now()}`,
          statusFrom: 'REPORTADO',
          statusTo: 'REPORTADO',
          changedBy: currentUser.fullName,
          changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          notes: 'Registro inicial del ticket en sistema CMMS MineTwin.'
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);

    // Audit log
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'TICKET_CREATED',
      resource: 'maintenance_tickets',
      resourceId: newTicket.id,
      details: { code: newTicket.ticketCode, title: newTicket.title, severity: newTicket.severity },
      ipAddress: '192.168.10.12',
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    return newTicket;
  };

  const transitionTicket = async (
    ticketId: string, 
    targetStatus: TicketStatus, 
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return { success: false, error: 'Ticket no encontrado' };

    // Acceptance criteria validations:
    // 1. Cannot skip stages
    const stages: TicketStatus[] = ['REPORTADO', 'DIAGNÓSTICO', 'PLANIFICADO', 'EN_REPARACIÓN', 'PRUEBAS', 'CERRADO'];
    const currentIndex = stages.indexOf(ticket.status);
    const targetIndex = stages.indexOf(targetStatus);

    if (targetIndex > currentIndex + 1) {
      return { 
        success: false, 
        error: `Transición inválida: No se pueden saltar estados del flujo de trabajo (actual: ${ticket.status}, solicitado: ${targetStatus}). Debe seguir el ciclo formal.` 
      };
    }

    // 2. Solo Ingeniero de Mantenimiento o Supervisor puede mover de DIAGNÓSTICO a PLANIFICADO
    if (ticket.status === 'DIAGNÓSTICO' && targetStatus === 'PLANIFICADO') {
      const allowedRoles: RoleType[] = ['Ingeniero de Mantenimiento', 'Supervisor de Mina', 'Administrador de Sistema'];
      if (!allowedRoles.includes(currentUser.role)) {
        return {
          success: false,
          error: `Restricción RBAC: Solo el Ingeniero de Mantenimiento o Supervisor tiene autorización técnica para aprobar y PLANIFICAR esta orden de trabajo.`
        };
      }
    }

    // 3. Un ticket sin técnico asignado no puede pasar a EN_REPARACIÓN
    if (targetStatus === 'EN_REPARACIÓN' && !ticket.assignedToUser) {
      return {
        success: false,
        error: 'Validación de Seguridad: No se puede iniciar la reparación sin un Técnico Especialista asignado formalmente.'
      };
    }

    const prevStatus = ticket.status;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const updatedTimeline = [
      ...ticket.timeline,
      {
        id: `tl-${Date.now()}`,
        ticketId: ticket.id,
        statusFrom: prevStatus,
        statusTo: targetStatus,
        changedBy: currentUser.fullName,
        changedAt: nowStr,
        notes: notes || `Cambio de estado aprobado hacia ${targetStatus}`
      }
    ];

    const updatedTickets = tickets.map(t => {
      if (t.id !== ticketId) return t;
      const updated: FailureTicket = {
        ...t,
        status: targetStatus,
        timeline: updatedTimeline,
        startedAt: targetStatus === 'EN_REPARACIÓN' && !t.startedAt ? nowStr : t.startedAt,
        resolvedAt: targetStatus === 'CERRADO' ? nowStr : t.resolvedAt,
        mttrHoursCalculated: targetStatus === 'CERRADO' ? 4.2 : t.mttrHoursCalculated,
        actualCostUSD: targetStatus === 'CERRADO' ? (t.actualCostUSD || t.estimatedCostUSD * 0.92) : t.actualCostUSD
      };
      return updated;
    });

    setTickets(updatedTickets);

    // Audit log
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'TICKET_STATUS_TRANSITION',
      resource: 'maintenance_tickets',
      resourceId: ticket.id,
      details: { from: prevStatus, to: targetStatus, ticketCode: ticket.ticketCode },
      ipAddress: '192.168.10.12',
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);

    return { success: true };
  };

  const assignTechnician = (ticketId: string, technicianId: string) => {
    const tech = INITIAL_USERS.find(u => u.id === technicianId);
    if (!tech) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          assignedToUser: tech,
          timeline: [
            ...t.timeline,
            {
              id: `tl-${Date.now()}`,
              ticketId: t.id,
              statusFrom: t.status,
              statusTo: t.status,
              changedBy: currentUser.fullName,
              changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              notes: `Técnico asignado: ${tech.fullName} (${tech.specialty || 'General'})`
            }
          ]
        };
      }
      return t;
    }));
  };

  const updateEquipmentStatus = (equipmentId: string, status: Equipment['status']) => {
    setEquipments(prev => prev.map(e => {
      if (e.id === equipmentId) {
        return { ...e, status };
      }
      return e;
    }));

    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'EQUIPMENT_STATUS_UPDATE',
      resource: 'equipment',
      resourceId: equipmentId,
      details: { newStatus: status },
      ipAddress: '192.168.10.12',
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const openCreateTicketWithComponent = (eq: Equipment, cmp: ComponentItem) => {
    setPreselectedForTicket({ equipment: eq, component: cmp });
    setTicketModalOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        equipments,
        selectedEquipment,
        setSelectedEquipment,
        selectedComponent,
        setSelectedComponent,
        tickets,
        predictions,
        auditLogs,
        kpis,
        activeTab,
        setActiveTab,
        createTicket,
        transitionTicket,
        assignTechnician,
        suggestBestTechnician,
        updateEquipmentStatus,
        isSimulatingTelemetry,
        setIsSimulatingTelemetry,
        liveTick,
        openCreateTicketWithComponent,
        ticketModalOpen,
        setTicketModalOpen,
        preselectedForTicket
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
