"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, MealEntry, WaterEntry, FoodReaction, FoodItem } from "@/lib/types";
import { getProfile, saveProfile, getMeals, saveMeals, getWaterEntries, saveWaterEntries, getFavorites, saveFavorites, getReactions, saveReactions } from "@/lib/storage";

interface AppState {
  profile: UserProfile | null;
  meals: MealEntry[];
  waterEntries: WaterEntry[];
  favorites: FoodItem[];
  reactions: FoodReaction[];
  setProfile: (profile: UserProfile) => void;
  addMeal: (meal: MealEntry) => void;
  removeMeal: (id: string) => void;
  addWaterEntry: (entry: WaterEntry) => void;
  addFavorite: (item: FoodItem) => void;
  removeFavorite: (id: string) => void;
  addReaction: (reaction: FoodReaction) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [reactions, setReactions] = useState<FoodReaction[]>([]);

  useEffect(() => {
    setProfileState(getProfile());
    setMeals(getMeals());
    setWaterEntries(getWaterEntries());
    setFavorites(getFavorites());
    setReactions(getReactions());
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    saveProfile(p);
  }, []);

  const addMeal = useCallback((meal: MealEntry) => {
    setMeals((prev) => {
      const next = [...prev, meal];
      saveMeals(next);
      return next;
    });
  }, []);

  const removeMeal = useCallback((id: string) => {
    setMeals((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMeals(next);
      return next;
    });
  }, []);

  const addWaterEntry = useCallback((entry: WaterEntry) => {
    setWaterEntries((prev) => {
      const next = [...prev, entry];
      saveWaterEntries(next);
      return next;
    });
  }, []);

  const addFavorite = useCallback((item: FoodItem) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === item.id)) return prev;
      const next = [...prev, item];
      saveFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const addReaction = useCallback((reaction: FoodReaction) => {
    setReactions((prev) => {
      const next = [...prev, reaction];
      saveReactions(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        meals,
        waterEntries,
        favorites,
        reactions,
        setProfile,
        addMeal,
        removeMeal,
        addWaterEntry,
        addFavorite,
        removeFavorite,
        addReaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
