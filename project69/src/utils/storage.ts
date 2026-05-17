import {
  Member,
  Rehearsal,
  Song,
  RehearsalRecord,
  Performance,
  Equipment,
  BorrowRecord,
  SharedResource,
  Recording,
} from '../types';

const STORAGE_KEYS = {
  MEMBERS: 'band_members',
  REHEARSALS: 'band_rehearsals',
  SONGS: 'band_songs',
  REHEARSAL_RECORDS: 'band_rehearsal_records',
  PERFORMANCES: 'band_performances',
  EQUIPMENT: 'band_equipment',
  BORROW_RECORDS: 'band_borrow_records',
  SHARED_RESOURCES: 'band_shared_resources',
  RECORDINGS: 'band_recordings',
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return defaultValue;
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const memberStorage = {
  getAll: (): Member[] => getFromStorage(STORAGE_KEYS.MEMBERS, []),
  save: (members: Member[]) => saveToStorage(STORAGE_KEYS.MEMBERS, members),
  add: (member: Member) => {
    const members = memberStorage.getAll();
    members.push(member);
    memberStorage.save(members);
    return member;
  },
  update: (id: string, data: Partial<Member>) => {
    const members = memberStorage.getAll();
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index] = { ...members[index], ...data };
      memberStorage.save(members);
      return members[index];
    }
    return null;
  },
  delete: (id: string) => {
    const members = memberStorage.getAll().filter(m => m.id !== id);
    memberStorage.save(members);
  },
  getById: (id: string): Member | undefined => {
    return memberStorage.getAll().find(m => m.id === id);
  },
};

export const rehearsalStorage = {
  getAll: (): Rehearsal[] => getFromStorage(STORAGE_KEYS.REHEARSALS, []),
  save: (rehearsals: Rehearsal[]) => saveToStorage(STORAGE_KEYS.REHEARSALS, rehearsals),
  add: (rehearsal: Rehearsal) => {
    const rehearsals = rehearsalStorage.getAll();
    rehearsals.push(rehearsal);
    rehearsalStorage.save(rehearsals);
    return rehearsal;
  },
  update: (id: string, data: Partial<Rehearsal>) => {
    const rehearsals = rehearsalStorage.getAll();
    const index = rehearsals.findIndex(r => r.id === id);
    if (index !== -1) {
      rehearsals[index] = { ...rehearsals[index], ...data };
      rehearsalStorage.save(rehearsals);
      return rehearsals[index];
    }
    return null;
  },
  delete: (id: string) => {
    const rehearsals = rehearsalStorage.getAll().filter(r => r.id !== id);
    rehearsalStorage.save(rehearsals);
  },
  getById: (id: string): Rehearsal | undefined => {
    return rehearsalStorage.getAll().find(r => r.id === id);
  },
};

export const songStorage = {
  getAll: (): Song[] => getFromStorage(STORAGE_KEYS.SONGS, []),
  save: (songs: Song[]) => saveToStorage(STORAGE_KEYS.SONGS, songs),
  add: (song: Song) => {
    const songs = songStorage.getAll();
    songs.push(song);
    songStorage.save(songs);
    return song;
  },
  update: (id: string, data: Partial<Song>) => {
    const songs = songStorage.getAll();
    const index = songs.findIndex(s => s.id === id);
    if (index !== -1) {
      songs[index] = { ...songs[index], ...data, updatedAt: new Date().toISOString() };
      songStorage.save(songs);
      return songs[index];
    }
    return null;
  },
  delete: (id: string) => {
    const songs = songStorage.getAll().filter(s => s.id !== id);
    songStorage.save(songs);
  },
  getById: (id: string): Song | undefined => {
    return songStorage.getAll().find(s => s.id === id);
  },
};

export const rehearsalRecordStorage = {
  getAll: (): RehearsalRecord[] => getFromStorage(STORAGE_KEYS.REHEARSAL_RECORDS, []),
  save: (records: RehearsalRecord[]) => saveToStorage(STORAGE_KEYS.REHEARSAL_RECORDS, records),
  add: (record: RehearsalRecord) => {
    const records = rehearsalRecordStorage.getAll();
    records.push(record);
    rehearsalRecordStorage.save(records);
    return record;
  },
  update: (id: string, data: Partial<RehearsalRecord>) => {
    const records = rehearsalRecordStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...data };
      rehearsalRecordStorage.save(records);
      return records[index];
    }
    return null;
  },
  delete: (id: string) => {
    const records = rehearsalRecordStorage.getAll().filter(r => r.id !== id);
    rehearsalRecordStorage.save(records);
  },
  getById: (id: string): RehearsalRecord | undefined => {
    return rehearsalRecordStorage.getAll().find(r => r.id === id);
  },
};

