"use client";

import React, { useState } from "react";
import { UserProfile } from "@/lib/types";
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  getActivityLevelLabel,
  getGoalLabel,
  getMacroPresetLabel,
  generateId,
} from "@/lib/calculations";
import { useApp } from "@/lib/AppContext";
import { Leaf } from "lucide-react";

export default function ProfileSetup() {
  const { setProfile } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    age: 25,
    gender: "male" as "male" | "female",
    height: 170,
    weight: 65,
    activityLevel: "light" as UserProfile["activityLevel"],
    goal: "maintenance" as UserProfile["goal"],
    chronicCondition: "",
    macroPreset: "balanced" as UserProfile["macroPreset"],
    waterTarget: 2000,
  });

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const bmr = Math.round(
      calculateBMR(form.weight, form.height, form.age, form.gender)
    );
    const tdee = calculateTDEE(bmr, form.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, form.goal);

    const profile: UserProfile = {
      id: generateId(),
      name: form.name || "用户",
      age: form.age,
      gender: form.gender,
      height: form.height,
      weight: form.weight,
      activityLevel: form.activityLevel,
      goal: form.goal,
      chronicCondition: form.goal === "chronic_condition" ? form.chronicCondition : undefined,
      bmr,
      tdee,
      targetCalories,
      macroPreset: form.macroPreset,
      waterTarget: form.waterTarget,
      createdAt: new Date().toISOString(),
    };

    setProfile(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl gradient-card flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">健康饮食追踪</h1>
          <p className="text-slate-500 mt-2">让我们先了解一下你</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? "w-8 bg-primary-500" : "w-4 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-800">基本信息</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  昵称
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                  placeholder="请输入你的昵称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    年龄
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => update("age", +e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    min={10}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    性别
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => update("gender", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    身高 (cm)
                  </label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => update("height", +e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    min={100}
                    max={250}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => update("weight", +e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    min={30}
                    max={200}
                    step={0.1}
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
              >
                下一步
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-800">活动水平</h2>
              <div className="space-y-2">
                {(["sedentary", "light", "moderate", "active", "very_active"] as const).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => update("activityLevel", level)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        form.activityLevel === level
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium text-slate-800">
                        {getActivityLevelLabel(level)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {level === "sedentary" && "几乎不运动，办公室工作为主"}
                        {level === "light" && "每周1-3次轻度运动"}
                        {level === "moderate" && "每周3-5次中度运动"}
                        {level === "active" && "每周6-7次高强度运动"}
                        {level === "very_active" && "每天多次运动或体力劳动"}
                      </div>
                    </button>
                  )
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-800">健康目标</h2>
              <div className="space-y-2">
                {(["weight_loss", "muscle_gain", "maintenance", "chronic_condition"] as const).map(
                  (goal) => (
                    <button
                      key={goal}
                      onClick={() => update("goal", goal)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        form.goal === goal
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium text-slate-800">
                        {getGoalLabel(goal)}
                      </div>
                    </button>
                  )
                )}
              </div>
              {form.goal === "chronic_condition" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    慢性病名称
                  </label>
                  <input
                    type="text"
                    value={form.chronicCondition}
                    onChange={(e) => update("chronicCondition", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    placeholder="如：糖尿病、高血压等"
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-800">饮食模式</h2>
              <div className="grid grid-cols-2 gap-3">
                {(["balanced", "keto", "low_carb", "high_protein", "vegetarian"] as const).map(
                  (preset) => (
                    <button
                      key={preset}
                      onClick={() => update("macroPreset", preset)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.macroPreset === preset
                          ? "border-primary-500 bg-primary-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium text-slate-800 text-sm">
                        {getMacroPresetLabel(preset)}
                      </div>
                    </button>
                  )
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  每日饮水量目标 (ml)
                </label>
                <input
                  type="number"
                  value={form.waterTarget}
                  onChange={(e) => update("waterTarget", +e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  min={500}
                  max={5000}
                  step={100}
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-600 mb-3">
                  计算结果预览
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">基础代谢率</span>
                    <span className="font-medium text-slate-800">
                      {Math.round(
                        calculateBMR(form.weight, form.height, form.age, form.gender)
                      )}{" "}
                      kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">每日总消耗</span>
                    <span className="font-medium text-slate-800">
                      {calculateTDEE(
                        Math.round(
                          calculateBMR(form.weight, form.height, form.age, form.gender)
                        ),
                        form.activityLevel
                      )}{" "}
                      kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">目标热量</span>
                    <span className="font-medium text-primary-600">
                      {calculateTargetCalories(
                        calculateTDEE(
                          Math.round(
                            calculateBMR(form.weight, form.height, form.age, form.gender)
                          ),
                          form.activityLevel
                        ),
                        form.goal
                      )}{" "}
                      kcal
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  上一步
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
                >
                  开始使用
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
