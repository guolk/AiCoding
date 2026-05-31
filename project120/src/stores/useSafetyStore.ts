import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Equipment, Location, EmergencyContact } from '@/types';
import { mockEquipment, mockLocations, mockEmergencyContacts } from '@/utils/mockData';
import { generateId } from '@/utils/storage';
import { isOverdue, isWithinDays } from '@/utils/dateUtils';

interface SafetyState {
  equipment: Equipment[];
  locations: Location[];
  emergencyContacts: EmergencyContact[];
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  updateEmergencyContact: (id: string, updates: Partial<EmergencyContact>) => void;
  deleteEmergencyContact: (id: string) => void;
  getOverdueEquipment: () => Equipment[];
  getUpcomingEquipmentChecks: () => Equipment[];
  getPrimaryContact: () => EmergencyContact | undefined;
}

export const useSafetyStore = create<SafetyState>()(
  persist(
    (set, get) => ({
      equipment: mockEquipment,
      locations: mockLocations,
      emergencyContacts: mockEmergencyContacts,
      addEquipment: (equipment) => {
        const newEquipment: Equipment = {
          ...equipment,
          id: generateId(),
        };
        set((state) => ({
          equipment: [...state.equipment, newEquipment],
        }));
      },
      updateEquipment: (id, updates) => {
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      deleteEquipment: (id) => {
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
        }));
      },
      addLocation: (location) => {
        const newLocation: Location = {
          ...location,
          id: generateId(),
        };
        set((state) => ({
          locations: [...state.locations, newLocation],
        }));
      },
      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },
      addEmergencyContact: (contact) => {
        const newContact: EmergencyContact = {
          ...contact,
          id: generateId(),
        };
        if (newContact.isPrimary) {
          set((state) => ({
            emergencyContacts: [
              newContact,
              ...state.emergencyContacts.map((c) => ({ ...c, isPrimary: false })),
            ],
          }));
        } else {
          set((state) => ({
            emergencyContacts: [newContact, ...state.emergencyContacts],
          }));
        }
      },
      updateEmergencyContact: (id, updates) => {
        if (updates.isPrimary) {
          set((state) => ({
            emergencyContacts: state.emergencyContacts.map((c) =>
              c.id === id ? { ...c, ...updates } : { ...c, isPrimary: false }
            ),
          }));
        } else {
          set((state) => ({
            emergencyContacts: state.emergencyContacts.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }));
        }
      },
      deleteEmergencyContact: (id) => {
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        }));
      },
      getOverdueEquipment: () => {
        return get().equipment.filter((e) => isOverdue(e.nextCheckDate));
      },
      getUpcomingEquipmentChecks: () => {
        return get().equipment.filter((e) => isWithinDays(e.nextCheckDate, 7));
      },
      getPrimaryContact: () => {
        return get().emergencyContacts.find((c) => c.isPrimary);
      },
    }),
    {
      name: 'safety-storage',
    }
  )
);
