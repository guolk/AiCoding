import { openDB, IDBPDatabase } from 'idb';
import type {
  Project,
  Observation,
  SpatialAnalysis,
  PedestrianStudy,
  Comparison,
  CaseStudy,
} from '../../shared/types';

const DB_NAME = 'urban-observer-db';
const DB_VERSION = 1;

let db: IDBPDatabase | null = null;

export const initDB = async (): Promise<IDBPDatabase> => {
  if (db) return db;

  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('createdAt', 'createdAt');
        projectStore.createIndex('updatedAt', 'updatedAt');
      }

      if (!db.objectStoreNames.contains('observations')) {
        const obsStore = db.createObjectStore('observations', { keyPath: 'id' });
        obsStore.createIndex('projectId', 'projectId');
        obsStore.createIndex('observationTime', 'observationTime');
        obsStore.createIndex('season', 'season');
      }

      if (!db.objectStoreNames.contains('analyses')) {
        const analysisStore = db.createObjectStore('analyses', { keyPath: 'id' });
        analysisStore.createIndex('projectId', 'projectId');
        analysisStore.createIndex('location', 'location');
      }

      if (!db.objectStoreNames.contains('pedestrianStudies')) {
        const pedStore = db.createObjectStore('pedestrianStudies', { keyPath: 'id' });
        pedStore.createIndex('projectId', 'projectId');
        pedStore.createIndex('studyDate', 'studyDate');
      }

      if (!db.objectStoreNames.contains('comparisons')) {
        const compStore = db.createObjectStore('comparisons', { keyPath: 'id' });
        compStore.createIndex('projectId', 'projectId');
      }

      if (!db.objectStoreNames.contains('caseStudies')) {
        const caseStore = db.createObjectStore('caseStudies', { keyPath: 'id' });
        caseStore.createIndex('createdAt', 'createdAt');
      }
    },
  });

  return db;
};

export const getDB = (): IDBPDatabase | null => db;

export const closeDB = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};

export const projectDB = {
  async getAll(): Promise<Project[]> {
    const database = await initDB();
    return database.getAllFromIndex('projects', 'createdAt');
  },

  async getById(id: string): Promise<Project | undefined> {
    const database = await initDB();
    return database.get('projects', id);
  },

  async create(project: Project): Promise<string> {
    const database = await initDB();
    return database.add('projects', project) as Promise<string>;
  },

  async update(project: Project): Promise<string> {
    const database = await initDB();
    return database.put('projects', project) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    const tx = database.transaction(['projects', 'observations', 'analyses', 'pedestrianStudies', 'comparisons'], 'readwrite');
    await Promise.all([
      tx.store.delete(id),
      tx.objectStore('observations').delete(IDBKeyRange.only(id)),
      tx.objectStore('analyses').delete(IDBKeyRange.only(id)),
      tx.objectStore('pedestrianStudies').delete(IDBKeyRange.only(id)),
      tx.objectStore('comparisons').delete(IDBKeyRange.only(id)),
      tx.done,
    ]);
  },
};

export const observationDB = {
  async getAll(): Promise<Observation[]> {
    const database = await initDB();
    return database.getAllFromIndex('observations', 'observationTime');
  },

  async getByProjectId(projectId: string): Promise<Observation[]> {
    const database = await initDB();
    return database.getAllFromIndex('observations', 'projectId', projectId);
  },

  async getById(id: string): Promise<Observation | undefined> {
    const database = await initDB();
    return database.get('observations', id);
  },

  async create(observation: Observation): Promise<string> {
    const database = await initDB();
    return database.add('observations', observation) as Promise<string>;
  },

  async update(observation: Observation): Promise<string> {
    const database = await initDB();
    return database.put('observations', observation) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('observations', id);
  },
};

export const analysisDB = {
  async getAll(): Promise<SpatialAnalysis[]> {
    const database = await initDB();
    return database.getAll('analyses');
  },

  async getByProjectId(projectId: string): Promise<SpatialAnalysis[]> {
    const database = await initDB();
    return database.getAllFromIndex('analyses', 'projectId', projectId);
  },

  async getById(id: string): Promise<SpatialAnalysis | undefined> {
    const database = await initDB();
    return database.get('analyses', id);
  },

  async create(analysis: SpatialAnalysis): Promise<string> {
    const database = await initDB();
    return database.add('analyses', analysis) as Promise<string>;
  },

  async update(analysis: SpatialAnalysis): Promise<string> {
    const database = await initDB();
    return database.put('analyses', analysis) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('analyses', id);
  },
};

export const pedestrianStudyDB = {
  async getAll(): Promise<PedestrianStudy[]> {
    const database = await initDB();
    return database.getAllFromIndex('pedestrianStudies', 'studyDate');
  },

  async getByProjectId(projectId: string): Promise<PedestrianStudy[]> {
    const database = await initDB();
    return database.getAllFromIndex('pedestrianStudies', 'projectId', projectId);
  },

  async getById(id: string): Promise<PedestrianStudy | undefined> {
    const database = await initDB();
    return database.get('pedestrianStudies', id);
  },

  async create(study: PedestrianStudy): Promise<string> {
    const database = await initDB();
    return database.add('pedestrianStudies', study) as Promise<string>;
  },

  async update(study: PedestrianStudy): Promise<string> {
    const database = await initDB();
    return database.put('pedestrianStudies', study) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('pedestrianStudies', id);
  },
};

export const comparisonDB = {
  async getAll(): Promise<Comparison[]> {
    const database = await initDB();
    return database.getAll('comparisons');
  },

  async getByProjectId(projectId: string): Promise<Comparison[]> {
    const database = await initDB();
    return database.getAllFromIndex('comparisons', 'projectId', projectId);
  },

  async getById(id: string): Promise<Comparison | undefined> {
    const database = await initDB();
    return database.get('comparisons', id);
  },

  async create(comparison: Comparison): Promise<string> {
    const database = await initDB();
    return database.add('comparisons', comparison) as Promise<string>;
  },

  async update(comparison: Comparison): Promise<string> {
    const database = await initDB();
    return database.put('comparisons', comparison) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('comparisons', id);
  },
};

export const caseStudyDB = {
  async getAll(): Promise<CaseStudy[]> {
    const database = await initDB();
    return database.getAllFromIndex('caseStudies', 'createdAt');
  },

  async getById(id: string): Promise<CaseStudy | undefined> {
    const database = await initDB();
    return database.get('caseStudies', id);
  },

  async create(caseStudy: CaseStudy): Promise<string> {
    const database = await initDB();
    return database.add('caseStudies', caseStudy) as Promise<string>;
  },

  async update(caseStudy: CaseStudy): Promise<string> {
    const database = await initDB();
    return database.put('caseStudies', caseStudy) as Promise<string>;
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('caseStudies', id);
  },
};
