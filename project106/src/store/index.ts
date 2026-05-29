import { create } from 'zustand';
import { Plot, PlantingLog, VolunteerTask, ForumPost, SharingPost, Tool, InventoryItem, ExpenseRecord } from '../types';
import { plotAPI, plantingAPI, collaborationAPI, resourcesAPI } from '../api/client';

interface AppState {
  plots: Plot[];
  plantingLogs: PlantingLog[];
  tasks: VolunteerTask[];
  posts: ForumPost[];
  sharingPosts: SharingPost[];
  tools: Tool[];
  inventory: InventoryItem[];
  expenses: ExpenseRecord[];
  currentUser: { id: string; name: string };
  loading: boolean;
  error: string | null;
  selectedPlot: Plot | null;
  selectedPlantingLog: PlantingLog | null;
  fetchAllData: () => Promise<void>;
  setSelectedPlot: (plot: Plot | null) => void;
  setSelectedPlantingLog: (log: PlantingLog | null) => void;
  setPlots: (plots: Plot[]) => void;
  updatePlotLocal: (plot: Plot) => void;
  setPlantingLogs: (logs: PlantingLog[]) => void;
  updatePlantingLogLocal: (log: PlantingLog) => void;
  setTasks: (tasks: VolunteerTask[]) => void;
  updateTaskLocal: (task: VolunteerTask) => void;
  setPosts: (posts: ForumPost[]) => void;
  updatePostLocal: (post: ForumPost) => void;
  setSharingPosts: (posts: SharingPost[]) => void;
  updateSharingPostLocal: (post: SharingPost) => void;
  setTools: (tools: Tool[]) => void;
  updateToolLocal: (tool: Tool) => void;
  setInventory: (items: InventoryItem[]) => void;
  updateInventoryLocal: (item: InventoryItem) => void;
  setExpenses: (expenses: ExpenseRecord[]) => void;
  updateExpenseLocal: (expense: ExpenseRecord) => void;
}

export const useStore = create<AppState>((set, get) => ({
  plots: [],
  plantingLogs: [],
  tasks: [],
  posts: [],
  sharingPosts: [],
  tools: [],
  inventory: [],
  expenses: [],
  currentUser: { id: 'user-1', name: '张三' },
  loading: false,
  error: null,
  selectedPlot: null,
  selectedPlantingLog: null,

  fetchAllData: async () => {
    set({ loading: true, error: null });
    try {
      const [plotsRes, plantingRes, tasksRes, postsRes, sharingRes, toolsRes, inventoryRes, expensesRes] = await Promise.all([
        plotAPI.getAll(),
        plantingAPI.getAll(),
        collaborationAPI.getTasks(),
        collaborationAPI.getPosts(),
        collaborationAPI.getSharingPosts(),
        resourcesAPI.getTools(),
        resourcesAPI.getInventory(),
        resourcesAPI.getExpenses(),
      ]);

      set({
        plots: plotsRes.data || [],
        plantingLogs: plantingRes.data || [],
        tasks: tasksRes.data || [],
        posts: postsRes.data || [],
        sharingPosts: sharingRes.data || [],
        tools: toolsRes.data || [],
        inventory: inventoryRes.data || [],
        expenses: expensesRes.data || [],
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: '加载数据失败' });
    }
  },

  setSelectedPlot: (plot) => set({ selectedPlot: plot }),
  setSelectedPlantingLog: (log) => set({ selectedPlantingLog: log }),
  setPlots: (plots) => set({ plots }),
  updatePlotLocal: (plot) => set((state) => ({
    plots: state.plots.map(p => p.id === plot.id ? plot : p),
    selectedPlot: state.selectedPlot?.id === plot.id ? plot : state.selectedPlot,
  })),
  setPlantingLogs: (logs) => set({ plantingLogs: logs }),
  updatePlantingLogLocal: (log) => set((state) => ({
    plantingLogs: state.plantingLogs.map(l => l.id === log.id ? log : l),
    selectedPlantingLog: state.selectedPlantingLog?.id === log.id ? log : state.selectedPlantingLog,
  })),
  setTasks: (tasks) => set({ tasks }),
  updateTaskLocal: (task) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
  })),
  setPosts: (posts) => set({ posts }),
  updatePostLocal: (post) => set((state) => ({
    posts: state.posts.map(p => p.id === post.id ? post : p),
  })),
  setSharingPosts: (posts) => set({ sharingPosts: posts }),
  updateSharingPostLocal: (post) => set((state) => ({
    sharingPosts: state.sharingPosts.map(p => p.id === post.id ? post : p),
  })),
  setTools: (tools) => set({ tools }),
  updateToolLocal: (tool) => set((state) => ({
    tools: state.tools.map(t => t.id === tool.id ? tool : t),
  })),
  setInventory: (inventory) => set({ inventory }),
  updateInventoryLocal: (item) => set((state) => ({
    inventory: state.inventory.map(i => i.id === item.id ? item : i),
  })),
  setExpenses: (expenses) => set({ expenses }),
  updateExpenseLocal: (expense) => set((state) => ({
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
  })),
}));
