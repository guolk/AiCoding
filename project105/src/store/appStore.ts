import { create } from 'zustand';
import { LegoSet, InventoryItem, Project, ProjectStep, BOMItem, Work, WorkPhoto, RecentActivity } from '../types';
import { MOCK_SETS, MOCK_INVENTORY, MOCK_PROJECTS, MOCK_PROJECT_STEPS, MOCK_BOM_ITEMS, MOCK_WORKS, MOCK_WORK_PHOTOS, MOCK_RECENT_ACTIVITIES } from '../utils/mockData';

interface AppState {
  sets: LegoSet[];
  inventory: InventoryItem[];
  projects: Project[];
  projectSteps: ProjectStep[];
  bomItems: BOMItem[];
  works: Work[];
  workPhotos: WorkPhoto[];
  recentActivities: RecentActivity[];
  loading: boolean;
  sidebarCollapsed: boolean;
  searchQuery: string;
  activeView: 'grid' | 'list';

  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: 'grid' | 'list') => void;

  addSet: (set: Omit<LegoSet, 'id' | 'created_at' | 'updated_at'>) => void;
  updateSet: (id: string, updates: Partial<LegoSet>) => void;
  deleteSet: (id: string) => void;
  getSetById: (id: string) => LegoSet | undefined;

  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectSteps: (projectId: string) => ProjectStep[];
  updateProjectStep: (stepId: string, updates: Partial<ProjectStep>) => void;
  getBOMItems: (projectId: string) => BOMItem[];

  addWork: (work: Omit<Work, 'id' | 'created_at' | 'share_token'>) => void;
  updateWork: (id: string, updates: Partial<Work>) => void;
  deleteWork: (id: string) => void;
  getWorkById: (id: string) => Work | undefined;
  getWorkPhotos: (workId: string) => WorkPhoto[];

  getMissingParts: (projectId: string) => { part_num: string; part_name: string; color_name: string; color_rgb: string; required: number; available: number; missing: number }[];
  getAnalytics: () => {
    totalSets: number;
    totalParts: number;
    totalValue: number;
    totalHours: number;
    completedProjects: number;
    setsByStatus: Record<string, number>;
    setsByTheme: Record<string, number>;
    inventoryBySource: Record<string, number>;
  };
}

const generateId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export const useAppStore = create<AppState>((set, get) => ({
  sets: MOCK_SETS,
  inventory: MOCK_INVENTORY,
  projects: MOCK_PROJECTS,
  projectSteps: MOCK_PROJECT_STEPS,
  bomItems: MOCK_BOM_ITEMS,
  works: MOCK_WORKS,
  workPhotos: MOCK_WORK_PHOTOS,
  recentActivities: MOCK_RECENT_ACTIVITIES,
  loading: false,
  sidebarCollapsed: false,
  searchQuery: '',
  activeView: 'grid',

  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),

  addSet: (newSet) =>
    set((state) => ({
      sets: [
        ...state.sets,
        { ...newSet, id: generateId(), created_at: now(), updated_at: now() },
      ],
    })),

  updateSet: (id, updates) =>
    set((state) => ({
      sets: state.sets.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: now() } : s
      ),
    })),

  deleteSet: (id) =>
    set((state) => ({
      sets: state.sets.filter((s) => s.id !== id),
    })),

  getSetById: (id) => get().sets.find((s) => s.id === id),

  addInventoryItem: (newItem) =>
    set((state) => ({
      inventory: [
        ...state.inventory,
        { ...newItem, id: generateId(), created_at: now(), updated_at: now() },
      ],
    })),

  updateInventoryItem: (id, updates) =>
    set((state) => ({
      inventory: state.inventory.map((i) =>
        i.id === id ? { ...i, ...updates, updated_at: now() } : i
      ),
    })),

  deleteInventoryItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((i) => i.id !== id),
    })),

  addProject: (newProject) =>
    set((state) => ({
      projects: [
        ...state.projects,
        { ...newProject, id: generateId(), created_at: now(), updated_at: now() },
      ],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: now() } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      projectSteps: state.projectSteps.filter((s) => s.project_id !== id),
      bomItems: state.bomItems.filter((b) => b.project_id !== id),
    })),

  getProjectById: (id) => get().projects.find((p) => p.id === id),

  getProjectSteps: (projectId) =>
    get()
      .projectSteps.filter((s) => s.project_id === projectId)
      .sort((a, b) => a.step_number - b.step_number),

  updateProjectStep: (stepId, updates) =>
    set((state) => ({
      projectSteps: state.projectSteps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    })),

  getBOMItems: (projectId) =>
    get().bomItems.filter((b) => b.project_id === projectId),

  addWork: (newWork) =>
    set((state) => ({
      works: [
        ...state.works,
        { ...newWork, id: generateId(), created_at: now(), share_token: generateId() },
      ],
    })),

  updateWork: (id, updates) =>
    set((state) => ({
      works: state.works.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    })),

  deleteWork: (id) =>
    set((state) => ({
      works: state.works.filter((w) => w.id !== id),
      workPhotos: state.workPhotos.filter((p) => p.work_id !== id),
    })),

  getWorkById: (id) => get().works.find((w) => w.id === id),

  getWorkPhotos: (workId) =>
    get()
      .workPhotos.filter((p) => p.work_id === workId)
      .sort((a, b) => a.display_order - b.display_order),

  getMissingParts: (projectId) => {
    const bomItems = get().bomItems.filter((b) => b.project_id === projectId);
    return bomItems
      .map((item) => ({
        part_num: item.part_num,
        part_name: item.part_name,
        color_name: item.color_name,
        color_rgb: item.color_rgb,
        required: item.required_quantity,
        available: item.available_quantity,
        missing: Math.max(0, item.required_quantity - item.available_quantity),
      }))
      .filter((item) => item.missing > 0);
  },

  getAnalytics: () => {
    const { sets, inventory, projects } = get();
    
    const setsByStatus: Record<string, number> = {};
    const setsByTheme: Record<string, number> = {};
    const inventoryBySource: Record<string, number> = {};

    let totalParts = 0;
    let totalValue = 0;
    let totalHours = 0;
    let completedProjects = 0;

    sets.forEach((s) => {
      setsByStatus[s.status] = (setsByStatus[s.status] || 0) + 1;
      setsByTheme[s.theme] = (setsByTheme[s.theme] || 0) + 1;
      totalParts += s.num_parts;
      if (s.purchase_price) totalValue += s.purchase_price;
    });

    inventory.forEach((i) => {
      inventoryBySource[i.source] = (inventoryBySource[i.source] || 0) + i.quantity;
    });

    projects.forEach((p) => {
      if (p.status === 'completed') completedProjects++;
      totalHours += p.total_hours;
    });

    return {
      totalSets: sets.length,
      totalParts,
      totalValue,
      totalHours,
      completedProjects,
      setsByStatus,
      setsByTheme,
      inventoryBySource,
    };
  },
}));
