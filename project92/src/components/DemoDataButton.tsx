"use client";

import React from "react";
import { useApp } from "@/lib/AppContext";
import { MealEntry, WaterEntry, FoodReaction, UserProfile } from "@/lib/types";
import { generateId, formatDate } from "@/lib/calculations";
import { getMockFoods } from "@/lib/foodApi";
import { Download, Trash2 } from "lucide-react";
import { useToast } from "@/lib/ToastContext";

export default function DemoDataButton() {
  const { profile, setProfile, addMeal, addWaterEntry, addReaction, meals, waterEntries, reactions } =
    useApp();
  const { showToast } = useToast();

  const loadDemoData = () => {
    const mockFoods = getMockFoods();

    if (!profile) {
      const demoProfile: UserProfile = {
        id: generateId(),
        name: "演示用户",
        age: 30,
        gender: "male",
        height: 175,
        weight: 70,
        activityLevel: "moderate",
        goal: "maintenance",
        bmr: 1680,
        tdee: 2604,
        targetCalories: 2604,
        macroPreset: "balanced",
        waterTarget: 2000,
        createdAt: new Date().toISOString(),
      };
      setProfile(demoProfile);
    }

    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    const dayBefore = formatDate(new Date(Date.now() - 86400000 * 2));

    const demoMeals: Partial<MealEntry>[] = [
      { foodItem: mockFoods[3], quantity: 100, mealType: "breakfast", date: today, hour: 8 },
      { foodItem: mockFoods[6], quantity: 40, mealType: "breakfast", date: today, hour: 8 },
      { foodItem: mockFoods[0], quantity: 150, mealType: "lunch", date: today, hour: 12 },
      { foodItem: mockFoods[1], quantity: 100, mealType: "lunch", date: today, hour: 12 },
      { foodItem: mockFoods[2], quantity: 150, mealType: "lunch", date: today, hour: 12 },
      { foodItem: mockFoods[7], quantity: 120, mealType: "snack", date: today, hour: 15 },
      { foodItem: mockFoods[5], quantity: 120, mealType: "dinner", date: today, hour: 19 },
      { foodItem: mockFoods[0], quantity: 120, mealType: "lunch", date: yesterday, hour: 12 },
      { foodItem: mockFoods[4], quantity: 250, mealType: "breakfast", date: yesterday, hour: 8 },
      { foodItem: mockFoods[1], quantity: 80, mealType: "dinner", date: yesterday, hour: 19 },
      { foodItem: mockFoods[2], quantity: 100, mealType: "lunch", date: dayBefore, hour: 12 },
      { foodItem: mockFoods[6], quantity: 50, mealType: "breakfast", date: dayBefore, hour: 8 },
    ];

    demoMeals.forEach((m) => {
      const d = new Date(m.date);
      d.setHours(m.hour || 12, 0, 0, 0);
      const meal: MealEntry = {
        id: generateId(),
        foodItem: m.foodItem!,
        quantity: m.quantity!,
        mealType: m.mealType!,
        timestamp: d.toISOString(),
      };
      addMeal(meal);
    });

    const demoWater: Partial<WaterEntry>[] = [
      { amount: 250, date: today, hour: 8 },
      { amount: 250, date: today, hour: 10 },
      { amount: 500, date: today, hour: 13 },
      { amount: 250, date: today, hour: 16 },
      { amount: 250, date: today, hour: 19 },
      { amount: 250, date: yesterday, hour: 9 },
      { amount: 500, date: yesterday, hour: 14 },
    ];

    demoWater.forEach((w) => {
      const d = new Date(w.date);
      d.setHours(w.hour || 12, 0, 0, 0);
      const entry: WaterEntry = {
        id: generateId(),
        amount: w.amount!,
        timestamp: d.toISOString(),
      };
      addWaterEntry(entry);
    });

    const demoReactions: Partial<FoodReaction>[] = [
      { foodItemId: mockFoods[0].id, foodItemName: mockFoods[0].name, energyLevel: 4, digestion: "good", date: today, hour: 13 },
      { foodItemId: mockFoods[5].id, foodItemName: mockFoods[5].name, energyLevel: 5, digestion: "good", date: yesterday, hour: 20 },
      { foodItemId: mockFoods[7].id, foodItemName: mockFoods[7].name, energyLevel: 3, digestion: "normal", date: yesterday, hour: 16 },
    ];

    demoReactions.forEach((r) => {
      const d = new Date(r.date);
      d.setHours(r.hour || 12, 0, 0, 0);
      const reaction: FoodReaction = {
        id: generateId(),
        foodItemId: r.foodItemId!,
        foodItemName: r.foodItemName!,
        timestamp: d.toISOString(),
        energyLevel: r.energyLevel! as 1 | 2 | 3 | 4 | 5,
        digestion: r.digestion! as "good" | "normal" | "bad",
      };
      addReaction(reaction);
    });

    showToast("演示数据已加载！", "success");
  };

  const clearAllData = () => {
    if (confirm("确定要清除所有数据吗？")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={loadDemoData}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
      >
        <Download className="w-4 h-4" />
        加载演示数据
      </button>
      {(meals.length > 0 || waterEntries.length > 0 || reactions.length > 0) && (
        <button
          onClick={clearAllData}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          清除数据
        </button>
      )}
    </div>
  );
}
