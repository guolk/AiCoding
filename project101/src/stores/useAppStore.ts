import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Property, PriceRule, Booking, Customer, Review,
  CleaningTask, InventoryItem, MaintenanceTask, PlatformCommission,
  FinanceSummary, MonthlyRevenue, PropertyRevenue, PlatformRevenue,
  AnnualReport, BookingPlatform, BookingStatus, CustomerTag
} from '../types';
import {
  mockProperties, mockPriceRules, mockBookings, mockCustomers,
  mockReviews, mockCleaningTasks, mockInventoryItems,
  mockMaintenanceTasks, mockPlatformCommissions
} from '../data/mockData';

interface AppState {
  properties: Property[];
  priceRules: PriceRule[];
  bookings: Booking[];
  customers: Customer[];
  reviews: Review[];
  cleaningTasks: CleaningTask[];
  inventoryItems: InventoryItem[];
  maintenanceTasks: MaintenanceTask[];
  platformCommissions: PlatformCommission[];

  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addPriceRule: (rule: Omit<PriceRule, 'id' | 'createdAt'>) => void;
  updatePriceRule: (id: string, updates: Partial<PriceRule>) => void;
  deletePriceRule: (id: string) => void;

  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  deleteBooking: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  toggleCustomerTag: (id: string, tag: CustomerTag) => void;

