"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/lib/AppContext";
import { formatDate, generateId, isHighCalorieLowNutrient, getMealTypeLabel } from "@/lib/calculations";
import { WaterEntry } from "@/lib/types";
import {
  Droplets,
  Plus,
  Minus,
  Clock,
  AlertTriangle,
  Moon,
  Sun,
  TrendingUp,
  Coffee,
  Wine,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HabitsAnalysis() {
  const { meals, waterEntries, profile, addWaterEntry } = useApp();
  const [waterAmount, setWaterAmount] = useState(250);

  const today = formatDate(new Date());
  const todayWater = waterEntries.filter((w) => w.timestamp.split("T")[0] === today);
  const totalWaterToday = todayWater.reduce((sum, w) => sum + w.amount, 0);

  const weekWaterData = useMemo(() => {
    const days: { date: string; label: string; water: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayWater = waterEntries.filter((w) => w.timestamp.split("T")[0] === dateStr);
      const total = dayWater.reduce((sum, w) => sum + w.amount, 0);
      days.push({
        date: dateStr,
        label: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
        water: total,
      });
    }
    return days;
  }, [waterEntries]);

  const addWater = () => {
    const entry: WaterEntry = {
      id: generateId(),
      amount: waterAmount,
      timestamp: new Date().toISOString(),
    };
    addWaterEntry(entry);
  };

  const removeLastWater = () => {
    if (todayWater.length === 0) return;
    const lastId = todayWater[todayWater.length - 1].id;
    const updated = waterEntries.filter((w) => w.id !== lastId);
    localStorage.setItem("nt_water", JSON.stringify(updated));
    window.location.reload();
  };

  const mealTimingData = useMemo(() => {
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(formatDate(d));
    }

    const timingStats: Record<
      string,
      { earlyMorning: number; morning: number; noon: number; afternoon: number; evening: number; lateNight: number }
    > = {};
    last7Days.forEach((d) => {
      timingStats[d] = {
        earlyMorning: 0,
        morning: 0,
        noon: 0,
        afternoon: 0,
        evening: 0,
        lateNight: 0,
      };
    });

    meals.forEach((meal) => {
      const date = meal.timestamp.split("T")[0];
      if (!last7Days.includes(date)) return;
      const hour = new Date(meal.timestamp).getHours();
      if (hour >= 5 && hour < 8) timingStats[date].earlyMorning++;
      else if (hour >= 8 && hour < 11) timingStats[date].morning++;
      else if (hour >= 11 && hour < 14) timingStats[date].noon++;
      else if (hour >= 14 && hour < 17) timingStats[date].afternoon++;
      else if (hour >= 17 && hour < 22) timingStats[date].evening++;
      else timingStats[date].lateNight++;
    });

    return last7Days.map((d) => ({
      date: d,
      label: ["日", "一", "二", "三", "四", "五", "六"][new Date(d).getDay()],
      ...timingStats[d],
    }));
  }, [meals]);

  const lateNightCount = useMemo(() => {
    return meals.filter((m) => {
      const hour = new Date(m.timestamp).getHours();
      return hour >= 22 || hour < 5;
    }).length;
  }, [meals]);

  const highCalorieFoods = useMemo(() => {
    return meals
      .filter((m) => isHighCalorieLowNutrient(m.foodItem))
      .slice(-10)
      .reverse();
  }, [meals]);

  const averageMealTimes = useMemo(() => {
    const mealTimes: Record<string, number[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    meals.forEach((meal) => {
      const hour = new Date(meal.timestamp).getHours();
      const minute = new Date(meal.timestamp).getMinutes();
      mealTimes[meal.mealType].push(hour * 60 + minute);
    });
    const result: Record<string, string> = {};
    Object.keys(mealTimes).forEach((type) => {
      const times = mealTimes[type];
      if (times.length === 0) {
        result[type] = "暂无数据";
      } else {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const h = Math.floor(avg / 60);
        const m = Math.floor(avg % 60);
        result[type] = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      }
    });
    return result;
  }, [meals]);

  const waterPercent = profile
    ? Math.min(100, (totalWaterToday / profile.waterTarget) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">饮水追踪</h3>
                <p className="text-xs text-slate-500">今日目标 {profile?.waterTarget}ml</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800">
                {totalWaterToday}
                <span className="text-sm font-normal text-slate-400">
                  {" "}
                  ml
                </span>
              </div>
            </div>
          </div>

          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                waterPercent >= 80
                  ? "bg-blue-500"
                  : waterPercent >= 50
                  ? "bg-blue-400"
                  : waterPercent >= 20
                  ? "bg-blue-300"
                  : "bg-blue-200"
              }`}
              style={{ width: `${waterPercent}%` }}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setWaterAmount(150)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                waterAmount === 150
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Coffee className="w-4 h-4 inline mr-1" />
              150ml
            </button>
            <button
              onClick={() => setWaterAmount(250)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                waterAmount === 250
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Droplets className="w-4 h-4 inline mr-1" />
              250ml
            </button>
            <button
              onClick={() => setWaterAmount(500)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                waterAmount === 500
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Wine className="w-4 h-4 inline mr-1" />
              500ml
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addWater}
              className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加 {waterAmount}ml
            </button>
            <button
              onClick={removeLastWater}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              disabled={todayWater.length === 0}
            >
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">进餐时间分析</h3>
              <p className="text-xs text-slate-500">过去7天的进餐时段分布</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealTimingData}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="morning" stackId="a" fill="#fbbf24" name="上午" />
                <Bar dataKey="noon" stackId="a" fill="#f97316" name="中午" />
                <Bar dataKey="afternoon" stackId="a" fill="#8b5cf6" name="下午" />
                <Bar dataKey="evening" stackId="a" fill="#6366f1" name="晚上" />
                <Bar
                  dataKey="lateNight"
                  stackId="a"
                  fill="#ef4444"
                  name="深夜"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-slate-500">平均早餐时间</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {averageMealTimes.breakfast}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-slate-500">平均午餐时间</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {averageMealTimes.lunch}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5 text-indigo-500" />
            <span className="text-sm text-slate-500">平均晚餐时间</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {averageMealTimes.dinner}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              高热量低营养食物警示
            </h3>
            <p className="text-xs text-slate-500">
              最近摄入的 {highCalorieFoods.length} 条记录
            </p>
          </div>
          {lateNightCount > 0 && (
            <div className="ml-auto flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
              <Moon className="w-4 h-4" />
              深夜进食 {lateNightCount} 次
            </div>
          )}
        </div>

        {highCalorieFoods.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            没有发现高热量低营养食物，继续保持！
          </div>
        ) : (
          <div className="space-y-2">
            {highCalorieFoods.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 bg-red-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div>
                    <div className="font-medium text-slate-800 text-sm">
                      {meal.foodItem.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {getMealTypeLabel(meal.mealType)} ·{" "}
                      {new Date(meal.timestamp).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">
                    {(
                      meal.foodItem.nutrients.calories *
                      (meal.quantity / meal.foodItem.servingSize)
                    ).toFixed(0)}{" "}
                    kcal
                  </div>
                  <div className="text-xs text-slate-500">
                    蛋白{meal.foodItem.nutrients.protein.toFixed(1)}g
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">一周饮水趋势</h3>
            <p className="text-xs text-slate-500">过去7天的饮水量变化</p>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekWaterData}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value} ml`, "饮水量"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="water" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
