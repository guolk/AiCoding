import { getAll, getById, create, update, remove } from '../db/jsonDb.js';
import type { Archive, Schedule } from '../../shared/types.js';

export const ArchiveService = {
  getAll(): Archive[] {
    return getAll<Archive>('archives').sort((a, b) => 
      (b.year * 10 + (b.semester === '秋季学期' ? 2 : 1)) - (a.year * 10 + (a.semester === '秋季学期' ? 2 : 1))
    );
  },

  getById(id: number): Archive | undefined {
    return getById<Archive>('archives', id);
  },

  create(archive: Omit<Archive, 'id'>): Archive {
    return create<Archive>('archives', archive);
  },

  update(id: number, updates: Partial<Archive>): Archive | undefined {
    return update<Archive>('archives', id, updates);
  },

  delete(id: number): boolean {
    return remove('archives', id);
  },

  getSchedule(date?: string): Schedule[] {
    let schedules = getAll<Schedule>('schedules');
    if (date) {
      schedules = schedules.filter(s => s.date === date);
    }
    return schedules.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }
};
