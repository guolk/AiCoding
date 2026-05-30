import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Material, MaterialCategory } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { seedMaterials } from '../data/seedData';
import { generateId } from '../utils/duration';

interface MaterialContextType {
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  getMaterialById: (id: string) => Material | undefined;
  getMaterialsByCategory: (category: MaterialCategory) => Material[];
  getHighPotentialMaterials: (threshold?: number) => Material[];
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

export function MaterialProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useLocalStorage<Material[]>('comedy_materials', seedMaterials);

  const addMaterial = useCallback((material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMaterial: Material = {
      ...material,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setMaterials(prev => [newMaterial, ...prev]);
  }, [setMaterials]);

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    setMaterials(prev =>
      prev.map(m =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      )
    );
  }, [setMaterials]);

  const deleteMaterial = useCallback((id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, [setMaterials]);

  const getMaterialById = useCallback((id: string) => {
    return materials.find(m => m.id === id);
  }, [materials]);

  const getMaterialsByCategory = useCallback((category: MaterialCategory) => {
    return materials.filter(m => m.category === category);
  }, [materials]);

  const getHighPotentialMaterials = useCallback((threshold: number = 7) => {
    return materials.filter(m => m.potential >= threshold).sort((a, b) => b.potential - a.potential);
  }, [materials]);

  return (
    <MaterialContext.Provider value={{
      materials,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      getMaterialById,
      getMaterialsByCategory,
      getHighPotentialMaterials,
    }}>
      {children}
    </MaterialContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
}
