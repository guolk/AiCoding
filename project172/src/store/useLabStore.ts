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
  add: (item: Omit<T, 'id'>) => T;
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
  addStrain: (strain: Omit<Strain, 'id'>) => Strain;
  updateStrain: (id: UUID, updates: Partial<Strain>) => void;
  removeStrain: (id: UUID) => void;

  // ========== 传代记录CRUD ==========
  addPassage: (passage: Omit<Passage, 'id'>) => Passage;
  updatePassage: (id: UUID, updates: Partial<Passage>) => void;
  removePassage: (id: UUID) => void;

  // ========== 表型特征CRUD ==========
  addPhenotype: (phenotype: Omit<Phenotype, 'id'>) => Phenotype;
  updatePhenotype: (id: UUID, updates: Partial<Phenotype>) => void;
  removePhenotype: (id: UUID) => void;

  // ========== 培养基CRUD ==========
  addMedium: (medium: Omit<Medium, 'id'>) => Medium;
  updateMedium: (id: UUID, updates: Partial<Medium>) => void;
  removeMedium: (id: UUID) => void;

  // ========== 培养记录CRUD ==========
  addCulture: (culture: Omit<Culture, 'id'>) => Culture;
  updateCulture: (id: UUID, updates: Partial<Culture>) => void;
  removeCulture: (id: UUID) => void;

  // ========== 实验记录CRUD ==========
  addExperiment: (experiment: Omit<Experiment, 'id'>) => Experiment;
  updateExperiment: (id: UUID, updates: Partial<Experiment>) => void;
  removeExperiment: (id: UUID) => void;

  // ========== 实验重复性记录CRUD ==========
  addRepeat: (repeat: Omit<ExperimentRepeat, 'id'>) => ExperimentRepeat;
  updateRepeat: (id: UUID, updates: Partial<ExperimentRepeat>) => void;
  removeRepeat: (id: UUID) => void;

  // ========== 对照组记录CRUD ==========
  addControl: (control: Omit<Control, 'id'>) => Control;
  updateControl: (id: UUID, updates: Partial<Control>) => void;
  removeControl: (id: UUID) => void;

  // ========== 储存位置CRUD ==========
  addStorage: (storage: Omit<Storage, 'id'>) => Storage;
  updateStorage: (id: UUID, updates: Partial<Storage>) => void;
  removeStorage: (id: UUID) => void;

  // ========== 核查记录CRUD ==========
  addAudit: (audit: Omit<AuditLog, 'id'>) => AuditLog;
  updateAudit: (id: UUID, updates: Partial<AuditLog>) => void;
  removeAudit: (id: UUID) => void;

  // ========== 销毁记录CRUD ==========
  addDisposal: (disposal: Omit<Disposal, 'id'>) => Disposal;
  updateDisposal: (id: UUID, updates: Partial<Disposal>) => void;
  removeDisposal: (id: UUID) => void;

  // ========== 重置数据 ==========
  resetAllData: () => void;
}

// 创建通用CRUD操作函数（未使用，仅作类型参考；实际实现见下方store）
const createCrud = <T extends { id: UUID }>(
  _key: keyof LabState
): CrudActions<T> => ({
  add: (_item: Omit<T, 'id'>) => ({} as T),
  update: (_id: UUID, _updates: Partial<T>) => { /* void */ },
  remove: (_id: UUID) => { /* void */ },
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
      addStrain: (strain) => {
        const newItem = { ...strain, id: generateUUID() } as Strain;
        set((state) => ({ strains: [...state.strains, newItem] }));
        return newItem;
      },
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
      addPassage: (passage) => {
        const newItem = { ...passage, id: generateUUID() } as Passage;
        set((state) => ({ passages: [...state.passages, newItem] }));
        return newItem;
      },
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
      addPhenotype: (phenotype) => {
        const newItem = { ...phenotype, id: generateUUID() } as Phenotype;
        set((state) => ({ phenotypes: [...state.phenotypes, newItem] }));
        return newItem;
      },
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
      addMedium: (medium) => {
        const newItem = { ...medium, id: generateUUID() } as Medium;
        set((state) => ({ media: [...state.media, newItem] }));
        return newItem;
      },
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
      addCulture: (culture) => {
        const newItem = { ...culture, id: generateUUID() } as Culture;
        set((state) => ({ cultures: [...state.cultures, newItem] }));
        return newItem;
      },
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
      addExperiment: (experiment) => {
        const newItem = { ...experiment, id: generateUUID() } as Experiment;
        set((state) => ({ experiments: [...state.experiments, newItem] }));
        return newItem;
      },
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
      addRepeat: (repeat) => {
        const newItem = { ...repeat, id: generateUUID() } as ExperimentRepeat;
        set((state) => ({ repeats: [...state.repeats, newItem] }));
        return newItem;
      },
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
      addControl: (control) => {
        const newItem = { ...control, id: generateUUID() } as Control;
        set((state) => ({ controls: [...state.controls, newItem] }));
        return newItem;
      },
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
      addStorage: (storage) => {
        const newItem = { ...storage, id: generateUUID() } as Storage;
        set((state) => ({ storages: [...state.storages, newItem] }));
        return newItem;
      },
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
      addAudit: (audit) => {
        const newItem = { ...audit, id: generateUUID() } as AuditLog;
        set((state) => ({ audits: [...state.audits, newItem] }));
        return newItem;
      },
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
      addDisposal: (disposal) => {
        const newItem = { ...disposal, id: generateUUID() } as Disposal;
        set((state) => ({ disposals: [...state.disposals, newItem] }));
        return newItem;
      },
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
