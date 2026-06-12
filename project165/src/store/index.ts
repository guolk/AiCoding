import { create } from 'zustand';
import type {
  Drone,
  FlightLog,
  MaintenanceRecord,
  Project,
  Certificate,
  ComplianceRecord,
  IncidentReport,
  Pilot,
} from '@/types';
import {
  mockDrones,
  mockFlightLogs,
  mockMaintenanceRecords,
  mockProjects,
  mockCertificates,
  mockComplianceRecords,
  mockIncidentReports,
  mockPilots,
} from '@/data/mockData';

interface DroneStore {
  drones: Drone[];
  flightLogs: FlightLog[];
  maintenanceRecords: MaintenanceRecord[];
  projects: Project[];
  certificates: Certificate[];
  complianceRecords: ComplianceRecord[];
  incidentReports: IncidentReport[];
  pilots: Pilot[];

  addDrone: (drone: Drone) => void;
  updateDrone: (id: string, data: Partial<Drone>) => void;

  addFlightLog: (flightLog: FlightLog) => void;
  updateFlightLog: (id: string, data: Partial<FlightLog>) => void;

  addMaintenanceRecord: (record: MaintenanceRecord) => void;

  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;

  updateCertificate: (id: string, data: Partial<Certificate>) => void;

  addComplianceRecord: (record: ComplianceRecord) => void;

  addIncidentReport: (report: IncidentReport) => void;

  getFlightLogsByDrone: (droneId: string) => FlightLog[];
  getMaintenanceByDrone: (droneId: string) => MaintenanceRecord[];
  getProjectById: (id: string) => Project | undefined;
  getDroneById: (id: string) => Drone | undefined;
  getFlightLogById: (id: string) => FlightLog | undefined;
  getComplianceByFlight: (flightLogId: string) => ComplianceRecord[];
}

export const useDroneStore = create<DroneStore>((set, get) => ({
  drones: mockDrones,
  flightLogs: mockFlightLogs,
  maintenanceRecords: mockMaintenanceRecords,
  projects: mockProjects,
  certificates: mockCertificates,
  complianceRecords: mockComplianceRecords,
  incidentReports: mockIncidentReports,
  pilots: mockPilots,

  addDrone: (drone) => set((state) => ({ drones: [...state.drones, drone] })),
  updateDrone: (id, data) =>
    set((state) => ({
      drones: state.drones.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),

  addFlightLog: (flightLog) =>
    set((state) => ({ flightLogs: [...state.flightLogs, flightLog] })),
  updateFlightLog: (id, data) =>
    set((state) => ({
      flightLogs: state.flightLogs.map((fl) =>
        fl.id === id ? { ...fl, ...data } : fl
      ),
    })),

  addMaintenanceRecord: (record) =>
    set((state) => ({
      maintenanceRecords: [...state.maintenanceRecords, record],
    })),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    })),

  updateCertificate: (id, data) =>
    set((state) => ({
      certificates: state.certificates.map((c) =>
        c.id === id ? { ...c, ...data } : c
      ),
    })),

  addComplianceRecord: (record) =>
    set((state) => ({
      complianceRecords: [...state.complianceRecords, record],
    })),

  addIncidentReport: (report) =>
    set((state) => ({
      incidentReports: [...state.incidentReports, report],
    })),

  getFlightLogsByDrone: (droneId) =>
    get().flightLogs.filter((fl) => fl.droneId === droneId),

  getMaintenanceByDrone: (droneId) =>
    get().maintenanceRecords.filter((m) => m.droneId === droneId),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getDroneById: (id) => get().drones.find((d) => d.id === id),

  getFlightLogById: (id) => get().flightLogs.find((fl) => fl.id === id),

  getComplianceByFlight: (flightLogId) =>
    get().complianceRecords.filter((c) => c.flightLogId === flightLogId),
}));
