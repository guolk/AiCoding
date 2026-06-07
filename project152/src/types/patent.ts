export type PatentStatus = 'APPLICATION' | 'SUBSTANTIVE_EXAMINATION' | 'AUTHORIZED' | 'MAINTENANCE' | 'ENFORCEMENT' | 'EXPIRED';

export type PatentType = 'INVENTION' | 'UTILITY_MODEL' | 'DESIGN';

export interface StatusRecord {
  id: string;
  status: PatentStatus;
  date: string;
  note?: string;
}

export interface AnnuityRecord {
  id: string;
  year: number;
  dueDate: string;
  amount: number;
  paidDate?: string;
  paidAmount?: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'EXEMPTED';
  paymentProof?: string;
  note?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url: string;
}

export interface Patent {
  id: string;
  name: string;
  applicationNumber: string;
  inventors: string[];
  applicationDate: string;
  authorizationDate?: string;
  patentType: PatentType;
  patentScope: string;
  status: PatentStatus;
  statusHistory: StatusRecord[];
  annuityRecords: AnnuityRecord[];
  technicalField: string;
  ipcClassification: string;
  abstract: string;
  claims?: string;
  description?: string;
  files: FileAttachment[];
  regions: string[];
  createdAt: string;
  updatedAt: string;
}
