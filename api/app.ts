import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export const app = express();
export default app;

app.use(express.json());

// In-Memory Database Store
let currentEquipments = [
  {
    id: 'eq-ph4100-01',
    tag: 'SH-4100-01',
    name: 'Pala Eléctrica P&H 4100XPC #01',
    model: 'P&H 4100XPC AC Drive',
    manufacturer: 'Komatsu Mining Corp / Joy Global',
    type: 'Pala Eléctrica de Cables',
    year: 2022,
    totalOperatingHours: 15600,
    status: 'Operativo',
    location: {
      lat: -22.3195,
      lng: -68.9012,
      altitudeMeters: 3380,
      pitBench: 'Fase 5 - Banco Norte 3380',
      zone: 'Sector Tajo Sur-Este'
    },
    availabilityRate: 89.2,
    mtbfHours: 184,
    mttrHours: 4.8,
    healthScore: 71,
    hourlyCostUSD: 2100000,
    componentsCount: 142,
    activeTicketsCount: 2,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-bucyrus495-02',
    tag: 'SH-495-02',
    name: 'Pala Eléctrica Bucyrus 495HR #02',
    model: 'Bucyrus 495HR High Reach',
    manufacturer: 'Caterpillar Inc.',
    type: 'Pala Eléctrica de Cables',
    year: 2021,
    totalOperatingHours: 22400,
    status: 'Operativo',
    location: {
      lat: -22.3218,
      lng: -68.8985,
      altitudeMeters: 3340,
      pitBench: 'Fase 4 - Banco 3340',
      zone: 'Frente de Carguío Principal'
    },
    availabilityRate: 93.8,
    mtbfHours: 240,
    mttrHours: 3.9,
    healthScore: 86,
    hourlyCostUSD: 1950000,
    componentsCount: 138,
    activeTicketsCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-cat797f-104',
    tag: 'HT-797-104',
    name: 'Camión de Acarreo Ultra-Clase Cat 797F #104',
    model: '797F Mechanical Drive (400t)',
    manufacturer: 'Caterpillar Inc.',
    type: 'Camión de Acarreo',
    year: 2023,
    totalOperatingHours: 9800,
    status: 'En Mantenimiento',
    location: {
      lat: -22.3160,
      lng: -68.9050,
      altitudeMeters: 3420,
      pitBench: 'Taller Central de Bahías M1',
      zone: 'Área de Mantenimiento Mayor'
    },
    availabilityRate: 84.1,
    mtbfHours: 145,
    mttrHours: 6.2,
    healthScore: 62,
    hourlyCostUSD: 850000,
    componentsCount: 88,
    activeTicketsCount: 3,
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-kom980e-208',
    tag: 'HT-980-208',
    name: 'Camión Eléctrico Komatsu 980E-5 #208',
    model: '980E-5 Electric Drive (400t)',
    manufacturer: 'Komatsu Mining Corp',
    type: 'Camión de Acarreo',
    year: 2022,
    totalOperatingHours: 14200,
    status: 'Operativo',
    location: {
      lat: -22.3240,
      lng: -68.8940,
      altitudeMeters: 3300,
      pitBench: 'Rampa de Descarga Primaria #2',
      zone: 'Circuito Chancador Primario'
    },
    availabilityRate: 91.5,
    mtbfHours: 210,
    mttrHours: 4.1,
    healthScore: 89,
    hourlyCostUSD: 870000,
    componentsCount: 92,
    activeTicketsCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'eq-let2350-05',
    tag: 'WL-2350-05',
    name: 'Cargador Frontal LeTourneau L-2350 #05',
    model: 'Generation II LeTourneau L-2350',
    manufacturer: 'Komatsu / LeTourneau',
    type: 'Cargador Frontal',
    year: 2020,
    totalOperatingHours: 26500,
    status: 'Standby',
    location: {
      lat: -22.3175,
      lng: -68.9080,
      altitudeMeters: 3450,
      pitBench: 'Stockpile de Mineral de Baja Ley',
      zone: 'Acopio Norte'
    },
    availabilityRate: 87.0,
    mtbfHours: 160,
    mttrHours: 5.5,
    healthScore: 78,
    hourlyCostUSD: 1200000,
    componentsCount: 110,
    activeTicketsCount: 1,
    imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&auto=format&fit=crop&q=80',
  }
];