export const performanceStorage = {
  getAll: (): Performance[] => getFromStorage(STORAGE_KEYS.PERFORMANCES, []),
  save: (performances: Performance[]) => saveToStorage(STORAGE_KEYS.PERFORMANCES, performances),
  add: (performance: Performance) => {
    const performances = performanceStorage.getAll();
    performances.push(performance);
    performanceStorage.save(performances);
    return performance;
  },
  update: (id: string, data: Partial<Performance>) => {
    const performances = performanceStorage.getAll();
    const index = performances.findIndex(p => p.id === id);
    if (index !== -1) {
      performances[index] = { ...performances[index], ...data };
      performanceStorage.save(performances);
      return performances[index];
    }
    return null;
  },
  delete: (id: string) => {
    const performances = performanceStorage.getAll().filter(p => p.id !== id);
    performanceStorage.save(performances);
  },
  getById: (id: string): Performance | undefined => {
    return performanceStorage.getAll().find(p => p.id === id);
  },
};

export const equipmentStorage = {
  getAll: (): Equipment[] => getFromStorage(STORAGE_KEYS.EQUIPMENT, []),
  save: (equipment: Equipment[]) => saveToStorage(STORAGE_KEYS.EQUIPMENT, equipment),
  add: (item: Equipment) => {
    const equipment = equipmentStorage.getAll();
    equipment.push(item);
    equipmentStorage.save(equipment);
    return item;
  },
  update: (id: string, data: Partial<Equipment>) => {
    const equipment = equipmentStorage.getAll();
    const index = equipment.findIndex(e => e.id === id);
    if (index !== -1) {
      equipment[index] = { ...equipment[index], ...data };
      equipmentStorage.save(equipment);
      return equipment[index];
    }
    return null;
  },
  delete: (id: string) => {
    const equipment = equipmentStorage.getAll().filter(e => e.id !== id);
    equipmentStorage.save(equipment);
  },
  getById: (id: string): Equipment | undefined => {
    return equipmentStorage.getAll().find(e => e.id === id);
  },
};

export const borrowRecordStorage = {
  getAll: (): BorrowRecord[] => getFromStorage(STORAGE_KEYS.BORROW_RECORDS, []),
  save: (records: BorrowRecord[]) => saveToStorage(STORAGE_KEYS.BORROW_RECORDS, records),
  add: (record: BorrowRecord) => {
    const records = borrowRecordStorage.getAll();
    records.push(record);
    borrowRecordStorage.save(records);
    return record;
  },
  update: (id: string, data: Partial<BorrowRecord>) => {
    const records = borrowRecordStorage.getAll();
    const index = records.findIndex(r => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...data };
      borrowRecordStorage.save(records);
      return records[index];
    }
    return null;
  },
  delete: (id: string) => {
    const records = borrowRecordStorage.getAll().filter(r => r.id !== id);
    borrowRecordStorage.save(records);
  },
  getById: (id: string): BorrowRecord | undefined => {
    return borrowRecordStorage.getAll().find(r => r.id === id);
  },
};

export const recordingStorage = {
  getAll: (): Recording[] => getFromStorage(STORAGE_KEYS.RECORDINGS, []),
  save: (recordings: Recording[]) => saveToStorage(STORAGE_KEYS.RECORDINGS, recordings),
  add: (recording: Recording) => {
    const recordings = recordingStorage.getAll();
    recordings.push(recording);
    recordingStorage.save(recordings);
    return recording;
  },
  update: (id: string, data: Partial<Recording>) => {
    const recordings = recordingStorage.getAll();
    const index = recordings.findIndex(r => r.id === id);
    if (index !== -1) {
      recordings[index] = { ...recordings[index], ...data };
      recordingStorage.save(recordings);
      return recordings[index];
    }
    return null;
  },
  delete: (id: string) => {
    const recordings = recordingStorage.getAll().filter(r => r.id !== id);
    recordingStorage.save(recordings);
  },
  getById: (id: string): Recording | undefined => {
    return recordingStorage.getAll().find(r => r.id === id);
  },
};

export const sharedResourceStorage = {
  getAll: (): SharedResource[] => getFromStorage(STORAGE_KEYS.SHARED_RESOURCES, []),
  save: (resources: SharedResource[]) => saveToStorage(STORAGE_KEYS.SHARED_RESOURCES, resources),
  add: (resource: SharedResource) => {
    const resources = sharedResourceStorage.getAll();
    resources.push(resource);
    sharedResourceStorage.save(resources);
    return resource;
  },
  update: (id: string, data: Partial<SharedResource>) => {
    const resources = sharedResourceStorage.getAll();
    const index = resources.findIndex(r => r.id === id);
    if (index !== -1) {
      resources[index] = { ...resources[index], ...data };
      sharedResourceStorage.save(resources);
      return resources[index];
    }
    return null;
  },
  delete: (id: string) => {
    const resources = sharedResourceStorage.getAll().filter(r => r.id !== id);
    sharedResourceStorage.save(resources);
  },
  getById: (id: string): SharedResource | undefined => {
    return sharedResourceStorage.getAll().find(r => r.id === id);
  },
};
