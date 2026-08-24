export type RoleType = 
  | 'Administrador de Sistema'
  | 'Supervisor de Mina'
  | 'Ingeniero de Mantenimiento'
  | 'Operador de Equipo'
  | 'Técnico de Campo';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  specialty?: 'Hidráulica' | 'Mecánica' | 'Eléctrica' | 'Sistemas SCADA' | 'Lubricación' | 'Operaciones';
  isActive: boolean;
  avatarUrl?: string;
  currentWorkloadTickets?: number;
}

export type EquipmentType = 'Pala Hidráulica' | 'Pala Eléctrica de Cables' | 'Camión de Acarreo' | 'Cargador Frontal';

export type OperationalStatus = 'Operativo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'Standby';

export interface GpsLocation {
  lat: number;
  lng: number;
  altitudeMeters: number;
  pitBench: string; // e.g., 'Fase 4 - Banco 3400'
  zone: string;
}

export interface ComponentItem {
  id: string;
  equipmentId: string;
  parentId: string | null;
  name: string;
  type: 'Estructural' | 'Hidráulico' | 'Eléctrico' | 'Mecánico' | 'Transmisión' | 'Refrigeración';
  level: number; // 1: Sistema, 2: Subsistema, 3: Componente, 4: Sub-componente, 5: Pieza Crítica
  installationDate: string;
  expectedLifeHours: number;
  currentHours: number;
  healthScore: number; // 0 - 100
  currentRULCycles: number;
  status: 'Normal' | 'Advertencia' | 'Crítico' | 'Falla Inminente';
  temperatureC: number;
  vibrationMmS: number;
  pressureBar?: number;
  meshId?: string; // identifier in the 3D digital twin
}

export interface Equipment {
  id: string;
  tag: string; // e.g. "SH-4100-01"
  name: string;
  model: string;
  manufacturer: string;
  type: EquipmentType;
  year: number;
  totalOperatingHours: number;
  status: OperationalStatus;
  location: GpsLocation;
  availabilityRate: number; // e.g. 91.4%
  mtbfHours: number;
  mttrHours: number;
  healthScore: number; // 0 - 100
  hourlyCostUSD: number; // e.g. 2000000 USD / hr outage impact
  componentsCount: number;
  activeTicketsCount: number;
  imageUrl?: string;
  components?: ComponentItem[];
}

export interface SensorReading {
  id: string;
  sensorId: string;
  componentId: string;
  equipmentId: string;
  sensorType: 'Temperatura' | 'Vibración' | 'Presión Hidráulica' | 'RPM Motor' | 'Corriente Eléctrica' | 'Flujo Aceite';
  unit: string;
  value: number;
  minThreshold: number;
  maxThreshold: number;
  timestamp: string;
  isAnomaly: boolean;
}

export type TicketStatus = 
  | 'REPORTADO'
  | 'DIAGNÓSTICO'
  | 'PLANIFICADO'
  | 'EN_REPARACIÓN'
  | 'PRUEBAS'
  | 'CERRADO';

export type FailureSeverity = 1 | 2 | 3 | 4 | 5;

export interface TicketTimelineEntry {
  id: string;
  ticketId: string;
  statusFrom: TicketStatus;
  statusTo: TicketStatus;
  changedBy: string;
  changedAt: string;
  notes: string;
}

export interface FailureTicket {
  id: string;
  ticketCode: string; // e.g. "WO-2026-089"
  equipmentId: string;
  equipmentTag: string;
  equipmentName: string;
  componentId: string;
  componentName: string;
  failureType: 'Hidráulica' | 'Mecánica' | 'Eléctrica' | 'Estructural' | 'Neumática';
  severity: FailureSeverity; // 1 (Leve) to 5 (Catastrófica/Parada Inmediata)
  title: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  assignedToUser?: User;
  status: TicketStatus;
  priority: 'Baja' | 'Media' | 'Alta' | 'Urgente' | 'Emergencia';
  estimatedCostUSD: number;
  actualCostUSD: number;
  startedAt?: string;
  resolvedAt?: string;
  mttrHoursCalculated?: number;
  evidenceUrl?: string;
  rootCauseAnalysis?: string;
  aiSuggestedAction?: string;
  timeline: TicketTimelineEntry[];
}

export interface PredictionMetric {
  id: string;
  componentId: string;
  componentName: string;
  equipmentId: string;
  equipmentTag: string;
  modelVersion: string; // "MineRUL-RandomForest-v2.4"
  rulCycles: number;
  rulHoursRemaining: number;
  healthScore: number;
  anomalyScore: number; // 0.0 - 1.0 (Isolation Forest score)
  confidenceLow: number;
  confidenceHigh: number;
  predictedAt: string;
  recommendedAction: string;
  degradationTrend: 'Estable' | 'Degradación Moderada' | 'Degradación Acelerada';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface KpiSummary {
  mtbfOverallHours: number;
  mttrOverallHours: number;
  availabilityOverallPct: number;
  oeeOverallPct: number;
  totalFleetCostPerHourDowntimeUSD: number;
  downtimeHoursPreventedMonth: number;
  savingsGeneratedUSD: number;
  activeEquipmentCount: number;
  underMaintenanceCount: number;
  criticalAlertsCount: number;
}
