// 微生物菌株管理系统 - 全局状态管理Store
// 使用Zustand进行状态管理，配合persist中间件实现localStorage持久化

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Strain,
  Passage,
  Phenotype,
  Medium,
  Culture,
  Experiment,
  ExperimentRepeat,
  Control,
  Storage,
  AuditLog,
  Disposal,
  UUID,
} from '../types';
import {
  seedStrains,
  seedPassages,
  seedPhenotypes,
  seedMedia,
  seedCultures,
  seedExperiments,
  seedRepeats,
  seedControls,
  seedStorages,
  seedAudits,
  seedDisposals,
} from '../mock/seedData';

// 简易UUID生成器（新增记录时使用）
const generateUUID = (): UUID => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 通用CRUD操作工具类型
type CrudActions<T extends { id: UUID }> = {
  add: (item: Omit<T, 'id'>) => void;
  update: (id: UUID, updates: Partial<T>) => void;
  remove: (id: UUID) => void;
};

// 定义完整的Store状态类型
interface LabState {
  // ========== 状态数据 ==========
  strains: Strain[];
  passages: Passage[];
  phenotypes: Phenotype[];
  media: Medium[];
  cultures: Culture[];
  experiments: Experiment[];
  repeats: ExperimentRepeat[];
  controls: Control[];
  storages: Storage[];
  audits: AuditLog[];
  disposals: Disposal[];

  // ========== 菌株CRUD ==========
  addStrain: (strain: Omit<Strain, 'id'>) => void;
  updateStrain: (id: UUID, updates: Partial<Strain>) => void;
  removeStrain: (id: UUID) => void;

  // ========== 传代记录CRUD ==========
  addPassage: (passage: Omit<Passage, 'id'>) => void;
  updatePassage: (id: UUID, updates: Partial<Passage>) => void;
  removePassage: (id: UUID) => void;

  // ========== 表型特征CRUD ==========
  addPhenotype: (phenotype: Omit<Phenotype, 'id'>) => void;
  updatePhenotype: (id: UUID, updates: Partial<Phenotype>) => void;
  removePhenotype: (id: UUID) => void;

  // ========== 培养基CRUD ==========
  addMedium: (medium: Omit<Medium, 'id'>) => void;
  updateMedium: (id: UUID, updates: Partial<Medium>) => void;
  removeMedium: (id: UUID) => void;

  // ========== 培养记录CRUD ==========
  addCulture: (culture: Omit<Culture, 'id'>) => void;
  updateCulture: (id: UUID, updates: Partial<Culture>) => void;
  removeCulture: (id: UUID) => void;

  // ========== 实验记录CRUD ==========
  addExperiment: (experiment: Omit<Experiment, 'id'>) => void;
  updateExperiment: (id: UUID, updates: Partial<Experiment>) => void;
  removeExperiment: (id: UUID) => void;

  // ========== 实验重复性记录CRUD ==========
  addRepeat: (repeat: Omit<ExperimentRepeat, 'id'>) => void;
  updateRepeat: (id: UUID, updates: Partial<ExperimentRepeat>) => void;
  removeRepeat: (id: UUID) => void;

  // ========== 对照组记录CRUD ==========
  addControl: (control: Omit<Control, 'id'>) => void;
  updateControl: (id: UUID, updates: Partial<Control>) => void;
  removeControl: (id: UUID) => void;

  // ========== 储存位置CRUD ==========
  addStorage: (storage: Omit<Storage, 'id'>) => void;
  updateStorage: (id: UUID, updates: Partial<Storage>) => void;
  removeStorage: (id: UUID) => void;

  // ========== 核查记录CRUD ==========
  addAudit: (audit: Omit<AuditLog, 'id'>) => void;
  updateAudit: (id: UUID, updates: Partial<AuditLog>) => void;
  removeAudit: (id: UUID) => void;

  // ========== 销毁记录CRUD ==========
  addDisposal: (disposal: Omit<Disposal, 'id'>) => void;
  updateDisposal: (id: UUID, updates: Partial<Disposal>) => void;
  removeDisposal: (id: UUID) => void;

  // ========== 重置数据 ==========
  resetAllData: () => void;
}

