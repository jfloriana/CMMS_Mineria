import React, { useState } from 'react';
import { 
  Boxes, 
  Cpu, 
  Database, 
  FileCode2, 
  GitBranch, 
  Layers, 
  Network, 
  Server, 
  ShieldCheck, 
  Workflow 
} from 'lucide-react';

export const ArchitectureDiagrams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'system_context' | 'clean_arch' | 'data_pipeline' | 'er_model' | 'docker_stack'>('system_context');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Workflow className="w-4 h-4" />
            Ingeniería de Software & Arquitectura de Sistemas
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">
            Diagramas de Arquitectura, Flujo de Datos & Stack Tecnológico
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Diseño empresarial para operaciones mineras críticas: Clean Architecture, IoT Streaming, PostGIS/TimescaleDB e Inferencia IA.
          </p>
        </div>
      </div>

      {/* Diagram Navigation Tabs */}
      <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1.5 rounded-xl gap-1 text-xs">
        <button
          onClick={() => setActiveTab('system_context')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'system_context' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          1. Contexto C4 & Interfaces
        </button>
        <button
          onClick={() => setActiveTab('clean_arch')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'clean_arch' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          2. Clean Architecture Backend
        </button>
        <button
          onClick={() => setActiveTab('data_pipeline')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'data_pipeline' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          3. Pipeline de Datos & IA
        </button>
        <button
          onClick={() => setActiveTab('er_model')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'er_model' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          4. Modelo Entidad-Relación
        </button>
        <button
          onClick={() => setActiveTab('docker_stack')}
          className={`px-3.5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'docker_stack' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          5. Infraestructura & Docker
        </button>
      </div>

      {/* Main Diagram Canvas */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        {activeTab === 'system_context' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-amber-400" />
              Diagrama de Contexto de Sistema (Nivel C1 / C2)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Integración de telemetría de campo minero (Sensores I/O, OPC-UA, CAN-Bus) con la plataforma MineTwin AI, algoritmos de machine learning y despacho CMMS.
            </p>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto text-xs font-mono text-slate-300">
              <pre className="text-amber-400 leading-relaxed">
{`+---------------------------------------------------------------------------------------------------+
|                                  ENTORNO OPERACIONAL MINA (TAJO ABIERTO)                          |
+---------------------------------------------------------------------------------------------------+
  [ Sensores Térmicos PT100 ]   [ Vibraciones Triaxiales ]   [ Presión Hidráulica ]   [ GPS RTK PostGIS ]
             │                              │                          │                      │
             ▼                              ▼                          ▼                      ▼
  +-----------------------------------------------------------------------------------------------+
  |                 GATEWAY INDUSTRIAL IoT & CONTROLADORES PLC (Modbus / OPC-UA / MQTT)           |
  +-----------------------------------------------------------------------------------------------+
                                                │ (Red 4G LTE / Starlink / Mesh)
                                                ▼
  +-----------------------------------------------------------------------------------------------+
  |                             MINETWIN AI — PLATAFORMA EMPRESARIAL                              |
  |                                                                                               |
  |   [ INGESTION ENGINE ]            [ ANALYTICS & DIGITAL TWIN ]          [ CMMS ENGINE ]       |
  |   - Kafka / RabbitMQ Streams      - Three.js 3D Procedural Mesh         - State Transitions   |
  |   - TimescaleDB Metric Store      - Isolation Forest Anomaly Detection  - RBAC Security       |
  |   - PostGIS Spatial Coordinates   - NASA Turbofan RUL Estimator         - Technician Routing  |
  |                                   - Gemini 3.7 Flash FMEA & RCA                               |
  +-----------------------------------------------------------------------------------------------+
             │                                                │                               │
             ▼                                                ▼                               ▼
    [ Supervisor de Mina ]                         [ Ingeniero de Mantenimiento ]         [ Técnico de Campo ]
    - Tablero Ejecutivo                            - Auditoría de Falla & Planificación   - Diagnóstico Móvil y
    - KPIs Disponibilidad >85%                     - Aprobación de Órdenes de Trabajo       Procedimientos FMEA`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'clean_arch' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Estructura Clean Architecture (Domain Driven Design)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Separación desacoplada en 4 capas concéntricas con regla de dependencia estricta hacia el Dominio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  1. Capa de Dominio (Domain Core)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Entidades puras (Equipment, Component, FailureTicket, AuditLog), Value Objects (RULScore, Coordinates) e Interfaces de Repositorio sin dependencias externas.
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  src/types.ts & domain/entities/
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  2. Capa de Aplicación (Use Cases)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Casos de uso del negocio: TransitionTicketStatusUseCase, CalculateRULUseCase, RunGeminiFMEADiagnosticUseCase, AuditActionLogger.
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  src/context/AppContext.tsx & application/use_cases/
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-orange-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  3. Capa de Infraestructura (Infrastructure)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Implementaciones concretas: Repositorio PostgreSQL / TimescaleDB, Cliente @google/genai (Gemini 3.7 Flash), Cache Redis.
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  server.ts & infra/database/
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  4. Capa de Presentación (Presentation / UI)
                </div>
                <p className="text-slate-400 text-[11px]">
                  React 19 + Vite SPA, Three.js 3D Canvas con Raycasting, Recharts para series de tiempo y Tailwind CSS Dark Industrial.
                </p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300">
                  src/modules/ (Dashboard, DigitalTwin, CMMS)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data_pipeline' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-rose-400" />
              Pipeline de Streaming IoT & Inferencia Machine Learning
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flujo de telemetría de alta frecuencia a 100Hz con agregación por ventana móvil e inferencia continua de anomalías y RUL.
            </p>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <pre className="text-cyan-300 leading-relaxed">
{` [ Telemetría 100Hz Sensores ]
             │
             ▼
 [ Apache Kafka / Buffer MQTT ] ───▶ [ Ingestion Microservice (TimescaleDB) ]
             │
             ▼
 [ Feature Engineering (Ventana Móvil 10s) ]
  - RMS Vibración Triaxial X/Y/Z
  - Delta Térmico (T_actual - T_ambiente)
  - Derivada de Presión (dP/dt)
  - Horómetro & Conteo de Ciclos
             │
             ├───▶ [ Isolation Forest (Detección de Anomalías) ]
             │       └── Score > 0.75 ──▶ Genera Alerta Preventiva
             │
             ├───▶ [ Random Forest Regressor (NASA Turbofan RUL) ]
             │       └── Estima ciclos restantes & Intervalos [p05, p95]
             │
             └───▶ [ Gemini 3.7 Flash Industrial Reasoning ]
                     └── Si Severidad >= 4: Genera RCA, RPN Matrix y Procedimiento FMEA`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'er_model' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Modelo Entidad-Relación Relacional (PostgreSQL / PostGIS)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esquema de base de datos relacional con claves foráneas, índices geoespaciales y tablas de auditoría inmutables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-amber-400 mb-2">EQUIPMENTS (Activos)</div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>• id: UUID (PK)</div>
                  <div>• tag: VARCHAR(50) UNIQUE</div>
                  <div>• name: VARCHAR(100)</div>
                  <div>• type: ENUM</div>
                  <div>• location_geom: GEOMETRY(Point, 4326)</div>
                  <div>• pit_bench: VARCHAR(50)</div>
                  <div>• status: ENUM</div>
                  <div>• total_operating_hours: NUMERIC</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-cyan-400 mb-2">COMPONENTS (Jerarquía 5 Nvl)</div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>• id: UUID (PK)</div>
                  <div>• equipment_id: UUID (FK)</div>
                  <div>• parent_id: UUID (FK Self)</div>
                  <div>• level: INT (1 a 5)</div>
                  <div>• mesh_id: VARCHAR(50)</div>
                  <div>• health_score: NUMERIC</div>
                  <div>• current_rul_cycles: INT</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-emerald-400 mb-2">FAILURE_TICKETS (CMMS)</div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div>• id: UUID (PK)</div>
                  <div>• ticket_code: VARCHAR(50)</div>
                  <div>• equipment_id: UUID (FK)</div>
                  <div>• status: ENUM (6 Estados)</div>
                  <div>• severity: INT (1 a 5)</div>
                  <div>• assigned_user_id: UUID (FK)</div>
                  <div>• estimated_cost_usd: NUMERIC</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'docker_stack' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-indigo-400" />
              Infraestructura Contenerizada & Docker Compose
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Orquestación lista para producción con PostgreSQL 16 (PostGIS + TimescaleDB), Redis Cache, Express API Server y Frontend Vite Nginx.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <pre className="text-slate-200 leading-relaxed">
{`version: '3.8'

services:
  database:
    image: timescale/timescaledb-ha:pg16-latest
    container_name: minetwin-postgres
    environment:
      POSTGRES_DB: minetwin_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: minetwin-redis
    ports:
      - "6379:6379"

  backend:
    build: .
    container_name: minetwin-api
    environment:
      NODE_ENV: production
      PORT: 3000
      GEMINI_API_KEY: \${GEMINI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - database
      - redis`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