let currentTickets = [
  {
    id: 'tkt-2026-089',
    ticketCode: 'WO-2026-089',
    equipmentId: 'eq-ph4100-01',
    equipmentTag: 'SH-4100-01',
    equipmentName: 'Pala Eléctrica P&H 4100XPC #01',
    componentId: 'cmp-subcmp-01-1-1-1',
    componentName: 'Sellos de Alta Presión & O-Rings Viton (Bomba Rexroth A4VSO)',
    failureType: 'Hidráulica',
    severity: 4,
    title: 'Fuga de fluido y sobrecalentamiento en sellos de bomba hidráulica principal',
    description: 'Telemetría SCADA detectó pulsaciones de presión a 340 Bar con micro-vibración en 9.3 mm/s y pico térmico de 94.6°C. El modelo de RUL prevé fallo catastrófico en menos de 38 ciclos (aprox. 14 horas de operación continua). Riesgo inminente de parada con costo de $2.1M USD/hr.',
    reportedBy: 'Sistema IA Predictivo (MineTwin Anomaly Engine)',
    reportedAt: '2026-08-24 08:30:00',
    assignedToUser: {
      id: 'usr-tech-1',
      email: 'marcos.tecnico@oreguard.corp',
      fullName: 'Marcos Benítez (Técnico Especialista Hidráulico)',
      role: 'Técnico de Campo',
      specialty: 'Hidráulica',
      isActive: true,
      currentWorkloadTickets: 1,
    },
    status: 'DIAGNÓSTICO',
    priority: 'Urgente',
    estimatedCostUSD: 18500,
    actualCostUSD: 0,
    startedAt: '2026-08-24 09:15:00',
    evidenceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    rootCauseAnalysis: 'Degradación térmica acelerada del polímero Viton por cavitación intermitente en la línea de succión número 2.',
    aiSuggestedAction: '1. Despresurizar banco hidráulico. 2. Reemplazo del kit de sellos y retén de labio doble. 3. Purgar y verificar nivel de aceite ISO VG 46.',
    timeline: [
      {
        id: 'tl-1',
        ticketId: 'tkt-2026-089',
        statusFrom: 'REPORTADO',
        statusTo: 'REPORTADO',
        changedBy: 'MineTwin Anomaly Engine',
        changedAt: '2026-08-24 08:30:00',
        notes: 'Detección automática de anomalía en telemetría de vibración + temperatura.'
      },
      {
        id: 'tl-2',
        ticketId: 'tkt-2026-089',
        statusFrom: 'REPORTADO',
        statusTo: 'DIAGNÓSTICO',
        changedBy: 'Ing. Roberto Silva (Superv. Mina)',
        changedAt: '2026-08-24 09:00:00',
        notes: 'Aprobación de apertura de ticket y asignación a Marcos Benítez (Especialidad Hidráulica).'
      }
    ]
  },
  {
    id: 'tkt-2026-085',
    ticketCode: 'WO-2026-085',
    equipmentId: 'eq-cat797f-104',
    equipmentTag: 'HT-797-104',
    equipmentName: 'Camión de Acarreo Ultra-Clase Cat 797F #104',
    componentId: 'cmp-cat-susp-02',
    componentName: 'Cilindro de Suspensión Hidroneumática Trasera Izquierda',
    failureType: 'Mecánica',
    severity: 3,
    title: 'Pérdida de presión de nitrógeno en cilindro de suspensión trasera',
    description: 'Operador reportó inclinación del chasis durante la fase de volteo en botadero sur. Se confirmó fuga por sello secundario.',
    reportedBy: 'Operador de Turno Mañana',
    reportedAt: '2026-08-23 16:45:00',
    assignedToUser: {
      id: 'usr-tech-3',
      email: 'javier.mecanico@oreguard.corp',
      fullName: 'Javier Alarcón (Técnico Mecánico de Palas)',
      role: 'Técnico de Campo',
      specialty: 'Mecánica',
      isActive: true,
      currentWorkloadTickets: 0,
    },
    status: 'EN_REPARACIÓN',
    priority: 'Alta',
    estimatedCostUSD: 12400,
    actualCostUSD: 9800,
    startedAt: '2026-08-24 07:00:00',
    timeline: [
      {
        id: 'tl-20',
        ticketId: 'tkt-2026-085',
        statusFrom: 'REPORTADO',
        statusTo: 'DIAGNÓSTICO',
        changedBy: 'Supervisor de Mina',
        changedAt: '2026-08-23 17:00:00',
        notes: 'Equipo derivado a bahía de mantenimiento M1.'
      },
      {
        id: 'tl-21',
        ticketId: 'tkt-2026-085',
        statusFrom: 'DIAGNÓSTICO',
        statusTo: 'PLANIFICADO',
        changedBy: 'Dra. Valentina Flores (Ing. Mantenimiento)',
        changedAt: '2026-08-23 19:30:00',
        notes: 'Planificación de recarga de nitrógeno y reemplazo de sello tórico.'
      },
      {
        id: 'tl-22',
        ticketId: 'tkt-2026-085',
        statusFrom: 'PLANIFICADO',
        statusTo: 'EN_REPARACIÓN',
        changedBy: 'Javier Alarcón',
        changedAt: '2026-08-24 07:00:00',
        notes: 'Inicio de maniobra de desacople con puente grúa.'
      }
    ]
  },
  {
    id: 'tkt-2026-077',
    ticketCode: 'WO-2026-077',
    equipmentId: 'eq-bucyrus495-02',
    equipmentTag: 'SH-495-02',
    equipmentName: 'Pala Eléctrica Bucyrus 495HR #02',
    componentId: 'cmp-buc-elec-01',
    componentName: 'Inversor IGBT de Frecuencia Variable - Motor de Empuje',
    failureType: 'Eléctrica',
    severity: 2,
    title: 'Calibración de sensor de efecto Hall en convertidor de tracción',
    description: 'Deriva en lectura de amperaje durante el ciclo de penetración en roca dura.',
    reportedBy: 'Dra. Valentina Flores',
    reportedAt: '2026-08-22 11:20:00',
    assignedToUser: {
      id: 'usr-tech-2',
      email: 'dario.electrico@oreguard.corp',
      fullName: 'Darío Morales (Técnico Alta Tensión & Eléctrica)',
      role: 'Técnico de Campo',
      specialty: 'Eléctrica',
      isActive: true,
      currentWorkloadTickets: 2,
    },
    status: 'CERRADO',
    priority: 'Media',
    estimatedCostUSD: 4500,
    actualCostUSD: 3900,
    startedAt: '2026-08-22 14:00:00',
    resolvedAt: '2026-08-22 18:30:00',
    mttrHoursCalculated: 4.5,
    timeline: [
      {
        id: 'tl-30',
        ticketId: 'tkt-2026-077',
        statusFrom: 'REPORTADO',
        statusTo: 'CERRADO',
        changedBy: 'Darío Morales',
        changedAt: '2026-08-22 18:30:00',
        notes: 'Sensor recalibrado y pruebas de torque completadas satisfactoriamente.'
      }
    ]
  }
];

