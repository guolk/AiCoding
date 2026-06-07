import { create } from 'zustand';
import type { Room, FunctionArea } from '../types';
import { mockData } from '../data/mockData';

interface SpaceStore {
  rooms: Room[];
  functionAreas: FunctionArea[];
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  getRoomById: (id: string) => Room | undefined;
  getRoomsByProjectId: (projectId: string) => Room[];
  setRooms: (rooms: Room[]) => void;
  addFunctionArea: (functionArea: Omit<FunctionArea, 'id'>) => void;
  updateFunctionArea: (id: string, updates: Partial<FunctionArea>) => void;
  deleteFunctionArea: (id: string) => void;
  getFunctionAreaById: (id: string) => FunctionArea | undefined;
  getFunctionAreasByRoomId: (roomId: string) => FunctionArea[];
  setFunctionAreas: (functionAreas: FunctionArea[]) => void;
}

const initialRooms: Room[] = mockData.rooms as unknown as Room[];
const initialFunctionAreas: FunctionArea[] = mockData.rooms.flatMap(
  (room) => room.functionAreas as unknown as FunctionArea[]
);

export const useSpaceStore = create<SpaceStore>((set, get) => ({
  rooms: initialRooms,
  functionAreas: initialFunctionAreas,

  addRoom: (room) => {
    const newRoom: Room = {
      ...room,
      id: `room-${Date.now()}`,
    };
    set((state) => ({
      rooms: [...state.rooms, newRoom],
    }));
  },

  updateRoom: (id, updates) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === id ? { ...room, ...updates } : room
      ),
    }));
  },

  deleteRoom: (id) => {
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
      functionAreas: state.functionAreas.filter((fa) => fa.roomId !== id),
    }));
  },

  getRoomById: (id) => {
    return get().rooms.find((room) => room.id === id);
  },

  getRoomsByProjectId: (projectId) => {
    return get().rooms.filter((room) => room.projectId === projectId);
  },

  setRooms: (rooms) => {
    set({ rooms });
  },

  addFunctionArea: (functionArea) => {
    const newFunctionArea: FunctionArea = {
      ...functionArea,
      id: `fa-${Date.now()}`,
    };
    set((state) => ({
      functionAreas: [...state.functionAreas, newFunctionArea],
    }));
  },

  updateFunctionArea: (id, updates) => {
    set((state) => ({
      functionAreas: state.functionAreas.map((fa) =>
        fa.id === id ? { ...fa, ...updates } : fa
      ),
    }));
  },

  deleteFunctionArea: (id) => {
    set((state) => ({
      functionAreas: state.functionAreas.filter((fa) => fa.id !== id),
    }));
  },

  getFunctionAreaById: (id) => {
    return get().functionAreas.find((fa) => fa.id === id);
  },

  getFunctionAreasByRoomId: (roomId) => {
    return get().functionAreas.filter((fa) => fa.roomId === roomId);
  },

  setFunctionAreas: (functionAreas) => {
    set({ functionAreas });
  },
}));

export default useSpaceStore;
