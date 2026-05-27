"use client";

import React, { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { sumNutrients, formatDate, calculateNutritionTarget } from "@/lib/calculations";
import { Nutrients, NutritionTarget } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ProgressBar from "./ProgressBar";
import { TrendingUp, Award, AlertCircle } from "lucide-react";

export default function NutritionAnalysis() {
  const { profile, meals } = useApp();

  const today = formatDate(new Date());
  const todayMeals = meals.filter((m) => m.timestamp.split("T")[0] === today);
  const todayNutrients = useMemo(() => sumNutrients(todayMeals), [todayMeals]);
  const target = useMemo(
    () => (profile ? calculateNutritionTarget(profile) : null),
    [profile]
  );

  const weekData = useMemo(() => {
    const days: { date: string; label: string; calories: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayMeals = meals.filter((m) => m.timestamp.split("T")[0] === dateStr);
      const dayNutrients = sumNutrients(dayMeals);
      days.push({
        date: dateStr,
        label: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
        calories: dayNutrients.calories,
      });
    }
    return days;
  }, [meals]);

  const weekScore = useMemo(() => {
    if (!target || !profile) return 0;
    const validDays = weekData.filter((d) => d.calories > 0);
    if (validDays.length === 0) return 0;
    const scores = validDays.map((d) => {
      const ratio = d.calories / target.calories;
      if (ratio >= 0.8 && ratio <= 1.2) return 100;
      if (ratio >= 0.6 && ratio <= 1.4) return 70;
      if (ratio >= 0.4 && ratio <= 1.6) return 40;
      return 10;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [weekData, target, profile]);

  const macroData = useMemo(() => {
    if (!target) return [];
    const proteinCal = todayNutrients.protein * 4;
    const carbsCal = todayNutrients.carbs * 4;
    const fatCal = todayNutrients.fat * 9;
    const total = proteinCal + carbsCal + fatCal;
    if (total === 0) return [];
    return [
      { name: "蛋白质", value: Math.round((proteinCal / total) * 100), color: "#10b981" },
      { name: "碳水", value: Math.round((carbsCal / total) * 100), color: "#3b82f6" },
      { name: "脂肪", value: Math.round((fatCal / total) * 100), color: "#f59e0b" },
    ];
  }, [todayNutrients, target]);

  const nutrientRows: { key: keyof Nutrients; label: string; unit: string; targetKey?: keyof NutritionTarget }[] = [
    { key: "fiber", label: "膳食纤维", unit: "g" },
    { key: "vitaminA", label: "维生素A", unit: "μg" },
    { key: "vitaminC", label: "维生素C", unit: "mg" },
    { key: "vitaminD", label: "维生素D", unit: "μg" },
    { key: "calcium", label: "钙", unit: "mg" },
    { key: "iron", label: "铁", unit: "mg" },
    { key: "magnesium", label: "镁", unit: "mg" },
    { key: "potassium", label: "钾", unit: "mg" },
    { key: "sodium", label: "钠", unit: "mg" },
  ];

  if (!profile || !target) return null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <span className="text-sm text-slate-500">今日热量摄入</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">
            {todayNutrients.calories.toFixed(0)}
            <span className="text-lg font-normal text-slate-400">
              {" "}
              / {target.calories} kcal
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={(todayNutrients.calories / target.calories) * 100}
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {todayNutrients.calories > target.calories
              ? `超出 ${(todayNutrients.calories - target.calories).toFixed(0)} kcal`
              : `还需 ${(target.calories - todayNutrients.calories).toFixed(0)} kcal`}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-slate-500">本周均衡评分</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{weekScore}</div>
          <div className="text-xs text-slate-500">
            {weekScore >= 80
              ? "饮食非常均衡，继续保持！"
              : weekScore >= 60
              ? "饮食较为均衡，还有提升空间"
              : weekScore >= 40
              ? "饮食不够规律，建议调整"
              : "饮食不均衡，需要改进"}
          </div>
          <div className="mt-3">
            <ProgressBar value={weekScore} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-sm text-slate-500">今日记录</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{todayMeals.length}</div>
          <div className="text-xs text-slate-500">条食物记录</div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {todayMeals.length === 0 && (
              <span className="text-xs text-red-500">今天还没有记录</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            一周热量趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)} kcal`, "热量"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="calories"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            宏量营养素比例
          </h3>
          {macroData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              今天还没有数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          微量营养素详情
        </h3>
        <div className="space-y-4">
          {nutrientRows.map((row) => {
            const current = todayNutrients[row.key];
            const targetVal = target[row.key as keyof NutritionTarget];
            const percent = targetVal ? (current / targetVal) * 100 : 0;
            return (
              <div key={row.key} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 text-sm text-slate-600">{row.label}</div>
                <div className="col-span-3 text-sm text-slate-800 font-medium">
                  {current.toFixed(1)} / {targetVal} {row.unit}
                </div>
                <div className="col-span-5">
                  <ProgressBar value={percent} />
                </div>
                <div
                  className={`col-span-1 text-right text-sm font-medium ${
                    percent >= 80 && percent <= 120
                      ? "text-green-500"
                      : percent > 120
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {percent.toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
