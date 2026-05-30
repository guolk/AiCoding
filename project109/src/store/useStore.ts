import { create } from 'zustand';
import {
  Document,
  LegalDocument,
  FamilyMember,
  FamilyRecord,
  BankAccount,
  InsurancePolicy,
  InvestmentAccount,
  EmergencyContact,
  UserSettings,
  User,
  mockData,
  KeyClause,
} from '@/utils/mockData';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/utils/storageUtils';
import { generateId } from '@/utils/dateUtils';

interface AppState {
  user: User | null;
  documents: Document[];
  legalDocuments: LegalDocument[];
  familyMembers: FamilyMember[];
  familyRecords: FamilyRecord[];
  bankAccounts: BankAccount[];
  insurancePolicies: InsurancePolicy[];
  investments: InvestmentAccount[];
  emergencyContacts: EmergencyContact[];
  settings: UserSettings;
  isInitialized: boolean;

  initializeMockData: () => void;
  loadFromStorage: () => void;

  setUser: (user: User | null) => void;

  addDocument: (doc: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, doc: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  addLegalDocument: (doc: Omit<LegalDocument, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateLegalDocument: (id: string, doc: Partial<LegalDocument>) => void;
  deleteLegalDocument: (id: string) => void;
  addKeyClause: (legalId: string, clause: Omit<KeyClause, 'id'>) => void;
  updateKeyClause: (legalId: string, clauseId: string, clause: Partial<KeyClause>) => void;
  deleteKeyClause: (legalId: string, clauseId: string) => void;

  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyMember: (id: string, member: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;

  addFamilyRecord: (record: Omit<FamilyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateFamilyRecord: (id: string, record: Partial<FamilyRecord>) => void;
  deleteFamilyRecord: (id: string) => void;

  addBankAccount: (account: Omit<BankAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

  addInsurancePolicy: (policy: Omit<InsurancePolicy, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateInsurancePolicy: (id: string, policy: Partial<InsurancePolicy>) => void;
  deleteInsurancePolicy: (id: string) => void;

  addInvestment: (investment: Omit<InvestmentAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateInvestment: (id: string, investment: Partial<InvestmentAccount>) => void;
  deleteInvestment: (id: string) => void;

  addEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateEmergencyContact: (id: string, contact: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (id: string) => void;

  updateSettings: (settings: Partial<UserSettings>) => void;
}

const now = () => new Date().toISOString();

export const useStore = create<AppState>((set, get) => ({
  user: null,
  documents: [],
  legalDocuments: [],
  familyMembers: [],
  familyRecords: [],
  bankAccounts: [],
  insurancePolicies: [],
  investments: [],
  emergencyContacts: [],
  settings: {
    defaultReminderDays: 90,
    notifyOnWarning: true,
    notifyOnDanger: true,
  },
  isInitialized: false,

  initializeMockData: () => {
    const {
      user,
      documents,
      legalDocuments,
      familyMembers,
      familyRecords,
      bankAccounts,
      insurancePolicies,
      investments,
      emergencyContacts,
      settings,
    } = mockData;

    set({
      user,
      documents,
      legalDocuments,
      familyMembers,
      familyRecords,
      bankAccounts,
      insurancePolicies,
      investments,
      emergencyContacts,
      settings,
      isInitialized: true,
    });

    setStorageItem(STORAGE_KEYS.USER, user);
    setStorageItem(STORAGE_KEYS.DOCUMENTS, documents);
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
    setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers);
    setStorageItem(STORAGE_KEYS.FAMILY_RECORDS, familyRecords);
    setStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);
    setStorageItem(STORAGE_KEYS.INSURANCE_POLICIES, insurancePolicies);
    setStorageItem(STORAGE_KEYS.INVESTMENTS, investments);
    setStorageItem(STORAGE_KEYS.EMERGENCY_CONTACTS, emergencyContacts);
    setStorageItem(STORAGE_KEYS.SETTINGS, settings);
    setStorageItem(STORAGE_KEYS.INITIALIZED, true);
  },

  loadFromStorage: () => {
    const state = get();
    if (state.isInitialized) return;

    const user = getStorageItem<User | null>(STORAGE_KEYS.USER, null);
    const documents = getStorageItem<Document[]>(STORAGE_KEYS.DOCUMENTS, []);
    const legalDocuments = getStorageItem<LegalDocument[]>(STORAGE_KEYS.LEGAL_DOCUMENTS, []);
    const familyMembers = getStorageItem<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS, []);
    const familyRecords = getStorageItem<FamilyRecord[]>(STORAGE_KEYS.FAMILY_RECORDS, []);
    const bankAccounts = getStorageItem<BankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS, []);
    const insurancePolicies = getStorageItem<InsurancePolicy[]>(STORAGE_KEYS.INSURANCE_POLICIES, []);
    const investments = getStorageItem<InvestmentAccount[]>(STORAGE_KEYS.INVESTMENTS, []);
    const emergencyContacts = getStorageItem<EmergencyContact[]>(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
    const settings = getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, {
      defaultReminderDays: 90,
      notifyOnWarning: true,
      notifyOnDanger: true,
    });

    const hasData =
      documents.length > 0 ||
      legalDocuments.length > 0 ||
      familyMembers.length > 0 ||
      familyRecords.length > 0 ||
      bankAccounts.length > 0 ||
      insurancePolicies.length > 0 ||
      investments.length > 0 ||
      emergencyContacts.length > 0;

    if (hasData) {
      set({
        user,
        documents,
        legalDocuments,
        familyMembers,
        familyRecords,
        bankAccounts,
        insurancePolicies,
        investments,
        emergencyContacts,
        settings,
        isInitialized: true,
      });
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      setStorageItem(STORAGE_KEYS.USER, user);
    } else {
      setStorageItem(STORAGE_KEYS.USER, null);
    }
  },

  addDocument: (doc) => {
    const state = get();
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const documents = [...state.documents, newDoc];
    set({ documents });
    setStorageItem(STORAGE_KEYS.DOCUMENTS, documents);
  },

  updateDocument: (id, doc) => {
    const state = get();
    const documents = state.documents.map((d) =>
      d.id === id ? { ...d, ...doc, updatedAt: now() } : d
    );
    set({ documents });
    setStorageItem(STORAGE_KEYS.DOCUMENTS, documents);
  },

  deleteDocument: (id) => {
    const state = get();
    const documents = state.documents.filter((d) => d.id !== id);
    set({ documents });
    setStorageItem(STORAGE_KEYS.DOCUMENTS, documents);
  },

  addLegalDocument: (doc) => {
    const state = get();
    const newDoc: LegalDocument = {
      ...doc,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const legalDocuments = [...state.legalDocuments, newDoc];
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  updateLegalDocument: (id, doc) => {
    const state = get();
    const legalDocuments = state.legalDocuments.map((d) =>
      d.id === id ? { ...d, ...doc, updatedAt: now() } : d
    );
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  deleteLegalDocument: (id) => {
    const state = get();
    const legalDocuments = state.legalDocuments.filter((d) => d.id !== id);
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  addKeyClause: (legalId, clause) => {
    const state = get();
    const legalDocuments = state.legalDocuments.map((doc) => {
      if (doc.id === legalId) {
        const newClause: KeyClause = { ...clause, id: generateId() };
        return { ...doc, keyClauses: [...doc.keyClauses, newClause], updatedAt: now() };
      }
      return doc;
    });
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  updateKeyClause: (legalId, clauseId, clause) => {
    const state = get();
    const legalDocuments = state.legalDocuments.map((doc) => {
      if (doc.id === legalId) {
        const keyClauses = doc.keyClauses.map((c) =>
          c.id === clauseId ? { ...c, ...clause } : c
        );
        return { ...doc, keyClauses, updatedAt: now() };
      }
      return doc;
    });
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  deleteKeyClause: (legalId, clauseId) => {
    const state = get();
    const legalDocuments = state.legalDocuments.map((doc) => {
      if (doc.id === legalId) {
        const keyClauses = doc.keyClauses.filter((c) => c.id !== clauseId);
        return { ...doc, keyClauses, updatedAt: now() };
      }
      return doc;
    });
    set({ legalDocuments });
    setStorageItem(STORAGE_KEYS.LEGAL_DOCUMENTS, legalDocuments);
  },

  addFamilyMember: (member) => {
    const state = get();
    const newMember: FamilyMember = {
      ...member,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const familyMembers = [...state.familyMembers, newMember];
    set({ familyMembers });
    setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers);
  },

  updateFamilyMember: (id, member) => {
    const state = get();
    const familyMembers = state.familyMembers.map((m) =>
      m.id === id ? { ...m, ...member, updatedAt: now() } : m
    );
    set({ familyMembers });
    setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers);
  },

  deleteFamilyMember: (id) => {
    const state = get();
    const familyMembers = state.familyMembers.filter((m) => m.id !== id);
    set({ familyMembers });
    setStorageItem(STORAGE_KEYS.FAMILY_MEMBERS, familyMembers);
  },

  addFamilyRecord: (record) => {
    const state = get();
    const newRecord: FamilyRecord = {
      ...record,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const familyRecords = [...state.familyRecords, newRecord];
    set({ familyRecords });
    setStorageItem(STORAGE_KEYS.FAMILY_RECORDS, familyRecords);
  },

  updateFamilyRecord: (id, record) => {
    const state = get();
    const familyRecords = state.familyRecords.map((r) =>
      r.id === id ? { ...r, ...record, updatedAt: now() } : r
    );
    set({ familyRecords });
    setStorageItem(STORAGE_KEYS.FAMILY_RECORDS, familyRecords);
  },

  deleteFamilyRecord: (id) => {
    const state = get();
    const familyRecords = state.familyRecords.filter((r) => r.id !== id);
    set({ familyRecords });
    setStorageItem(STORAGE_KEYS.FAMILY_RECORDS, familyRecords);
  },

  addBankAccount: (account) => {
    const state = get();
    const newAccount: BankAccount = {
      ...account,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const bankAccounts = [...state.bankAccounts, newAccount];
    set({ bankAccounts });
    setStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);
  },

  updateBankAccount: (id, account) => {
    const state = get();
    const bankAccounts = state.bankAccounts.map((a) =>
      a.id === id ? { ...a, ...account, updatedAt: now() } : a
    );
    set({ bankAccounts });
    setStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);
  },

  deleteBankAccount: (id) => {
    const state = get();
    const bankAccounts = state.bankAccounts.filter((a) => a.id !== id);
    set({ bankAccounts });
    setStorageItem(STORAGE_KEYS.BANK_ACCOUNTS, bankAccounts);
  },

  addInsurancePolicy: (policy) => {
    const state = get();
    const newPolicy: InsurancePolicy = {
      ...policy,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const insurancePolicies = [...state.insurancePolicies, newPolicy];
    set({ insurancePolicies });
    setStorageItem(STORAGE_KEYS.INSURANCE_POLICIES, insurancePolicies);
  },

  updateInsurancePolicy: (id, policy) => {
    const state = get();
    const insurancePolicies = state.insurancePolicies.map((p) =>
      p.id === id ? { ...p, ...policy, updatedAt: now() } : p
    );
    set({ insurancePolicies });
    setStorageItem(STORAGE_KEYS.INSURANCE_POLICIES, insurancePolicies);
  },

  deleteInsurancePolicy: (id) => {
    const state = get();
    const insurancePolicies = state.insurancePolicies.filter((p) => p.id !== id);
    set({ insurancePolicies });
    setStorageItem(STORAGE_KEYS.INSURANCE_POLICIES, insurancePolicies);
  },

  addInvestment: (investment) => {
    const state = get();
    const newInvestment: InvestmentAccount = {
      ...investment,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const investments = [...state.investments, newInvestment];
    set({ investments });
    setStorageItem(STORAGE_KEYS.INVESTMENTS, investments);
  },

  updateInvestment: (id, investment) => {
    const state = get();
    const investments = state.investments.map((i) =>
      i.id === id ? { ...i, ...investment, updatedAt: now() } : i
    );
    set({ investments });
    setStorageItem(STORAGE_KEYS.INVESTMENTS, investments);
  },

  deleteInvestment: (id) => {
    const state = get();
    const investments = state.investments.filter((i) => i.id !== id);
    set({ investments });
    setStorageItem(STORAGE_KEYS.INVESTMENTS, investments);
  },

  addEmergencyContact: (contact) => {
    const state = get();
    const newContact: EmergencyContact = {
      ...contact,
      id: generateId(),
      userId: state.user?.id || 'default',
      createdAt: now(),
      updatedAt: now(),
    };
    const emergencyContacts = [...state.emergencyContacts, newContact];
    set({ emergencyContacts });
    setStorageItem(STORAGE_KEYS.EMERGENCY_CONTACTS, emergencyContacts);
  },

  updateEmergencyContact: (id, contact) => {
    const state = get();
    const emergencyContacts = state.emergencyContacts.map((c) =>
      c.id === id ? { ...c, ...contact, updatedAt: now() } : c
    );
    set({ emergencyContacts });
    setStorageItem(STORAGE_KEYS.EMERGENCY_CONTACTS, emergencyContacts);
  },

  deleteEmergencyContact: (id) => {
    const state = get();
    const emergencyContacts = state.emergencyContacts.filter((c) => c.id !== id);
    set({ emergencyContacts });
    setStorageItem(STORAGE_KEYS.EMERGENCY_CONTACTS, emergencyContacts);
  },

  updateSettings: (settings) => {
    const state = get();
    const newSettings = { ...state.settings, ...settings };
    set({ settings: newSettings });
    setStorageItem(STORAGE_KEYS.SETTINGS, newSettings);
  },
}));
