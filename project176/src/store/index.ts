import { create } from "zustand";
import type {
  DevLogEntry,
  GameVersion,
  TestPlan,
  BugReport,
  BetaTestSession,
  PlatformResearch,
  PricingStrategy,
  MarketingCampaign,
  ProjectSettings,
} from "@/types";
import { initialMockData } from "./mockData";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

interface GameDevStore {
  projectSettings: ProjectSettings;
  devLogs: DevLogEntry[];
  versions: GameVersion[];
  testPlans: TestPlan[];
  bugs: BugReport[];
  betaSessions: BetaTestSession[];
  platforms: PlatformResearch[];
  pricingStrategies: PricingStrategy[];
  campaigns: MarketingCampaign[];

  setProjectSettings: (s: ProjectSettings) => void;
  addDevLog: (log: DevLogEntry) => void;
  updateDevLog: (log: DevLogEntry) => void;
  deleteDevLog: (id: string) => void;
  addVersion: (v: GameVersion) => void;
  updateVersion: (v: GameVersion) => void;
  deleteVersion: (id: string) => void;
  addTestPlan: (tp: TestPlan) => void;
  updateTestPlan: (tp: TestPlan) => void;
  deleteTestPlan: (id: string) => void;
  addBug: (b: BugReport) => void;
  updateBug: (b: BugReport) => void;
  deleteBug: (id: string) => void;
  addBetaSession: (bs: BetaTestSession) => void;
  updateBetaSession: (bs: BetaTestSession) => void;
  addPlatform: (p: PlatformResearch) => void;
  updatePlatform: (p: PlatformResearch) => void;
  deletePlatform: (id: string) => void;
  addPricingStrategy: (ps: PricingStrategy) => void;
  updatePricingStrategy: (ps: PricingStrategy) => void;
  addCampaign: (c: MarketingCampaign) => void;
  updateCampaign: (c: MarketingCampaign) => void;
  deleteCampaign: (id: string) => void;
}