  addCleaningTask: (task: Omit<CleaningTask, 'id' | 'createdAt'>) => void;
  updateCleaningTask: (id: string, updates: Partial<CleaningTask>) => void;
  completeCleaningTask: (id: string) => void;
  deleteCleaningTask: (id: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  restockInventoryItem: (id: string, quantity: number) => void;
  deleteInventoryItem: (id: string) => void;

  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => void;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  completeMaintenanceTask: (id: string) => void;
  deleteMaintenanceTask: (id: string) => void;

  getPropertyById: (id: string) => Property | undefined;
  getBookingsByProperty: (propertyId: string) => Booking[];
  getBookingsByCustomer: (customerId: string) => Booking[];
  checkDateConflict: (propertyId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => boolean;
  getFinanceSummary: (startDate: string, endDate: string) => FinanceSummary;
  getMonthlyRevenue: (year: number) => MonthlyRevenue[];
  getPropertyRevenue: (startDate: string, endDate: string) => PropertyRevenue[];
  getPlatformRevenue: (startDate: string, endDate: string) => PlatformRevenue[];
  getAnnualReport: (year: number) => AnnualReport;
  getLowStockItems: () => InventoryItem[];
  getPendingTasks: () => { cleaning: CleaningTask[]; maintenance: MaintenanceTask[] };
  updatePlatformCommission: (platform: BookingPlatform, rate: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  properties: mockProperties,
  priceRules: mockPriceRules,
  bookings: mockBookings,
  customers: mockCustomers,
  reviews: mockReviews,
  cleaningTasks: mockCleaningTasks,
  inventoryItems: mockInventoryItems,
  maintenanceTasks: mockMaintenanceTasks,
  platformCommissions: mockPlatformCommissions,

  addProperty: (property) => set((state) => ({
    properties: [...state.properties, {
      ...property,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
  })),

  updateProperty: (id, updates) => set((state) => ({
    properties: state.properties.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    )
  })),

  deleteProperty: (id) => set((state) => ({
    properties: state.properties.filter((p) => p.id !== id)
  })),

  addPriceRule: (rule) => set((state) => ({
    priceRules: [...state.priceRules, {
      ...rule,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }]
  })),

  updatePriceRule: (id, updates) => set((state) => ({
    priceRules: state.priceRules.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
  })),

  deletePriceRule: (id) => set((state) => ({
    priceRules: state.priceRules.filter((r) => r.id !== id)
  })),

  addBooking: (booking) => set((state) => {
    const newBooking: Booking = {
      ...booking,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { bookings: [...state.bookings, newBooking] };
  }),

  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    )
  })),

  updateBookingStatus: (id, status) => {
    const state = get();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) return;

    const updates: Partial<Booking> = { status, updatedAt: new Date().toISOString() };

    if (status === 'checked-out' && booking.checkOut) {
      const cleaningTask: CleaningTask = {
        id: uuidv4(),
        propertyId: booking.propertyId,
        bookingId: booking.id,
        status: 'pending',
        scheduledAt: booking.checkOut,
        cost: 100,
        createdAt: new Date().toISOString()
      };
      set((state) => ({
        cleaningTasks: [...state.cleaningTasks, cleaningTask]
      }));
    }

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    }));
  },

  deleteBooking: (id) => set((state) => ({
    bookings: state.bookings.filter((b) => b.id !== id)
  })),

  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, {
      ...customer,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }]
  })),

  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    )
  })),

  deleteCustomer: (id) => set((state) => ({
    customers: state.customers.filter((c) => c.id !== id)
  })),

  toggleCustomerTag: (id, tag) => set((state) => ({
    customers: state.customers.map((c) => {
      if (c.id !== id) return c;
      const hasTag = c.tags.includes(tag);
      return {
        ...c,
        tags: hasTag
          ? c.tags.filter((t) => t !== tag)
          : [...c.tags, tag]
      };
    })
  })),

  addCleaningTask: (task) => set((state) => ({
    cleaningTasks: [...state.cleaningTasks, {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }]
  })),

  updateCleaningTask: (id, updates) => set((state) => ({
    cleaningTasks: state.cleaningTasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),

  completeCleaningTask: (id) => set((state) => ({
    cleaningTasks: state.cleaningTasks.map((t) =>
      t.id === id
        ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
        : t
    )
  })),

  deleteCleaningTask: (id) => set((state) => ({
    cleaningTasks: state.cleaningTasks.filter((t) => t.id !== id)
  })),

  addInventoryItem: (item) => set((state) => ({
    inventoryItems: [...state.inventoryItems, {
      ...item,
      id: uuidv4()
    }]
  })),

  updateInventoryItem: (id, updates) => set((state) => ({
    inventoryItems: state.inventoryItems.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    )
  })),

  restockInventoryItem: (id, quantity) => set((state) => ({
    inventoryItems: state.inventoryItems.map((i) =>
      i.id === id
        ? { ...i, quantity: i.quantity + quantity, lastRestockedAt: new Date().toISOString().split('T')[0] }
        : i
    )
  })),

  deleteInventoryItem: (id) => set((state) => ({
    inventoryItems: state.inventoryItems.filter((i) => i.id !== id)
  })),

  addMaintenanceTask: (task) => set((state) => ({
    maintenanceTasks: [...state.maintenanceTasks, {
      ...task,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }]
  })),

  updateMaintenanceTask: (id, updates) => set((state) => ({
    maintenanceTasks: state.maintenanceTasks.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),

  completeMaintenanceTask: (id) => set((state) => ({
    maintenanceTasks: state.maintenanceTasks.map((t) =>
      t.id === id
        ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
        : t
    )
  })),

  deleteMaintenanceTask: (id) => set((state) => ({
    maintenanceTasks: state.maintenanceTasks.filter((t) => t.id !== id)
  })),

  getPropertyById: (id) => {
    const state = get();
    return state.properties.find((p) => p.id === id);
  },

  getBookingsByProperty: (propertyId) => {
    const state = get();
    return state.bookings.filter((b) => b.propertyId === propertyId);
  },

  getBookingsByCustomer: (customerId) => {
    const state = get();
    return state.bookings.filter((b) => b.customerId === customerId);
  },

  checkDateConflict: (propertyId, checkIn, checkOut, excludeBookingId) => {
    const state = get();
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    return state.bookings.some((b) => {
      if (b.propertyId !== propertyId) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (['cancelled'].includes(b.status)) return false;

      const bStart = new Date(b.checkIn);
      const bEnd = new Date(b.checkOut);

      return start < bEnd && end > bStart;
    });
  },

  getFinanceSummary: (startDate, endDate) => {
    const state = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredBookings = state.bookings.filter((b) => {
      const checkOut = new Date(b.checkOut);
      return checkOut >= start && checkOut <= end && ['checked-out', 'checked-in', 'confirmed'].includes(b.status);
    });

    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCommission = filteredBookings.reduce((sum, b) => sum + b.commission, 0);
    const totalNights = filteredBookings.reduce((sum, b) => sum + b.nights, 0);
    const avgDailyRate = totalNights > 0 ? totalRevenue / totalNights : 0;

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const maxPossibleNights = totalDays * state.properties.length;
    const occupancyRate = maxPossibleNights > 0 ? (totalNights / maxPossibleNights) * 100 : 0;

    return {
      totalRevenue,
      totalNights,
      occupancyRate: Math.min(occupancyRate, 100),
      avgDailyRate,
      totalCommission,
      netRevenue: totalRevenue - totalCommission
    };
  },

  getMonthlyRevenue: (year) => {
    const state = get();
    const monthlyData: MonthlyRevenue[] = [];

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const monthBookings = state.bookings.filter((b) => {
        const checkOut = new Date(b.checkOut);
        return checkOut >= monthStart && checkOut <= monthEnd && ['checked-out', 'checked-in', 'confirmed'].includes(b.status);
      });

      monthlyData.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        revenue: monthBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        nights: monthBookings.reduce((sum, b) => sum + b.nights, 0),
        bookings: monthBookings.length
      });
    }

    return monthlyData;
  },

  getPropertyRevenue: (startDate, endDate) => {
    const state = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return state.properties.map((property) => {
      const propertyBookings = state.bookings.filter((b) => {
        if (b.propertyId !== property.id) return false;
        const checkOut = new Date(b.checkOut);
        return checkOut >= start && checkOut <= end && ['checked-out', 'checked-in', 'confirmed'].includes(b.status);
      });

      return {
        propertyId: property.id,
        propertyName: property.name,
        revenue: propertyBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        nights: propertyBookings.reduce((sum, b) => sum + b.nights, 0),
        bookings: propertyBookings.length
      };
    }).filter((item) => item.revenue > 0 || item.bookings > 0);
  },

  getPlatformRevenue: (startDate, endDate) => {
    const state = get();
    const start = new Date(startDate);
    const end = new Date(endDate);

    const platformData: PlatformRevenue[] = [];

    state.platformCommissions.forEach(({ platform }) => {
      const platformBookings = state.bookings.filter((b) => {
        if (b.platform !== platform) return false;
        const checkOut = new Date(b.checkOut);
        return checkOut >= start && checkOut <= end && ['checked-out', 'checked-in', 'confirmed'].includes(b.status);
      });

      platformData.push({
        platform,
        revenue: platformBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        bookings: platformBookings.length,
        commission: platformBookings.reduce((sum, b) => sum + b.commission, 0)
      });
    });

    return platformData.filter((item) => item.bookings > 0);
  },

  getAnnualReport: (year) => {
    const state = get();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const yearlyBookings = state.bookings.filter((b) => {
      const checkOut = new Date(b.checkOut);
      return checkOut >= yearStart && checkOut <= yearEnd && ['checked-out', 'checked-in', 'confirmed'].includes(b.status);
    });

    const totalRevenue = yearlyBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalCommission = yearlyBookings.reduce((sum, b) => sum + b.commission, 0);
    const totalNights = yearlyBookings.reduce((sum, b) => sum + b.nights, 0);
    const avgDailyRate = totalNights > 0 ? totalRevenue / totalNights : 0;

    const totalDays = 365;
    const maxPossibleNights = totalDays * state.properties.length;
    const occupancyRate = maxPossibleNights > 0 ? (totalNights / maxPossibleNights) * 100 : 0;

    return {
      year,
      totalRevenue,
      totalNights,
      occupancyRate: Math.min(occupancyRate, 100),
      avgDailyRate,
      totalCommission,
      netRevenue: totalRevenue - totalCommission,
      totalBookings: yearlyBookings.length,
      monthlyData: state.getMonthlyRevenue(year),
      propertyData: state.getPropertyRevenue(
        yearStart.toISOString().split('T')[0],
        yearEnd.toISOString().split('T')[0]
      ),
      platformData: state.getPlatformRevenue(
        yearStart.toISOString().split('T')[0],
        yearEnd.toISOString().split('T')[0]
      )
    };
  },

  getLowStockItems: () => {
    const state = get();
    return state.inventoryItems.filter((i) => i.quantity <= i.minStock);
  },

  getPendingTasks: () => {
    const state = get();
    return {
      cleaning: state.cleaningTasks.filter((t) => ['pending', 'in-progress'].includes(t.status)),
      maintenance: state.maintenanceTasks.filter((t) => ['pending', 'in-progress'].includes(t.status))
    };
  },

  updatePlatformCommission: (platform, rate) => set((state) => ({
    platformCommissions: state.platformCommissions.map((c) =>
      c.platform === platform ? { ...c, rate } : c
    )
  })),
}));
