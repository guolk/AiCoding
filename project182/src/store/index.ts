import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Event,
  PlanVersion,
  ScheduleItem,
  Guest,
  Table,
  Invitation,
  Vendor,
  VendorQuote,
  Contract,
  Payment,
  VendorReview,
  BudgetCategory,
  Expense,
  BudgetAdjustment,
  GiftRecord,
  ThankYou,
  PhotoAlbum,
  TodoItem,
} from '../types';
import { mockData } from '../data/mockData';

interface AppState {
  currentEventId: string;
  events: Event[];
  planVersions: PlanVersion[];
  scheduleItems: ScheduleItem[];
  guests: Guest[];
  tables: Table[];
  invitations: Invitation[];
  vendors: Vendor[];
  vendorQuotes: VendorQuote[];
  contracts: Contract[];
  payments: Payment[];
  vendorReviews: VendorReview[];
  budgetCategories: BudgetCategory[];
  expenses: Expense[];
  budgetAdjustments: BudgetAdjustment[];
  giftRecords: GiftRecord[];
  thankYous: ThankYou[];
  photoAlbums: PhotoAlbum[];
  todos: TodoItem[];

  setCurrentEventId: (id: string) => void;
  getCurrentEvent: () => Event | undefined;

  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;

  addPlanVersion: (version: Omit<PlanVersion, 'id' | 'createdAt'>) => void;
  updatePlanVersion: (id: string, updates: Partial<PlanVersion>) => void;
  deletePlanVersion: (id: string) => void;
  restorePlanVersion: (id: string) => void;

  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  reorderScheduleItems: (items: ScheduleItem[]) => void;

  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  bulkUpdateGuests: (ids: string[], updates: Partial<Guest>) => void;

  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;

  addInvitation: (invitation: Omit<Invitation, 'id'>) => void;
  updateInvitation: (id: string, updates: Partial<Invitation>) => void;
  bulkSendInvitations: (ids: string[]) => void;

  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  addVendorQuote: (quote: Omit<VendorQuote, 'id' | 'createdAt'>) => void;
  updateVendorQuote: (id: string, updates: Partial<VendorQuote>) => void;
  selectVendorQuote: (id: string) => void;

  addContract: (contract: Omit<Contract, 'id'>) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;

  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  markPaymentPaid: (id: string, paidDate: string) => void;

  addVendorReview: (review: Omit<VendorReview, 'id' | 'createdAt'>) => void;

  addBudgetCategory: (category: Omit<BudgetCategory, 'id'>) => void;
  updateBudgetCategory: (id: string, updates: Partial<BudgetCategory>) => void;
  addBudgetAdjustment: (adjustment: Omit<BudgetAdjustment, 'id' | 'createdAt'>) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  addGiftRecord: (record: Omit<GiftRecord, 'id'>) => void;
  updateGiftRecord: (id: string, updates: Partial<GiftRecord>) => void;
  deleteGiftRecord: (id: string) => void;

  addThankYou: (thankYou: Omit<ThankYou, 'id'>) => void;
  updateThankYou: (id: string, updates: Partial<ThankYou>) => void;
  markThankYouSent: (id: string, sentAt: string) => void;

