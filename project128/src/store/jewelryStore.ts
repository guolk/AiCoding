
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Jewelry, Valuation, Insurance, Certificate, Maintenance, Repair, Outfit, StoreState, Reminder } from '../types';
import { mockJewelries, mockValuations, mockInsurances, mockCertificates, mockMaintenances, mockRepairs, mockOutfits } from '../data/mockData';
import { generateId, getDaysUntil } from '../utils/format';

const useJewelryStore = create<StoreState>()(
  persist(
    (set, get) => ({
      jewelries: mockJewelries,
      valuations: mockValuations,
      insurances: mockInsurances,
      certificates: mockCertificates,
      maintenances: mockMaintenances,
      repairs: mockRepairs,
      outfits: mockOutfits,

      addJewelry: (jewelry) => {
        const newJewelry: Jewelry = {
          ...jewelry,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ jewelries: [...state.jewelries, newJewelry] }));
      },

      updateJewelry: (id, jewelry) => {
        set((state) => ({
          jewelries: state.jewelries.map((j) =>
            j.id === id ? { ...j, ...jewelry, updatedAt: new Date().toISOString() } : j
          ),
        }));
      },

      deleteJewelry: (id) => {
        set((state) => ({
          jewelries: state.jewelries.filter((j) => j.id !== id),
          valuations: state.valuations.filter((v) => v.jewelryId !== id),
          insurances: state.insurances.filter((i) => i.jewelryId !== id),
          certificates: state.certificates.filter((c) => c.jewelryId !== id),
          maintenances: state.maintenances.filter((m) => m.jewelryId !== id),
          repairs: state.repairs.filter((r) => r.jewelryId !== id),
        }));
      },

      addValuation: (valuation) => {
        const newValuation: Valuation = { ...valuation, id: generateId() };
        set((state) => ({ valuations: [...state.valuations, newValuation] }));
      },

      addInsurance: (insurance) => {
        const newInsurance: Insurance = { ...insurance, id: generateId() };
        set((state) => ({ insurances: [...state.insurances, newInsurance] }));
      },

      addCertificate: (certificate) => {
        const newCertificate: Certificate = { ...certificate, id: generateId() };
        set((state) => ({ certificates: [...state.certificates, newCertificate] }));
      },

      addMaintenance: (maintenance) => {
        const newMaintenance: Maintenance = { ...maintenance, id: generateId() };
        set((state) => ({ maintenances: [...state.maintenances, newMaintenance] }));
      },

      addRepair: (repair) => {
        const newRepair: Repair = { ...repair, id: generateId() };
        set((state) => ({ repairs: [...state.repairs, newRepair] }));
      },

      addOutfit: (outfit) => {
        const newOutfit: Outfit = { ...outfit, id: generateId() };
        set((state) => ({ outfits: [...state.outfits, newOutfit] }));
      },

      updateOutfit: (id, outfit) => {
        set((state) => ({
          outfits: state.outfits.map((o) => (o.id === id ? { ...o, ...outfit } : o)),
        }));
      },

      deleteOutfit: (id) => {
        set((state) => ({
          outfits: state.outfits.filter((o) => o.id !== id),
        }));
      },

      getJewelryById: (id) => {
        return get().jewelries.find((j) => j.id === id);
      },

      getValuationsByJewelryId: (jewelryId) => {
        return get().valuations.filter((v) => v.jewelryId === jewelryId);
      },

      getInsuranceByJewelryId: (jewelryId) => {
        return get().insurances.find((i) => i.jewelryId === jewelryId);
      },

      getCertificatesByJewelryId: (jewelryId) => {
        return get().certificates.filter((c) => c.jewelryId === jewelryId);
      },

      getMaintenancesByJewelryId: (jewelryId) => {
        return get().maintenances.filter((m) => m.jewelryId === jewelryId);
      },

      getRepairsByJewelryId: (jewelryId) => {
        return get().repairs.filter((r) => r.jewelryId === jewelryId);
      },

      getReminders: () => {
        const reminders: Reminder[] = [];
        const { jewelries, maintenances, insurances } = get();

        maintenances.forEach((m) => {
          if (m.nextReminderDate) {
            const daysUntil = getDaysUntil(m.nextReminderDate);
            if (daysUntil <= 30 && daysUntil >= -7) {
              const jewelry = jewelries.find((j) => j.id === m.jewelryId);
              if (jewelry) {
                reminders.push({
                  id: `rem-${m.id}`,
                  type: 'maintenance',
                  jewelryId: m.jewelryId,
                  jewelryName: jewelry.name,
                  dueDate: m.nextReminderDate,
                  description: `${jewelry.name} 需要保养`,
                  priority: daysUntil <= 7 ? 'high' : daysUntil <= 14 ? 'medium' : 'low',
                });
              }
            }
          }
        });

        insurances.forEach((i) => {
          const daysUntil = getDaysUntil(i.endDate);
          if (daysUntil <= 60 && daysUntil >= 0) {
            const jewelry = jewelries.find((j) => j.id === i.jewelryId);
            if (jewelry) {
              reminders.push({
                id: `ins-${i.id}`,
                type: 'insurance',
                jewelryId: i.jewelryId,
                jewelryName: jewelry.name,
                dueDate: i.endDate,
                description: `${jewelry.name} 保险即将到期`,
                priority: daysUntil <= 14 ? 'high' : daysUntil <= 30 ? 'medium' : 'low',
              });
            }
          }
        });

        return reminders.sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate));
      },

      getTotalValue: () => {
        const { jewelries, valuations } = get();
        return jewelries.reduce((total, jewelry) => {
          const jewelryValuations = valuations.filter((v) => v.jewelryId === jewelry.id);
          const latestValuation = jewelryValuations.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          return total + (latestValuation?.value || jewelry.purchasePrice);
        }, 0);
      },

      getWearStats: () => {
        const { jewelries } = get();
        return jewelries
          .map((j) => ({ jewelryId: j.id, name: j.name, count: j.wearCount }))
          .sort((a, b) => b.count - a.count);
      },
    }),
    {
      name: 'jewelry-store',
    }
  )
);

export default useJewelryStore;
