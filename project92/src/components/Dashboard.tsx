"use client";

import React, { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { sumNutrients, formatDate, getMealTypeLabel, calculateNutritionTarget } from "@/lib/calculations";
import { Flame, Droplets, Utensils, TrendingUp, Plus } from "lucide-react";
import ProgressBar from "./ProgressBar";
import Link from "next/link";

export default function Dashboard() {
  const { profile, meals, waterEntries } = useApp();

  const today = formatDate(new Date());
  const todayMeals = meals.filter((m) => m.timestamp.split("T")[0] === today);
  const todayWater = waterEntries.filter((w) => w.timestamp.split("T")[0] === today);

  const totalNutrients = useMemo(() => sumNutrients(todayMeals), [todayMeals]);
  const totalWater = todayWater.reduce((sum, w) => sum + w.amount, 0);
  const target = useMemo(
    () => (profile ? calculateNutritionTarget(profile) : null),
    [profile]
  );

  const caloriePercent = target
    ? Math.min(100, (totalNutrients.calories / target.calories) * 100)
    : 0;
  const waterPercent = profile
    ? Math.min(100, (totalWater / profile.waterTarget) * 100)
    : 0;

  const mealGroups = {
    breakfast: todayMeals.filter((m) => m.mealType === "breakfast"),
    lunch: todayMeals.filter((m) => m.mealType === "lunch"),
    dinner: todayMeals.filter((m) => m.mealType === "dinner"),
    snack: todayMeals.filter((m) => m.mealType === "snack"),
  };

  if (!profile || !target) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm text-slate-500">今日热量</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalNutrients.calories.toFixed(0)}
            <span className="text-sm font-normal text-slate-400">
              {" "}
              / {target.calories} kcal
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={caloriePercent} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm text-slate-500">饮水量</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {totalWater}
            <span className="text-sm font-normal text-slate-400">
              {" "}
              / {profile.waterTarget} ml
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar value={waterPercent} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-slate-500">已记录餐次</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {todayMeals.length}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {todayMeals.length === 0
              ? "还没有记录，开始记录第一餐吧"
              : `记录了 ${todayMeals.length} 条食物`}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-slate-500">目标状态</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {caloriePercent >= 90 && caloriePercent <= 110
              ? "良好"
              : caloriePercent < 90
              ? "偏低"
              : "超标"}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            距离目标还差 {Math.max(0, target.calories - totalNutrients.calories).toFixed(0)} kcal
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">今日宏量营养素</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">蛋白质</span>
              <span className="text-slate-800 font-medium">
                {totalNutrients.protein.toFixed(1)} / {target.protein}g
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (totalNutrients.protein / target.protein) * 100)}
              color="bg-green-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">碳水</span>
              <span className="text-slate-800 font-medium">
                {totalNutrients.carbs.toFixed(1)} / {target.carbs}g
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (totalNutrients.carbs / target.carbs) * 100)}
              color="bg-blue-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">脂肪</span>
              <span className="text-slate-800 font-medium">
                {totalNutrients.fat.toFixed(1)} / {target.fat}g
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, (totalNutrients.fat / target.fat) * 100)}
              color="bg-yellow-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">今日饮食记录</h2>
        </div>
        <div className="space-y-4">
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((mealType) => (
            <div key={mealType}>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {getMealTypeLabel(mealType)}
              </h3>
              {mealGroups[mealType].length === 0 ? (
                <div className="text-sm text-slate-400 py-2 px-4 bg-slate-50 rounded-lg">
                  尚未记录
                </div>
              ) : (
                <div className="space-y-2">
                  {mealGroups[mealType].map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {meal.photoUrl && (
                          <img
                            src={meal.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-800 text-sm">
                            {meal.foodItem.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {meal.quantity}
                            {meal.foodItem.servingUnit} ·{" "}
                            {(
                              meal.foodItem.nutrients.calories *
                              (meal.quantity / meal.foodItem.servingSize)
                            ).toFixed(0)}{" "}
                            kcal
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
