import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppData, FamilyMember, Event, OralHistory, Photo, Biography, FamilyTrait, ThemeStory, ResearchNote } from '../types';
import { mockData } from '../data/mockData';

interface AppContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, member: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  addOralHistory: (history: OralHistory) => void;
  updateOralHistory: (id: string, history: Partial<OralHistory>) => void;
  deleteOralHistory: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  updatePhoto: (id: string, photo: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  addBiography: (biography: Biography) => void;
  updateBiography: (id: string, biography: Partial<Biography>) => void;
  deleteBiography: (id: string) => void;
  addFamilyTrait: (trait: FamilyTrait) => void;
  updateFamilyTrait: (id: string, trait: Partial<FamilyTrait>) => void;
  deleteFamilyTrait: (id: string) => void;
  addThemeStory: (story: ThemeStory) => void;
  updateThemeStory: (id: string, story: Partial<ThemeStory>) => void;
  deleteThemeStory: (id: string) => void;
  addResearchNote: (note: ResearchNote) => void;
  updateResearchNote: (id: string, note: Partial<ResearchNote>) => void;
  deleteResearchNote: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('familyHistoryData');
    return saved ? JSON.parse(saved) : mockData;
  });

  useEffect(() => {
    localStorage.setItem('familyHistoryData', JSON.stringify(data));
  }, [data]);

  const addMember = (member: FamilyMember) => {
    setData(prev => ({ ...prev, members: [...prev.members, member] }));
  };

  const updateMember = (id: string, member: Partial<FamilyMember>) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...member } : m)
    }));
  };

  const deleteMember = (id: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id)
    }));
  };

  const addEvent = (event: Event) => {
    setData(prev => ({ ...prev, events: [...prev.events, event] }));
  };

  const updateEvent = (id: string, event: Partial<Event>) => {
    setData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...event } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  const addOralHistory = (history: OralHistory) => {
    setData(prev => ({ ...prev, oralHistories: [...prev.oralHistories, history] }));
  };

  const updateOralHistory = (id: string, history: Partial<OralHistory>) => {
    setData(prev => ({
      ...prev,
      oralHistories: prev.oralHistories.map(h => h.id === id ? { ...h, ...history } : h)
    }));
  };

  const deleteOralHistory = (id: string) => {
    setData(prev => ({
      ...prev,
      oralHistories: prev.oralHistories.filter(h => h.id !== id)
    }));
  };

  const addPhoto = (photo: Photo) => {
    setData(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  };

  const updatePhoto = (id: string, photo: Partial<Photo>) => {
    setData(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === id ? { ...p, ...photo } : p)
    }));
  };

  const deletePhoto = (id: string) => {
    setData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }));
  };

  const addBiography = (biography: Biography) => {
    setData(prev => ({ ...prev, biographies: [...prev.biographies, biography] }));
  };

  const updateBiography = (id: string, biography: Partial<Biography>) => {
    setData(prev => ({
      ...prev,
      biographies: prev.biographies.map(b => b.id === id ? { ...b, ...biography } : b)
    }));
  };

  const deleteBiography = (id: string) => {
    setData(prev => ({
      ...prev,
      biographies: prev.biographies.filter(b => b.id !== id)
    }));
  };

  const addFamilyTrait = (trait: FamilyTrait) => {
    setData(prev => ({ ...prev, familyTraits: [...prev.familyTraits, trait] }));
  };

  const updateFamilyTrait = (id: string, trait: Partial<FamilyTrait>) => {
    setData(prev => ({
      ...prev,
      familyTraits: prev.familyTraits.map(t => t.id === id ? { ...t, ...trait } : t)
    }));
  };

  const deleteFamilyTrait = (id: string) => {
    setData(prev => ({
      ...prev,
      familyTraits: prev.familyTraits.filter(t => t.id !== id)
    }));
  };

  const addThemeStory = (story: ThemeStory) => {
    setData(prev => ({ ...prev, themeStories: [...prev.themeStories, story] }));
  };

  const updateThemeStory = (id: string, story: Partial<ThemeStory>) => {
    setData(prev => ({
      ...prev,
      themeStories: prev.themeStories.map(s => s.id === id ? { ...s, ...story } : s)
    }));
  };

  const deleteThemeStory = (id: string) => {
    setData(prev => ({
      ...prev,
      themeStories: prev.themeStories.filter(s => s.id !== id)
    }));
  };

  const addResearchNote = (note: ResearchNote) => {
    setData(prev => ({ ...prev, researchNotes: [...prev.researchNotes, note] }));
  };

  const updateResearchNote = (id: string, note: Partial<ResearchNote>) => {
    setData(prev => ({
      ...prev,
      researchNotes: prev.researchNotes.map(n => n.id === id ? { ...n, ...note } : n)
    }));
  };

  const deleteResearchNote = (id: string) => {
    setData(prev => ({
      ...prev,
      researchNotes: prev.researchNotes.filter(n => n.id !== id)
    }));
  };

  return (
    <AppContext.Provider value={{
      data,
      setData,
      addMember,
      updateMember,
      deleteMember,
      addEvent,
      updateEvent,
      deleteEvent,
      addOralHistory,
      updateOralHistory,
      deleteOralHistory,
      addPhoto,
      updatePhoto,
      deletePhoto,
      addBiography,
      updateBiography,
      deleteBiography,
      addFamilyTrait,
      updateFamilyTrait,
      deleteFamilyTrait,
      addThemeStory,
      updateThemeStory,
      deleteThemeStory,
      addResearchNote,
      updateResearchNote,
      deleteResearchNote,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
