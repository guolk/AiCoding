import { FoodItem, MealEntry, UserProfile, WaterEntry, FoodReaction } from "./types";

const STORAGE_KEYS = {
  profile: "nt_profile",
  meals: "nt_meals",
  water: "nt_water",
  favorites: "nt_favorites",
  reactions: "nt_reactions",
};

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.profile);
  return data ? JSON.parse(data) : null;
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function getMeals(): MealEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.meals);
  return data ? JSON.parse(data) : [];
}

export function saveMeals(meals: MealEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.meals, JSON.stringify(meals));
}

export function addMeal(meal: MealEntry): void {
  const meals = getMeals();
  meals.push(meal);
  saveMeals(meals);
}

export function removeMeal(id: string): void {
  const meals = getMeals().filter((m) => m.id !== id);
  saveMeals(meals);
}

export function getWaterEntries(): WaterEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.water);
  return data ? JSON.parse(data) : [];
}

export function saveWaterEntries(entries: WaterEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.water, JSON.stringify(entries));
}

export function addWaterEntry(entry: WaterEntry): void {
  const entries = getWaterEntries();
  entries.push(entry);
  saveWaterEntries(entries);
}

export function getFavorites(): FoodItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.favorites);
  return data ? JSON.parse(data) : [];
}

export function saveFavorites(items: FoodItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(items));
}

export function addFavorite(item: FoodItem): void {
  const favorites = getFavorites();
  if (!favorites.find((f) => f.id === item.id)) {
    favorites.push(item);
    saveFavorites(favorites);
  }
}

export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter((f) => f.id !== id);
  saveFavorites(favorites);
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

export function getReactions(): FoodReaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.reactions);
  return data ? JSON.parse(data) : [];
}

export function saveReactions(reactions: FoodReaction[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.reactions, JSON.stringify(reactions));
}

export function addReaction(reaction: FoodReaction): void {
  const reactions = getReactions();
  reactions.push(reaction);
  saveReactions(reactions);
}