  addPhotoAlbum: (album: Omit<PhotoAlbum, 'id'>) => void;
  updatePhotoAlbum: (id: string, updates: Partial<PhotoAlbum>) => void;

  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  updateTodo: (id: string, updates: Partial<TodoItem>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...mockData,

      setCurrentEventId: (id) => set({ currentEventId: id }),

      getCurrentEvent: () => {
        const { currentEventId, events } = get();
        return events.find((e) => e.id === currentEventId);
      },

      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      addPlanVersion: (version) =>
        set((state) => ({
          planVersions: [
            ...state.planVersions,
            {
              ...version,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updatePlanVersion: (id, updates) =>
        set((state) => ({
          planVersions: state.planVersions.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      deletePlanVersion: (id) =>
        set((state) => ({
          planVersions: state.planVersions.filter((v) => v.id !== id),
        })),

      restorePlanVersion: (id) =>
        set((state) => {
          const version = state.planVersions.find((v) => v.id === id);
          if (!version) return {};
          return {
            events: state.events.map((e) =>
              e.id === version.eventId
                ? { ...e, description: version.content, updatedAt: new Date().toISOString() }
                : e
            ),
          };
        }),

      addScheduleItem: (item) =>
        set((state) => ({
          scheduleItems: [
            ...state.scheduleItems,
            { ...item, id: generateId() },
          ].sort((a, b) => a.order - b.order),
        })),

      updateScheduleItem: (id, updates) =>
        set((state) => ({
          scheduleItems: state.scheduleItems.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ).sort((a, b) => a.order - b.order),
        })),

      deleteScheduleItem: (id) =>
        set((state) => ({
          scheduleItems: state.scheduleItems.filter((s) => s.id !== id),
        })),

      reorderScheduleItems: (items) =>
        set(() => {
          const sortedItems = items
            .map((item, index) => ({ ...item, order: index }))
            .sort((a, b) => a.order - b.order);
          return { scheduleItems: sortedItems };
        }),

      addGuest: (guest) =>
        set((state) => ({
          guests: [...state.guests, { ...guest, id: generateId() }],
        })),

      updateGuest: (id, updates) =>
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((g) => g.id !== id),
        })),

      bulkUpdateGuests: (ids, updates) =>
        set((state) => ({
          guests: state.guests.map((g) =>
            ids.includes(g.id) ? { ...g, ...updates } : g
          ),
        })),

      addTable: (table) =>
        set((state) => ({
          tables: [...state.tables, { ...table, id: generateId() }],
        })),

      updateTable: (id, updates) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTable: (id) =>
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id),
        })),

      addInvitation: (invitation) =>
        set((state) => ({
          invitations: [
            ...state.invitations,
            { ...invitation, id: generateId() },
          ],
        })),

      updateInvitation: (id, updates) =>
        set((state) => ({
          invitations: state.invitations.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),

      bulkSendInvitations: (ids) =>
        set((state) => ({
          invitations: state.invitations.map((i) =>
            ids.includes(i.id)
              ? { ...i, status: 'sent', sentAt: new Date().toISOString() }
              : i
          ),
        })),

      addVendor: (vendor) =>
        set((state) => ({
          vendors: [...state.vendors, { ...vendor, id: generateId() }],
        })),

      updateVendor: (id, updates) =>
        set((state) => ({
          vendors: state.vendors.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),

      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((v) => v.id !== id),
        })),

      addVendorQuote: (quote) =>
        set((state) => ({
          vendorQuotes: [
            ...state.vendorQuotes,
            { ...quote, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateVendorQuote: (id, updates) =>
        set((state) => ({
          vendorQuotes: state.vendorQuotes.map((q) =>
            q.id === id ? { ...q, ...updates } : q
          ),
        })),

      selectVendorQuote: (id) =>
        set((state) => {
          const quote = state.vendorQuotes.find((q) => q.id === id);
          if (!quote) return {};
          return {
            vendorQuotes: state.vendorQuotes.map((q) =>
              q.vendorId === quote.vendorId
                ? { ...q, isSelected: q.id === id }
                : q
            ),
          };
        }),

      addContract: (contract) =>
        set((state) => ({
          contracts: [...state.contracts, { ...contract, id: generateId() }],
        })),

      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      addPayment: (payment) =>
        set((state) => ({
          payments: [...state.payments, { ...payment, id: generateId() }],
        })),

      updatePayment: (id, updates) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      markPaymentPaid: (id, paidDate) =>
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? { ...p, status: 'paid', paidDate } : p
          ),
        })),

      addVendorReview: (review) =>
        set((state) => ({
          vendorReviews: [
            ...state.vendorReviews,
            { ...review, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      addBudgetCategory: (category) =>
        set((state) => ({
          budgetCategories: [
            ...state.budgetCategories,
            { ...category, id: generateId() },
          ],
        })),

      updateBudgetCategory: (id, updates) =>
        set((state) => {
          const category = state.budgetCategories.find((c) => c.id === id);
          if (!category || !updates.budgeted) {
            return {
              budgetCategories: state.budgetCategories.map((c) =>
                c.id === id ? { ...c, ...updates } : c
              ),
            };
          }
          const adjustment: BudgetAdjustment = {
            id: generateId(),
            eventId: category.eventId,
            categoryId: id,
            previousAmount: category.budgeted,
            newAmount: updates.budgeted,
            reason: '预算调整',
            createdAt: new Date().toISOString(),
          };
          return {
            budgetCategories: state.budgetCategories.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
            budgetAdjustments: [...state.budgetAdjustments, adjustment],
          };
        }),

      addBudgetAdjustment: (adjustment) =>
        set((state) => ({
          budgetAdjustments: [
            ...state.budgetAdjustments,
            { ...adjustment, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: generateId() }],
        })),

      updateExpense: (id, updates) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addGiftRecord: (record) =>
        set((state) => ({
          giftRecords: [...state.giftRecords, { ...record, id: generateId() }],
        })),

      updateGiftRecord: (id, updates) =>
        set((state) => ({
          giftRecords: state.giftRecords.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGiftRecord: (id) =>
        set((state) => ({
          giftRecords: state.giftRecords.filter((g) => g.id !== id),
        })),

      addThankYou: (thankYou) =>
        set((state) => ({
          thankYous: [...state.thankYous, { ...thankYou, id: generateId() }],
        })),

      updateThankYou: (id, updates) =>
        set((state) => ({
          thankYous: state.thankYous.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      markThankYouSent: (id, sentAt) =>
        set((state) => ({
          thankYous: state.thankYous.map((t) =>
            t.id === id ? { ...t, status: 'sent', sentAt } : t
          ),
        })),

      addPhotoAlbum: (album) =>
        set((state) => ({
          photoAlbums: [...state.photoAlbums, { ...album, id: generateId() }],
        })),

      updatePhotoAlbum: (id, updates) =>
        set((state) => ({
          photoAlbums: state.photoAlbums.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      addTodo: (todo) =>
        set((state) => ({
          todos: [...state.todos, { ...todo, id: generateId() }],
        })),

      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'wedding-planner-storage',
    }
  )
);
