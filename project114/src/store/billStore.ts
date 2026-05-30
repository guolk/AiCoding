import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Bill, EnergyType } from '../types';
import { generateMockBills } from '../utils/mockData';
import { generateId, getCurrentPeriod } from '../utils/formatter';
import { detectAnomaly } from '../utils/calculator';

interface BillStore {
  bills: Bill[];
  initialized: boolean;
  initData: () => void;
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  getBillsByType: (type: EnergyType) => Bill[];
  getBillsByPeriod: (period: string) => Bill[];
  getTotalAmount: (period?: string) => number;
}

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: [],
      initialized: false,
      
      initData: () => {
        const state = get();
        if (!state.initialized) {
          if (state.bills.length === 0) {
            set({ bills: generateMockBills(), initialized: true });
          } else {
            set({ initialized: true });
          }
        }
      },
      
      addBill: (billData) => {
        const newBill: Bill = {
          ...billData,
          id: generateId(),
        };
        
        const bills = get().bills;
        const sortedBills = [...bills].sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
        const previousBill = sortedBills
          .filter(b => b.energyType === billData.energyType && b.billingPeriod < billData.billingPeriod)
          .pop();
        
        const year = parseInt(billData.billingPeriod.split('-')[0]);
        const month = billData.billingPeriod.split('-')[1];
        const lastYearPeriod = `${year - 1}-${month}`;
        const lastYearBill = bills.find(
          b => b.energyType === billData.energyType && b.billingPeriod === lastYearPeriod
        );
        
        const anomaly = detectAnomaly(
          billData.usage,
          previousBill?.usage,
          lastYearBill?.usage
        );
        
        newBill.isAnomaly = anomaly.isAnomaly;
        newBill.anomalyReason = anomaly.reason;
        
        set({ bills: [...bills, newBill] });
      },
      
      updateBill: (id, billData) => {
        set(state => ({
          bills: state.bills.map(bill =>
            bill.id === id ? { ...bill, ...billData } : bill
          ),
        }));
      },
      
      deleteBill: (id) => {
        set(state => ({
          bills: state.bills.filter(bill => bill.id !== id),
        }));
      },
      
      getBillsByType: (type) => {
        return get().bills.filter(bill => bill.energyType === type).sort((a, b) => a.billingPeriod.localeCompare(b.billingPeriod));
      },
      
      getBillsByPeriod: (period) => {
        return get().bills.filter(bill => bill.billingPeriod === period);
      },
      
      getTotalAmount: (period) => {
        const bills = period
          ? get().getBillsByPeriod(period)
          : get().getBillsByPeriod(getCurrentPeriod());
        return bills.reduce((sum, bill) => sum + bill.amount, 0);
      },
    }),
    {
      name: 'energy-bills-storage',
    }
  )
);
