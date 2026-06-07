import type { FileAttachment } from './patent';

export interface Trademark {
  id: string;
  name: string;
  registrationNumber: string;
  logoImage?: string;
  categories: string[];
  applicationDate: string;
  registrationDate?: string;
  validFrom: string;
  validTo: string;
  regions: string[];
  owner: string;
  status: 'APPLIED' | 'REGISTERED' | 'RENEWED' | 'EXPIRED' | 'OPPOSED';
  files: FileAttachment[];
  createdAt: string;
}

export interface Copyright {
  id: string;
  workName: string;
  workType: string;
  completionDate: string;
  registrationDate?: string;
  registrationNumber?: string;
  certificateImage?: string;
  authors: string[];
  owner: string;
  description: string;
  regions: string[];
  files: FileAttachment[];
  createdAt: string;
}
