import { create } from 'zustand';
import type { DesignVersion, DesignElement, MoodBoardImage } from '../types';
import { mockData } from '../data/mockData';

interface DesignStore {
  designVersions: DesignVersion[];
  designElements: DesignElement[];
  moodBoardImages: MoodBoardImage[];
  addDesignVersion: (version: Omit<DesignVersion, 'id' | 'createdAt'>) => void;
  updateDesignVersion: (id: string, updates: Partial<DesignVersion>) => void;
  deleteDesignVersion: (id: string) => void;
  getDesignVersionById: (id: string) => DesignVersion | undefined;
  getDesignVersionsByProjectId: (projectId: string) => DesignVersion[];
  setDesignVersions: (versions: DesignVersion[]) => void;
  addDesignElement: (element: Omit<DesignElement, 'id'>) => void;
  updateDesignElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteDesignElement: (id: string) => void;
  getDesignElementById: (id: string) => DesignElement | undefined;
  getDesignElementsByVersionId: (versionId: string) => DesignElement[];
  getDesignElementsByRoomId: (roomId: string) => DesignElement[];
  setDesignElements: (elements: DesignElement[]) => void;
  addMoodBoardImage: (image: Omit<MoodBoardImage, 'id' | 'createdAt'>) => void;
  updateMoodBoardImage: (id: string, updates: Partial<MoodBoardImage>) => void;
  deleteMoodBoardImage: (id: string) => void;
  getMoodBoardImageById: (id: string) => MoodBoardImage | undefined;
  getMoodBoardImagesByVersionId: (versionId: string) => MoodBoardImage[];
  setMoodBoardImages: (images: MoodBoardImage[]) => void;
}

const initialDesignVersions: DesignVersion[] = mockData.designVersions.map(
  (v) =>
    ({
      id: v.id,
      projectId: v.projectId,
      versionNumber: v.version,
      name: v.name,
      description: v.description,
      status: v.status as DesignVersion['status'],
      createdAt: v.createdAt,
      elements: v.designElements as unknown as DesignElement[],
      moodBoardImages: v.inspirationImages as unknown as MoodBoardImage[],
    }) as DesignVersion
);

const initialDesignElements: DesignElement[] = mockData.designVersions.flatMap(
  (v) => v.designElements as unknown as DesignElement[]
);

const initialMoodBoardImages: MoodBoardImage[] = mockData.designVersions.flatMap(
  (v) => v.inspirationImages as unknown as MoodBoardImage[]
);

export const useDesignStore = create<DesignStore>((set, get) => ({
  designVersions: initialDesignVersions,
  designElements: initialDesignElements,
  moodBoardImages: initialMoodBoardImages,

  addDesignVersion: (version) => {
    const newVersion: DesignVersion = {
      ...version,
      id: `ver-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      designVersions: [...state.designVersions, newVersion],
    }));
  },

  updateDesignVersion: (id, updates) => {
    set((state) => ({
      designVersions: state.designVersions.map((version) =>
        version.id === id ? { ...version, ...updates } : version
      ),
    }));
  },

  deleteDesignVersion: (id) => {
    set((state) => ({
      designVersions: state.designVersions.filter((v) => v.id !== id),
      designElements: state.designElements.filter((e) => e.versionId !== id),
      moodBoardImages: state.moodBoardImages.filter((img) => img.versionId !== id),
    }));
  },

  getDesignVersionById: (id) => {
    return get().designVersions.find((version) => version.id === id);
  },

  getDesignVersionsByProjectId: (projectId) => {
    return get().designVersions.filter((version) => version.projectId === projectId);
  },

  setDesignVersions: (designVersions) => {
    set({ designVersions });
  },

  addDesignElement: (element) => {
    const newElement: DesignElement = {
      ...element,
      id: `de-${Date.now()}`,
    };
    set((state) => ({
      designElements: [...state.designElements, newElement],
    }));
  },

  updateDesignElement: (id, updates) => {
    set((state) => ({
      designElements: state.designElements.map((element) =>
        element.id === id ? { ...element, ...updates } : element
      ),
    }));
  },

  deleteDesignElement: (id) => {
    set((state) => ({
      designElements: state.designElements.filter((element) => element.id !== id),
    }));
  },

  getDesignElementById: (id) => {
    return get().designElements.find((element) => element.id === id);
  },

  getDesignElementsByVersionId: (versionId) => {
    return get().designElements.filter((element) => element.versionId === versionId);
  },

  getDesignElementsByRoomId: (roomId) => {
    return get().designElements.filter((element) => element.roomId === roomId);
  },

  setDesignElements: (designElements) => {
    set({ designElements });
  },

  addMoodBoardImage: (image) => {
    const newImage: MoodBoardImage = {
      ...image,
      id: `img-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      moodBoardImages: [...state.moodBoardImages, newImage],
    }));
  },

  updateMoodBoardImage: (id, updates) => {
    set((state) => ({
      moodBoardImages: state.moodBoardImages.map((image) =>
        image.id === id ? { ...image, ...updates } : image
      ),
    }));
  },

  deleteMoodBoardImage: (id) => {
    set((state) => ({
      moodBoardImages: state.moodBoardImages.filter((image) => image.id !== id),
    }));
  },

  getMoodBoardImageById: (id) => {
    return get().moodBoardImages.find((image) => image.id === id);
  },

  getMoodBoardImagesByVersionId: (versionId) => {
    return get().moodBoardImages.filter((image) => image.versionId === versionId);
  },

  setMoodBoardImages: (moodBoardImages) => {
    set({ moodBoardImages });
  },
}));

export default useDesignStore;
