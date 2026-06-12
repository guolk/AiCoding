export interface Drone {
  id: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  batteryCount: number;
  accessories: string[];
  totalFlightHours: number;
  status: 'active' | 'maintenance' | 'retired';
  batteries: Battery[];
}

export interface Battery {
  id: string;
  droneId: string;
  serialNumber: string;
  flightHours: number;
  healthPercent: number;
}

export interface FlightLog {
  id: string;
  droneId: string;
  pilotId: string;
  projectId?: string;
  flightDate: string;
  location: string;
  duration: number;
  distance: number;
  maxAltitude: number;
  weatherCondition: string;
  missionType: 'aerial' | 'mapping' | 'inspection' | 'performance' | 'practice';
  events: FlightEvent[];
  waypoints: GPSWaypoint[];
}

export interface FlightEvent {
  id: string;
  eventType: 'signal_interference' | 'fault_alert' | 'accident' | 'other';
  description: string;
  timestamp: string;
}

export interface GPSWaypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface MaintenanceRecord {
  id: string;
  droneId: string;
  type: 'propeller' | 'motor' | 'firmware' | 'other';
  maintenanceDate: string;
  description: string;
  nextMaintenanceDate?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  purpose: string;
  visualRequirements: string;
  permitStatus: 'pending' | 'approved' | 'rejected' | 'not_required';
  status: 'planning' | 'shooting' | 'review' | 'completed';
  createdAt: string;
  routePlans: RoutePlan[];
  footages: Footage[];
}

export interface RoutePlan {
  id: string;
  projectId: string;
  waypointName: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
}

export interface Footage {
  id: string;
  projectId: string;
  name: string;
  status: 'usable' | 'reshoot' | 'pending';
  qualityScore: number;
  notes: string;
}

export interface Certificate {
  id: string;
  pilotId: string;
  type: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface ComplianceRecord {
  id: string;
  flightLogId: string;
  areaName: string;
  isInNoFlyZone: boolean;
  permitStatus: 'approved' | 'pending' | 'not_required';
  checkedAt: string;
}

export interface IncidentReport {
  id: string;
  flightLogId: string;
  incidentType: string;
  description: string;
  causeAnalysis: string;
  reportDate: string;
}

export interface Pilot {
  id: string;
  name: string;
  email: string;
  certificates: Certificate[];
}