let auditLogs: Array<any> = [
  {
    id: 'aud-001',
    userId: 'usr-sup-1',
    userName: 'Ing. Roberto Silva (Superv. Mina)',
    userRole: 'Supervisor de Mina',
    action: 'TICKET_STATUS_UPDATED',
    resource: 'maintenance_tickets',
    resourceId: 'tkt-2026-089',
    details: { from: 'REPORTADO', to: 'DIAGNÓSTICO', priority: 'Urgente' },
    ipAddress: '192.168.10.45',
    createdAt: new Date().toISOString()
  }
];

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    system: "MineTwin AI - Heavy Mining Asset Management",
    version: "3.2.0-prod",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Equipment endpoints
app.get("/api/equipment", (_req, res) => {
  res.json({ data: currentEquipments, total: currentEquipments.length });
});

app.get("/api/equipment/:id", (req, res) => {
  const eq = currentEquipments.find(e => e.id === req.params.id);
  if (!eq) {
    return res.status(404).json({ error: "Equipo no encontrado" });
  }
  res.json({ data: eq });
});

app.patch("/api/equipment/:id/status", (req, res) => {
  const { status, user } = req.body;
  const eqIndex = currentEquipments.findIndex(e => e.id === req.params.id);
  if (eqIndex === -1) {
    return res.status(404).json({ error: "Equipo no encontrado" });
  }
  
  const oldStatus = currentEquipments[eqIndex].status;
  currentEquipments[eqIndex].status = status;
  
  const audit = {
    id: `aud-${Date.now()}`,
    userId: user?.id || 'usr-anon',
    userName: user?.fullName || 'Usuario',
    userRole: user?.role || 'Operador',
    action: 'EQUIPMENT_STATUS_CHANGE',
    resource: 'equipment',
    resourceId: req.params.id,
    details: { oldStatus, newStatus: status, tag: currentEquipments[eqIndex].tag },
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  };
  auditLogs.unshift(audit);

  res.json({ data: currentEquipments[eqIndex], audit });
});

// Tickets CMMS API
app.get("/api/tickets", (_req, res) => {
  res.json({ data: currentTickets, total: currentTickets.length });
});

