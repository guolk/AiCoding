"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/lib/ToastContext";
import { UserProfile } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  getActivityLevelLabel,
  getGoalLabel,
  getMacroPresetLabel,
  getMacroRatios,
  calculateNutritionTarget,
} from "@/lib/calculations";
import {
  Target,
  Edit3,
  Save,
  Calculator,
  Flame,
  Activity,
  Apple,
} from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function GoalManagement() {
  const { profile, setProfile } = useApp();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    age: profile?.age || 25,
    gender: (profile?.gender || "male") as "male" | "female",
    height: profile?.height || 170,
    weight: profile?.weight || 65,
    activityLevel: (profile?.activityLevel || "light") as UserProfile["activityLevel"],
    goal: (profile?.goal || "maintenance") as UserProfile["goal"],
    chronicCondition: profile?.chronicCondition || "",
    macroPreset: (profile?.macroPreset || "balanced") as UserProfile["macroPreset"],
    waterTarget: profile?.waterTarget || 2000,
    customProtein: profile?.customMacroRatios?.protein || 0.25,
    customCarbs: profile?.customMacroRatios?.carbs || 0.5,
    customFat: profile?.customMacroRatios?.fat || 0.25,
    useCustom: !!profile?.customMacroRatios,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
        chronicCondition: profile.chronicCondition || "",
        macroPreset: profile.macroPreset,
        waterTarget: profile.waterTarget,
        customProtein: profile.customMacroRatios?.protein || 0.25,
        customCarbs: profile.customMacroRatios?.carbs || 0.5,
        customFat: profile.customMacroRatios?.fat || 0.25,
        useCustom: !!profile.customMacroRatios,
      });
    }
  }, [profile]);

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const previewBMR = Math.round(
    calculateBMR(form.weight, form.height, form.age, form.gender)
  );
  const previewTDEE = calculateTDEE(previewBMR, form.activityLevel);
  const previewTarget = calculateTargetCalories(previewTDEE, form.goal);

  const handleSave = () => {
    if (!profile) return;
    setSaving(true);

    setTimeout(() => {
      try {
        const customMacroRatios = form.useCustom
          ? {
              protein: form.customProtein,
              carbs: form.customCarbs,
              fat: form.customFat,
            }
          : undefined;

        const updated: UserProfile = {
          ...profile,
          age: form.age,
          gender: form.gender,
          height: form.height,
          weight: form.weight,
          activityLevel: form.activityLevel,
          goal: form.goal,
          chronicCondition: form.goal === "chronic_condition" ? form.chronicCondition : undefined,
          macroPreset: form.macroPreset,
          waterTarget: form.waterTarget,
          bmr: previewBMR,
          tdee: previewTDEE,
          targetCalories: previewTarget,
          customMacroRatios,
        };
        setProfile(updated);
        setEditing(false);
        showToast("目标设置已保存成功！", "success");
      } catch (error) {
        showToast("保存失败，请重试", "error");
      } finally {
        setSaving(false);
      }
    }, 300);
  };

  const currentRatios = getMacroRatios(
    form.macroPreset,
    form.useCustom
      ? {
          protein: form.customProtein,
          carbs: form.customCarbs,
          fat: form.customFat,
        }
      : undefined
  );

  const previewTargetNutrients = profile
    ? calculateNutritionTarget({
        ...profile,
        targetCalories: previewTarget,
        macroPreset: form.macroPreset,
        customMacroRatios: form.useCustom
          ? {
              protein: form.customProtein,
              carbs: form.customCarbs,
              fat: form.customFat,
            }
          : undefined,
      })
    : null;

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">目标管理</h2>
              <p className="text-sm text-slate-500">设置和调整你的健康目标</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              editing
                ? "bg-slate-100 text-slate-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            {editing ? (
              <>
                <Save className="w-4 h-4" />
                取消
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                编辑
              </>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-600">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">年龄</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update("age", +e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">性别</label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">身高 (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => update("height", +e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => update("weight", +e.target.value)}
                  disabled={!editing}
                  step={0.1}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-2">活动水平</label>
              <select
                value={form.activityLevel}
                onChange={(e) => update("activityLevel", e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
              >
                {(["sedentary", "light", "moderate", "active", "very_active"] as const).map(
                  (l) => (
                    <option key={l} value={l}>
                      {getActivityLevelLabel(l)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-2">健康目标</label>
              <select
                value={form.goal}
                onChange={(e) => update("goal", e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500"
              >
                {(["weight_loss", "muscle_gain", "maintenance", "chronic_condition"] as const).map(
                  (g) => (
                    <option key={g} value={g}>
                      {getGoalLabel(g)}
                    </option>
                  )
                )}
              </select>
            </div>

            {form.goal === "chronic_condition" && (
              <div>
                <label className="block text-sm text-slate-500 mb-1">
                  慢性病名称
                </label>
                <input
                  type="text"
                  value={form.chronicCondition}
                  onChange={(e) => update("chronicCondition", e.target.value)}
                  disabled={!editing}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-600">代谢计算</h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">基础代谢率 (BMR)</span>
                </div>
                <span className="font-medium text-slate-800">{previewBMR} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">每日总消耗 (TDEE)</span>
                </div>
                <span className="font-medium text-slate-800">{previewTDEE} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-slate-500">目标热量</span>
                </div>
                <span className="font-bold text-primary-600 text-lg">
                  {previewTarget} kcal
                </span>
              </div>
            </div>

            <h3 className="text-sm font-medium text-slate-600">饮食模式</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["balanced", "keto", "low_carb", "high_protein", "vegetarian"] as const).map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      if (editing) {
                        update("macroPreset", preset);
                        update("useCustom", false);
                      }
                    }}
                    disabled={!editing}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      form.macroPreset === preset && !form.useCustom
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } disabled:cursor-not-allowed`}
                  >
                    {getMacroPresetLabel(preset)}
                  </button>
                )
              )}
            </div>

            {editing && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.useCustom}
                    onChange={(e) => update("useCustom", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  使用自定义宏量比例
                </label>
                {form.useCustom && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="flex justify-between text-sm text-slate-500 mb-1">
                        <span>蛋白质</span>
                        <span>{(form.customProtein * 100).toFixed(0)}%</span>
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={0.6}
                        step={0.05}
                        value={form.customProtein}
                        onChange={(e) => {
                          const val = +e.target.value;
                          update("customProtein", val);
                          update("customCarbs", +(1 - val - form.customFat).toFixed(2));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm text-slate-500 mb-1">
                        <span>碳水</span>
                        <span>{(form.customCarbs * 100).toFixed(0)}%</span>
                      </label>
                      <input
                        type="range"
                        min={0.05}
                        max={0.7}
                        step={0.05}
                        value={form.customCarbs}
                        onChange={(e) => {
                          const val = +e.target.value;
                          update("customCarbs", val);
                          update("customFat", +(1 - val - form.customProtein).toFixed(2));
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm text-slate-500 mb-1">
                        <span>脂肪</span>
                        <span>{(form.customFat * 100).toFixed(0)}%</span>
                      </label>
                      <input
                        type="range"
                        min={0.1}
                        max={0.75}
                        step={0.05}
                        value={form.customFat}
                        onChange={(e) => {
                          const val = +e.target.value;
                          update("customFat", val);
                          update("customCarbs", +(1 - val - form.customProtein).toFixed(2));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-500 mb-1">
                每日饮水目标 (ml)
              </label>
              <input
                type="number"
                value={form.waterTarget}
                onChange={(e) => update("waterTarget", +e.target.value)}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  保存更改
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          每日目标营养素
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-slate-500">热量</span>
            </div>
            <div className="text-xl font-bold text-slate-800">{previewTarget}</div>
            <div className="text-xs text-slate-400">kcal</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Apple className="w-4 h-4 text-green-500" />
              <span className="text-sm text-slate-500">蛋白质</span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              {previewTargetNutrients?.protein}
            </div>
            <div className="text-xs text-slate-400">g ({(currentRatios.protein * 100).toFixed(0)}%)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Apple className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-500">碳水</span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              {previewTargetNutrients?.carbs}
            </div>
            <div className="text-xs text-slate-400">g ({(currentRatios.carbs * 100).toFixed(0)}%)</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Apple className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-slate-500">脂肪</span>
            </div>
            <div className="text-xl font-bold text-slate-800">
              {previewTargetNutrients?.fat}
            </div>
            <div className="text-xs text-slate-400">g ({(currentRatios.fat * 100).toFixed(0)}%)</div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-600 mb-3">宏量比例可视化</h4>
          <div className="flex rounded-full overflow-hidden h-6">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${currentRatios.protein * 100}%` }}
            >
              {(currentRatios.protein * 100).toFixed(0)}%
            </div>
            <div
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${currentRatios.carbs * 100}%` }}
            >
              {(currentRatios.carbs * 100).toFixed(0)}%
            </div>
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${currentRatios.fat * 100}%` }}
            >
              {(currentRatios.fat * 100).toFixed(0)}%
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500 justify-center">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />蛋白质
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />碳水
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />脂肪
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
