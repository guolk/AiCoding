export interface BaseRecord {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'id_card' | 'passport' | 'driver_license' | 'social_security' | 'bank_card' | 'other';

export interface Document extends BaseRecord {
  type: DocumentType;
  number: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  photoUrl?: string;
  notes?: string;
  reminderDays: number;
  memberId?: string;
}

export type LegalType = 'property_contract' | 'labor_contract' | 'insurance_contract' | 'other';

export interface LegalDocument extends BaseRecord {
  type: LegalType;
  title: string;
  partyA: string;
  partyB: string;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  contractAmount: string;
  keyClauses: KeyClause[];
  reminderDays: number;
  scanFileUrl?: string;
  notes?: string;
}

export interface KeyClause {
  id: string;
  title: string;
  content: string;
  highlighted: boolean;
}

export interface FamilyMember extends BaseRecord {
  name: string;
  relationship: string;
  birthDate: string;
  avatar?: string;
}

export type FamilyRecordType = 'property_certificate' | 'vehicle_registration' | 'education_certificate' | 'will' | 'power_of_attorney' | 'other';

export interface FamilyRecord extends BaseRecord {
  type: FamilyRecordType;
  title: string;
  memberId?: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  fileUrl?: string;
  notes?: string;
  reminderDays: number;
}

export interface BankAccount extends BaseRecord {
  bankName: string;
  accountNumber: string;
  branch: string;
  accountType: string;
  memberId?: string;
  notes?: string;
}

export interface InsurancePolicy extends BaseRecord {
  insuranceCompany: string;
  policyNumber: string;
  policyType: string;
  coverageAmount: string;
  startDate: string;
  expiryDate: string;
  beneficiary: string;
  emergencyPhone: string;
  memberId?: string;
  notes?: string;
  reminderDays: number;
}

export interface InvestmentAccount extends BaseRecord {
  institution: string;
  accountNumber: string;
  accountType: string;
  memberId?: string;
  notes?: string;
}

export interface EmergencyContact extends BaseRecord {
  name: string;
  relationship: string;
  phone: string;
  address?: string;
  priority: number;
}

export interface Reminder {
  id: string;
  relatedId: string;
  relatedType: 'document' | 'legal' | 'family_record' | 'insurance';
  title: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'normal' | 'warning' | 'danger' | 'expired';
}

export interface UserSettings {
  defaultReminderDays: number;
  notifyOnWarning: boolean;
  notifyOnDanger: boolean;
}