app.post("/api/tickets", (req, res) => {
  const body = req.body;
  const newTicket = {
    id: `tkt-${Date.now()}`,
    ticketCode: `WO-2026-${Math.floor(100 + Math.random() * 900)}`,
    equipmentId: body.equipmentId,
    equipmentTag: body.equipmentTag || 'EQ-MINING',
    equipmentName: body.equipmentName || 'Equipo Minero',
    componentId: body.componentId || 'cmp-gen',
    componentName: body.componentName || 'Componente General',
    failureType: body.failureType || 'Mecánica',
    severity: body.severity || 3,
    title: body.title,
    description: body.description,
    reportedBy: body.reportedBy || 'Operador',
    reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    assignedToUser: body.assignedToUser,
    status: 'REPORTADO' as const,
    priority: body.priority || 'Media',
    estimatedCostUSD: body.estimatedCostUSD || 15000,
    actualCostUSD: 0,
    evidenceUrl: body.evidenceUrl,
    timeline: [
      {
        id: `tl-${Date.now()}`,
        ticketId: `tkt-${Date.now()}`,
        statusFrom: 'REPORTADO',
        statusTo: 'REPORTADO',
        changedBy: body.reportedBy || 'Operador',
        changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        notes: 'Creación y registro inicial del ticket de falla.'
      }
    ]
  };

  currentTickets.unshift(newTicket as any);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: body.user?.id || 'usr-anon',
    userName: body.user?.fullName || body.reportedBy,
    userRole: body.user?.role || 'Operador',
    action: 'TICKET_CREATED',
    resource: 'maintenance_tickets',
    resourceId: newTicket.id,
    details: { code: newTicket.ticketCode, title: newTicket.title, severity: newTicket.severity },
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ data: newTicket });
});

app.patch("/api/tickets/:id/transition", (req, res) => {
  const { targetStatus, user, notes } = req.body;
  const ticket = currentTickets.find(t => t.id === req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: "Ticket no encontrado" });
  }

  if (ticket.status === 'DIAGNÓSTICO' && targetStatus === 'PLANIFICADO') {
    const allowedRoles = ['Ingeniero de Mantenimiento', 'Supervisor de Mina', 'Administrador de Sistema'];
    if (!user?.role || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: "Acceso denegado: Solo el Ingeniero de Mantenimiento o Supervisor puede aprobar la transición a PLANIFICADO."
      });
    }
  }

  if (targetStatus === 'EN_REPARACIÓN' && !ticket.assignedToUser) {
    return res.status(400).json({
      error: "Validación fallida: Se debe asignar un técnico especialista antes de iniciar la reparación."
    });
  }

  const prevStatus = ticket.status;
  ticket.status = targetStatus;

  if (targetStatus === 'EN_REPARACIÓN' && !ticket.startedAt) {
    ticket.startedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  if (targetStatus === 'CERRADO') {
    ticket.resolvedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    ticket.mttrHoursCalculated = 4.2;
    ticket.actualCostUSD = ticket.actualCostUSD || ticket.estimatedCostUSD * 0.95;
  }

  const timelineEntry = {
    id: `tl-${Date.now()}`,
    ticketId: ticket.id,
    statusFrom: prevStatus,
    statusTo: targetStatus,
    changedBy: user?.fullName || 'Supervisor',
    changedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    notes: notes || `Transición de estado a ${targetStatus}`
  };
  ticket.timeline.push(timelineEntry);

  auditLogs.unshift({
    id: `aud-${Date.now()}`,
    userId: user?.id || 'usr-anon',
    userName: user?.fullName || 'Usuario',
    userRole: user?.role || 'Supervisor',
    action: 'TICKET_TRANSITION',
    resource: 'maintenance_tickets',
    resourceId: ticket.id,
    details: { from: prevStatus, to: targetStatus, code: ticket.ticketCode },
    ipAddress: req.ip || '127.0.0.1',
    createdAt: new Date().toISOString()
  });

  res.json({ data: ticket });
});

// Audit logs endpoint
app.get("/api/audit-logs", (_req, res) => {
  res.json({ data: auditLogs, total: auditLogs.length });
});