export const useStore = create<GameDevStore>((set) => ({
  projectSettings: loadFromStorage("gamedev_project_settings", initialMockData.projectSettings),
  devLogs: loadFromStorage("gamedev_dev_logs", initialMockData.devLogs),
  versions: loadFromStorage("gamedev_versions", initialMockData.versions),
  testPlans: loadFromStorage("gamedev_test_plans", initialMockData.testPlans),
  bugs: loadFromStorage("gamedev_bugs", initialMockData.bugs),
  betaSessions: loadFromStorage("gamedev_beta_sessions", initialMockData.betaSessions),
  platforms: loadFromStorage("gamedev_platform_research", initialMockData.platforms),
  pricingStrategies: loadFromStorage("gamedev_pricing_strategies", initialMockData.pricingStrategies),
  campaigns: loadFromStorage("gamedev_marketing_campaigns", initialMockData.campaigns),

  setProjectSettings: (s) => {
    saveToStorage("gamedev_project_settings", s);
    set({ projectSettings: s });
  },

  addDevLog: (log) =>
    set((state) => {
      const updated = [log, ...state.devLogs];
      saveToStorage("gamedev_dev_logs", updated);
      return { devLogs: updated };
    }),
  updateDevLog: (log) =>
    set((state) => {
      const updated = state.devLogs.map((l) => (l.id === log.id ? log : l));
      saveToStorage("gamedev_dev_logs", updated);
      return { devLogs: updated };
    }),
  deleteDevLog: (id) =>
    set((state) => {
      const updated = state.devLogs.filter((l) => l.id !== id);
      saveToStorage("gamedev_dev_logs", updated);
      return { devLogs: updated };
    }),

  addVersion: (v) =>
    set((state) => {
      const updated = [v, ...state.versions];
      saveToStorage("gamedev_versions", updated);
      return { versions: updated };
    }),
  updateVersion: (v) =>
    set((state) => {
      const updated = state.versions.map((ver) => (ver.id === v.id ? v : ver));
      saveToStorage("gamedev_versions", updated);
      return { versions: updated };
    }),
  deleteVersion: (id) =>
    set((state) => {
      const updated = state.versions.filter((v) => v.id !== id);
      saveToStorage("gamedev_versions", updated);
      return { versions: updated };
    }),

  addTestPlan: (tp) =>
    set((state) => {
      const updated = [tp, ...state.testPlans];
      saveToStorage("gamedev_test_plans", updated);
      return { testPlans: updated };
    }),
  updateTestPlan: (tp) =>
    set((state) => {
      const updated = state.testPlans.map((t) => (t.id === tp.id ? tp : t));
      saveToStorage("gamedev_test_plans", updated);
      return { testPlans: updated };
    }),
  deleteTestPlan: (id) =>
    set((state) => {
      const updated = state.testPlans.filter((t) => t.id !== id);
      saveToStorage("gamedev_test_plans", updated);
      return { testPlans: updated };
    }),

  addBug: (b) =>
    set((state) => {
      const updated = [b, ...state.bugs];
      saveToStorage("gamedev_bugs", updated);
      return { bugs: updated };
    }),
  updateBug: (b) =>
    set((state) => {
      const updated = state.bugs.map((bug) => (bug.id === b.id ? b : bug));
      saveToStorage("gamedev_bugs", updated);
      return { bugs: updated };
    }),
  deleteBug: (id) =>
    set((state) => {
      const updated = state.bugs.filter((b) => b.id !== id);
      saveToStorage("gamedev_bugs", updated);
      return { bugs: updated };
    }),

  addBetaSession: (bs) =>
    set((state) => {
      const updated = [bs, ...state.betaSessions];
      saveToStorage("gamedev_beta_sessions", updated);
      return { betaSessions: updated };
    }),
  updateBetaSession: (bs) =>
    set((state) => {
      const updated = state.betaSessions.map((s) => (s.id === bs.id ? bs : s));
      saveToStorage("gamedev_beta_sessions", updated);
      return { betaSessions: updated };
    }),

  addPlatform: (p) =>
    set((state) => {
      const updated = [p, ...state.platforms];
      saveToStorage("gamedev_platform_research", updated);
      return { platforms: updated };
    }),
  updatePlatform: (p) =>
    set((state) => {
      const updated = state.platforms.map((pl) => (pl.id === p.id ? p : pl));
      saveToStorage("gamedev_platform_research", updated);
      return { platforms: updated };
    }),
  deletePlatform: (id) =>
    set((state) => {
      const updated = state.platforms.filter((p) => p.id !== id);
      saveToStorage("gamedev_platform_research", updated);
      return { platforms: updated };
    }),

  addPricingStrategy: (ps) =>
    set((state) => {
      const updated = [ps, ...state.pricingStrategies];
      saveToStorage("gamedev_pricing_strategies", updated);
      return { pricingStrategies: updated };
    }),
  updatePricingStrategy: (ps) =>
    set((state) => {
      const updated = state.pricingStrategies.map((s) => (s.id === ps.id ? ps : s));
      saveToStorage("gamedev_pricing_strategies", updated);
      return { pricingStrategies: updated };
    }),

  addCampaign: (c) =>
    set((state) => {
      const updated = [c, ...state.campaigns];
      saveToStorage("gamedev_marketing_campaigns", updated);
      return { campaigns: updated };
    }),
  updateCampaign: (c) =>
    set((state) => {
      const updated = state.campaigns.map((camp) => (camp.id === c.id ? c : camp));
      saveToStorage("gamedev_marketing_campaigns", updated);
      return { campaigns: updated };
    }),
  deleteCampaign: (id) =>
    set((state) => {
      const updated = state.campaigns.filter((c) => c.id !== id);
      saveToStorage("gamedev_marketing_campaigns", updated);
      return { campaigns: updated };
    }),
}));
