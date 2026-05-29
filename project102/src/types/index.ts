export type EquipmentStatus = 'running' | 'standby' | 'maintenance' | 'fault';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  productionDate: string;
  commissioningDate: string;
  status: EquipmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TechParameter {
  id: string;
  equipmentId: string;
  name: string;
  value: string;
  unit: string;
  remark?: string;
}

export type DocumentType = 'manual' | 'certificate' | 'drawing' | 'other';

export interface EquipmentDocument {
  id: string;
  equipmentId: string;
  name: string;
  type: DocumentType;
  fileName: string;
  uploadDate: string;
}

export type InspectionFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface InspectionStandard {
  id: string;
  equipmentId: string;
  itemName: string;
  checkStandard: string;
  standardValue?: string;
  unit?: string;
  frequency: InspectionFrequency;
  responsiblePerson: string;
}

export type TaskStatus = 'pending' | 'completed' | 'overdue';

export interface InspectionTask {
  id: string;
  standardId: string;
  equipmentId: string;
  taskDate: string;
  status: TaskStatus;
  completedAt?: string;
  inspector?: string;
}

export interface InspectionRecord {
  id: string;
  taskId: string;
  equipmentId: string;
  standardId: string;
  measuredValue?: string;
  isNormal: boolean;
  abnormalDesc?: string;
  handlingMeasures?: string;
  inspector: string;
  inspectionTime: string;
}

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';
export type WorkOrderStatus = 'pending' | 'assigned' | 'processing' | 'completed' | 'closed';

export interface WorkOrder {
  id: string;
  equipmentId: string;
  faultDesc: string;
  urgency: UrgencyLevel;
  reporter: string;
  reportTime: string;
  status: WorkOrderStatus;
  assignee?: string;
  startTime?: string;
  endTime?: string;
  repairContent?: string;
  workHours?: number;
}

export interface SparePartUsage {
  id: string;
  workOrderId: string;
  partCode: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface LubricationPoint {
  id: string;
  equipmentId: string;
  location: string;
  oilType: string;
  changeCycle: number;
  lastChangeDate: string;
  nextChangeDate: string;
  responsiblePerson: string;
}

export interface LubricationRecord {
  id: string;
  pointId: string;
  equipmentId: string;
  oilType: string;
  changeDate: string;
  operator: string;
  remark?: string;
}