// AI Diagnostic Root Cause Analysis with Gemini 3.7 Flash
app.post("/api/ai/diagnostics", async (req, res) => {
  const { equipmentTag, equipmentName, componentName, sensorData, failureDescription, severity } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      data: {
        rootCause: `Degradación tribológica y fatiga superficial del material en ${componentName} provocada por oscilaciones armónicas y temperatura elevada (${sensorData?.temperature || 94}°C).`,
        fmeaSeverity: severity || 4,
        fmeaOccurrence: 3,
        fmeaDetection: 2,
        rpnScore: (severity || 4) * 3 * 2,
        prescriptiveSteps: [
          `Aislar y despresurizar el circuito principal del ${equipmentTag}.`,
          `Inspeccionar tolerancia dimensional del alojamiento y estado de la película lubricante ISO VG 46/68.`,
          `Sustituir el conjunto de sellos elastómeros por aleación Viton de alta resiliencia térmica.`,
          `Realizar prueba de presurización estática a 350 Bar durante 15 minutos sin caída de presión.`,
          `Efectuar recalibración del acelerómetro piezoeléctrico en el cojinete número 1.`
        ],
        estimatedMTTRHours: 4.5,
        productionLossPreventedUSD: 2100000 * 3.5,
        source: "MineTwin Fallback Industrial Engine"
      }
    });
  }

  try {
    const prompt = `Actúa como Ingeniero Senior de Confiabilidad y Especialista en Maquinaria Minera Pesada de Tajo Abierto (P&H, Bucyrus, Komatsu, Caterpillar).
Analiza el siguiente evento de falla y telemetría de sensores para generar un diagnóstico de causa raíz (Root Cause Analysis - RCA), análisis FMEA y pasos prescriptivos:

EQUIPO: ${equipmentTag} - ${equipmentName}
COMPONENTE AFECTADO: ${componentName}
SEVERIDAD (1-5): ${severity}
DESCRIPCIÓN DEL EVENTO: ${failureDescription}
TELEMETRÍA ACTUAL:
- Temperatura: ${sensorData?.temperature || '94.6'} °C
- Vibración RMS: ${sensorData?.vibration || '9.3'} mm/s
- Presión Hidráulica: ${sensorData?.pressure || '340'} Bar
- Horómetro del componente: ${sensorData?.hours || '5740'} hrs

Responde en formato JSON válido con las siguientes claves:
{
  "rootCause": "Explicación técnica rigurosa de la causa raíz física/mecánica",
  "fmeaSeverity": number,
  "fmeaOccurrence": number,
  "fmeaDetection": number,
  "rpnScore": number,
  "prescriptiveSteps": ["Paso 1", "Paso 2", "Paso 3", "Paso 4"],
  "estimatedMTTRHours": number,
  "productionLossPreventedUSD": number,
  "specialtyRequired": "Hidráulica" | "Mecánica" | "Eléctrica" | "Lubricación",
  "preventiveMeasures": "Medidas para evitar recurrencia a largo plazo"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Gemini API Diagnostics error:", err);
    res.status(500).json({ error: "Error al generar diagnóstico con IA", details: err.message });
  }
});

// AI Executive Shift & Weekly Report Generator
app.post("/api/ai/executive-summary", async (req, res) => {
  const { kpis, fleetStatus, recentTickets } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      summary: `RESUMEN EJECUTIVO DE CONFIABILIDAD MINERA (TURNO ACTUAL)
• Disponibilidad Global de Flota de Carguío: ${kpis?.availabilityOverallPct || 91.2}% (Meta: >90.0%).
• Costo de Parada Evitado acumulado: $${((kpis?.savingsGeneratedUSD || 72450000) / 1000000).toFixed(1)}M USD.
• Equipo en foco crítico: Pala P&H 4100XPC #01 con RUL proyectado en 38 ciclos para sellos de bomba principal. Se recomienda intervención programada en la próxima ventana de cambio de turno para evitar parada no programada valorada en $2.1M/hr.
• Camión Cat 797F #104 en avance de 75% en recarga de suspensión y retorno a frente de carguío estimado en 2.2 horas.`
    });
  }

  try {
    const prompt = `Eres el Gerente General de Mantenimiento y Confiabilidad Mina en una operación de cobre a cielo abierto de clase mundial.
Genera un informe ejecutivo conciso, de alto impacto y formal (en español) para el Comité de Operaciones Mina con los siguientes datos:
- KPIs: MTBF: ${kpis?.mtbfOverallHours} hrs, MTTR: ${kpis?.mttrOverallHours} hrs, Disponibilidad: ${kpis?.availabilityOverallPct}%, Ahorro por paradas evitadas: $${kpis?.savingsGeneratedUSD} USD.
- Estado de Flota: ${JSON.stringify(fleetStatus || [])}
- Tickets recientes: ${JSON.stringify(recentTickets || [])}

Estructura el reporte con:
1. Resumen Estratégico de Confiabilidad y OEE.
2. Alertas Críticas y Acciones de Mitigación Inmediatas.
3. Impacto Financiero y Proyección de Disponibilidad para los próximos 7 días.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.json({ success: true, summary: response.text });
  } catch (err: any) {
    console.error("Gemini API Executive Summary error:", err);
    res.status(500).json({ error: "Error generando resumen ejecutivo", details: err.message });
  }
});
