import type { Patent } from './patent';
import type { ValuationFactor } from './valuation';

export interface PaymentRecord {
  id: string;
  dueDate: string;
  amount: number;
  paidDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  reference?: string;
}

export interface LicenseAgreement {
  id: string;
  agreementNumber: string;
  patentIds: string[];
  licensee: string;
  licenseScope: string;
  licenseType: 'EXCLUSIVE' | 'NON_EXCLUSIVE' | 'SOLE';
  territory: string[];
  effectiveDate: string;
  expirationDate: string;
  licenseFee: number;
  paymentTerms: string;
  paymentRecords: PaymentRecord[];
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  contractFile?: string;
  notes?: string;
  patents?: Patent[];
}

export interface TechnologyTransfer {
  id: string;
  transferNumber: string;
  patentIds: string[];
  transferor: string;
  transferee: string;
  transferType: 'ASSIGNMENT' | 'MERGER' | 'SPIN_OFF';
  transferDate: string;
  consideration: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  agreementFile?: string;
  notes?: string;
  patents?: Patent[];
}

export interface PledgeFinancing {
  id: string;
  financingNumber: string;
  patentIds: string[];
  pledgee: string;
  financingAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  maturityDate: string;
  registrationDate?: string;
  status: 'ACTIVE' | 'MATURED' | 'REDEEMED';
  notes?: string;
  patents?: Patent[];
}
