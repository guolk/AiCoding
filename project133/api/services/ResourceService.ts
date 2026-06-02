import { getAll, getById, create, update, remove, query } from '../db/jsonDb.js';
import type { Resource, ResourceType } from '../../shared/types.js';

export const ResourceService = {
  getAll(type?: ResourceType): Resource[] {
    if (type) {
      return query<Resource>('resources', (r) => r.type === type);
    }
    return getAll<Resource>('resources');
  },

  getById(id: number): Resource | undefined {
    return getById<Resource>('resources', id);
  },

  create(resource: Omit<Resource, 'id'>): Resource {
    return create<Resource>('resources', resource);
  },

  update(id: number, updates: Partial<Resource>): Resource | undefined {
    return update<Resource>('resources', id, updates);
  },

  delete(id: number): boolean {
    return remove('resources', id);
  },

  getEquipmentStatus() {
    const equipment = query<Resource>('resources', (r) => r.type === 'equipment');
    return {
      total: equipment.length,
      normal: equipment.filter(e => e.status === '正常').length,
      maintenance: equipment.filter(e => e.status === '维护中').length
    };
  }
};