// 创建通用CRUD操作函数
const createCrud = <T extends { id: UUID }>(
  key: keyof LabState
): CrudActions<T> => ({
  add: (item: Omit<T, 'id'>) => {
    // 此函数在set内部实际执行，这里仅作类型声明
  },
  update: (id: UUID, updates: Partial<T>) => {
    // 此函数在set内部实际执行
  },
  remove: (id: UUID) => {
    // 此函数在set内部实际执行
  },
});

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      // ========== 初始化状态（从种子数据加载） ==========
      strains: seedStrains,
      passages: seedPassages,
      phenotypes: seedPhenotypes,
      media: seedMedia,
      cultures: seedCultures,
      experiments: seedExperiments,
      repeats: seedRepeats,
      controls: seedControls,
      storages: seedStorages,
      audits: seedAudits,
      disposals: seedDisposals,

      // ========== 菌株CRUD操作 ==========
      addStrain: (strain) =>
        set((state) => ({
          strains: [...state.strains, { ...strain, id: generateUUID() } as Strain],
        })),
      updateStrain: (id, updates) =>
        set((state) => ({
          strains: state.strains.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      removeStrain: (id) =>
        set((state) => ({
          strains: state.strains.filter((s) => s.id !== id),
        })),

      // ========== 传代记录CRUD操作 ==========
      addPassage: (passage) =>
        set((state) => ({
          passages: [...state.passages, { ...passage, id: generateUUID() } as Passage],
        })),
      updatePassage: (id, updates) =>
        set((state) => ({
          passages: state.passages.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePassage: (id) =>
        set((state) => ({
          passages: state.passages.filter((p) => p.id !== id),
        })),

      // ========== 表型特征CRUD操作 ==========
      addPhenotype: (phenotype) =>
        set((state) => ({
          phenotypes: [...state.phenotypes, { ...phenotype, id: generateUUID() } as Phenotype],
        })),
      updatePhenotype: (id, updates) =>
        set((state) => ({
          phenotypes: state.phenotypes.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removePhenotype: (id) =>
        set((state) => ({
          phenotypes: state.phenotypes.filter((p) => p.id !== id),
        })),

      // ========== 培养基CRUD操作 ==========
      addMedium: (medium) =>
        set((state) => ({
          media: [...state.media, { ...medium, id: generateUUID() } as Medium],
        })),
      updateMedium: (id, updates) =>
        set((state) => ({
          media: state.media.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMedium: (id) =>
        set((state) => ({
          media: state.media.filter((m) => m.id !== id),
        })),

      // ========== 培养记录CRUD操作 ==========
      addCulture: (culture) =>
        set((state) => ({
          cultures: [...state.cultures, { ...culture, id: generateUUID() } as Culture],
        })),
      updateCulture: (id, updates) =>
        set((state) => ({
          cultures: state.cultures.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeCulture: (id) =>
        set((state) => ({
          cultures: state.cultures.filter((c) => c.id !== id),
        })),

      // ========== 实验记录CRUD操作 ==========
      addExperiment: (experiment) =>
        set((state) => ({
          experiments: [...state.experiments, { ...experiment, id: generateUUID() } as Experiment],
        })),
      updateExperiment: (id, updates) =>
        set((state) => ({
          experiments: state.experiments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      removeExperiment: (id) =>
        set((state) => ({
          experiments: state.experiments.filter((e) => e.id !== id),
        })),

      // ========== 实验重复性记录CRUD操作 ==========
      addRepeat: (repeat) =>
        set((state) => ({
          repeats: [...state.repeats, { ...repeat, id: generateUUID() } as ExperimentRepeat],
        })),
      updateRepeat: (id, updates) =>
        set((state) => ({
          repeats: state.repeats.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),
      removeRepeat: (id) =>
        set((state) => ({
          repeats: state.repeats.filter((r) => r.id !== id),
        })),

      // ========== 对照组记录CRUD操作 ==========
      addControl: (control) =>
        set((state) => ({
          controls: [...state.controls, { ...control, id: generateUUID() } as Control],
        })),
      updateControl: (id, updates) =>
        set((state) => ({
          controls: state.controls.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      removeControl: (id) =>
        set((state) => ({
          controls: state.controls.filter((c) => c.id !== id),
        })),

      // ========== 储存位置CRUD操作 ==========
      addStorage: (storage) =>
        set((state) => ({
          storages: [...state.storages, { ...storage, id: generateUUID() } as Storage],
        })),
      updateStorage: (id, updates) =>
        set((state) => ({
          storages: state.storages.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      removeStorage: (id) =>
        set((state) => ({
          storages: state.storages.filter((s) => s.id !== id),
        })),

      // ========== 核查记录CRUD操作 ==========
      addAudit: (audit) =>
        set((state) => ({
          audits: [...state.audits, { ...audit, id: generateUUID() } as AuditLog],
        })),
      updateAudit: (id, updates) =>
        set((state) => ({
          audits: state.audits.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),
      removeAudit: (id) =>
        set((state) => ({
          audits: state.audits.filter((a) => a.id !== id),
        })),

      // ========== 销毁记录CRUD操作 ==========
      addDisposal: (disposal) =>
        set((state) => ({
          disposals: [...state.disposals, { ...disposal, id: generateUUID() } as Disposal],
        })),
      updateDisposal: (id, updates) =>
        set((state) => ({
          disposals: state.disposals.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          ),
        })),
      removeDisposal: (id) =>
        set((state) => ({
          disposals: state.disposals.filter((d) => d.id !== id),
        })),

      // ========== 重置所有数据为初始种子数据 ==========
      resetAllData: () =>
        set({
          strains: seedStrains,
          passages: seedPassages,
          phenotypes: seedPhenotypes,
          media: seedMedia,
          cultures: seedCultures,
          experiments: seedExperiments,
          repeats: seedRepeats,
          controls: seedControls,
          storages: seedStorages,
          audits: seedAudits,
          disposals: seedDisposals,
        }),
    }),
    {
      // localStorage持久化配置
      name: 'lab-storage',
      // 可选：配置只持久化部分字段，这里持久化全部
      // partialize: (state) => ({ /* 选择要持久化的字段 */ }),
      version: 1, // 数据版本号，用于未来迁移
    }
  )
);
