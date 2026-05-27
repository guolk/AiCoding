"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { useToast } from "@/lib/ToastContext";
import { FoodReaction } from "@/lib/types";
import { generateId, formatDate } from "@/lib/calculations";
import {
  Heart,
  Plus,
  Smile,
  Meh,
  Frown,
  Zap,
  Search,
  Filter,
} from "lucide-react";

export default function FoodReactionLog() {
  const { meals, reactions, addReaction } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [selectedFoodName, setSelectedFoodName] = useState("");
  const [saving, setSaving] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [digestion, setDigestion] = useState<"good" | "normal" | "bad">("normal");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [filterDigestion, setFilterDigestion] = useState<"all" | "good" | "normal" | "bad">(
    "all"
  );

  const uniqueFoods = useMemo(() => {
    const seen = new Set<string>();
    return meals
      .filter((m) => {
        if (seen.has(m.foodItem.id)) return false;
        seen.add(m.foodItem.id);
        return true;
      })
      .map((m) => ({ id: m.foodItem.id, name: m.foodItem.name }))
      .slice(0, 50);
  }, [meals]);

  const handleSubmit = () => {
    if (!selectedFoodId || !selectedFoodName) {
      showToast("请选择一个食物", "error");
      return;
    }
    setSaving(true);

    setTimeout(() => {
      try {
        const reaction: FoodReaction = {
          id: generateId(),
          foodItemId: selectedFoodId,
          foodItemName: selectedFoodName,
          timestamp: new Date().toISOString(),
          energyLevel,
          digestion,
          symptoms: symptoms.length > 0 ? symptoms : undefined,
          notes: notes || undefined,
        };
        addReaction(reaction);
        showToast("记录已保存成功！", "success");
        setShowForm(false);
        setSelectedFoodId("");
        setSelectedFoodName("");
        setEnergyLevel(3);
        setDigestion("normal");
        setSymptoms([]);
        setNotes("");
      } catch (error) {
        showToast("保存失败，请重试", "error");
      } finally {
        setSaving(false);
      }
    }, 300);
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const filteredReactions = useMemo(() => {
    let filtered = [...reactions];
    if (filterDigestion !== "all") {
      filtered = filtered.filter((r) => r.digestion === filterDigestion);
    }
    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [reactions, filterDigestion]);

  const reactionStats = useMemo(() => {
    const foodStats: Record<
      string,
      { count: number; avgEnergy: number; goodCount: number; badCount: number }
    > = {};
    reactions.forEach((r) => {
      if (!foodStats[r.foodItemName]) {
        foodStats[r.foodItemName] = {
          count: 0,
          avgEnergy: 0,
          goodCount: 0,
          badCount: 0,
        };
      }
      foodStats[r.foodItemName].count++;
      foodStats[r.foodItemName].avgEnergy += r.energyLevel;
      if (r.digestion === "good") foodStats[r.foodItemName].goodCount++;
      if (r.digestion === "bad") foodStats[r.foodItemName].badCount++;
    });
    return Object.entries(foodStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgEnergy: stats.avgEnergy / stats.count,
        goodRatio: (stats.goodCount / stats.count) * 100,
        badRatio: (stats.badCount / stats.count) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reactions]);

  const commonSymptoms = [
    "腹胀",
    "腹痛",
    "恶心",
    "头痛",
    "疲劳",
    "皮疹",
    "腹泻",
    "便秘",
    "烧心",
    "水肿",
  ];

  const EnergyIcon = ({ level, selected }: { level: number; selected: boolean }) => {
    const icon = level >= 4 ? <Zap className="w-5 h-5" /> : level <= 2 ? <Frown className="w-5 h-5" /> : <Meh className="w-5 h-5" />;
    return (
      <button
        onClick={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
        className={`p-3 rounded-xl transition-all ${
          selected
            ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {icon}
        <div className="text-xs mt-1">{level}</div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                食物与身体感受日志
              </h2>
              <p className="text-xs text-slate-500">
                记录吃了某种食物后的身体反应
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showForm
                ? "bg-slate-100 text-slate-600"
                : "bg-primary-500 text-white hover:bg-primary-600"
            }`}
          >
            <Plus className="w-4 h-4" />
            {showForm ? "取消" : "添加记录"}
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-50 rounded-xl p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                选择食物
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedFoodId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedFoodId(value);
                    if (value) {
                      const food = uniqueFoods.find((f) => f.id === value);
                      if (food) {
                        setSelectedFoodName(food.name);
                      }
                    } else {
                      setSelectedFoodName("");
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none bg-white appearance-none"
                >
                  <option value="">-- 选择食物 --</option>
                  {uniqueFoods.length === 0 ? (
                    <option value="">先在饮食记录中添加食物</option>
                  ) : (
                    uniqueFoods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                精力水平
              </label>
              <div className="flex gap-2 justify-between">
                <EnergyIcon level={1} selected={energyLevel === 1} />
                <EnergyIcon level={2} selected={energyLevel === 2} />
                <EnergyIcon level={3} selected={energyLevel === 3} />
                <EnergyIcon level={4} selected={energyLevel === 4} />
                <EnergyIcon level={5} selected={energyLevel === 5} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>很低</span>
                <span>一般</span>
                <span>充沛</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                消化情况
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDigestion("good")}
                  className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    digestion === "good"
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Smile className="w-5 h-5" />
                  良好
                </button>
                <button
                  onClick={() => setDigestion("normal")}
                  className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    digestion === "normal"
                      ? "bg-yellow-500 text-white shadow-lg shadow-yellow-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Meh className="w-5 h-5" />
                  一般
                </button>
                <button
                  onClick={() => setDigestion("bad")}
                  className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    digestion === "bad"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Frown className="w-5 h-5" />
                  不佳
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                不适症状（可选）
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      symptoms.includes(symptom)
                        ? "bg-red-100 text-red-600 border border-red-300"
                        : "bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                备注（可选）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="记录其他感受..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none"
                rows={3}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedFoodId || saving}
              className="w-full py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                "保存记录"
              )}
            </button>
          </div>
        )}
      </div>

      {reactionStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            食物反应统计
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {reactionStats.map((stat) => (
              <div key={stat.name} className="bg-slate-50 rounded-xl p-4">
                <div className="font-medium text-slate-800 text-sm truncate mb-2">
                  {stat.name}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {stat.count} 次记录
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-slate-600">
                    平均精力 {stat.avgEnergy.toFixed(1)}
                  </span>
                </div>
                {stat.badRatio > 50 && (
                  <div className="text-xs text-red-500">⚠️ 多为不良反应</div>
                )}
                {stat.goodRatio > 70 && (
                  <div className="text-xs text-green-500">✓ 适合食用</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">
            记录历史
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterDigestion}
              onChange={(e) =>
                setFilterDigestion(
                  e.target.value as "all" | "good" | "normal" | "bad"
                )
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white"
            >
              <option value="all">全部</option>
              <option value="good">良好</option>
              <option value="normal">一般</option>
              <option value="bad">不佳</option>
            </select>
          </div>
        </div>

        {filteredReactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">还没有记录，开始记录你的身体感受吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="p-4 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-slate-800">
                    {reaction.foodItemName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(reaction.timestamp).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-slate-600">
                      精力 {reaction.energyLevel}/5
                    </span>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      reaction.digestion === "good"
                        ? "bg-green-100 text-green-700"
                        : reaction.digestion === "normal"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {reaction.digestion === "good"
                      ? "消化良好"
                      : reaction.digestion === "normal"
                      ? "消化一般"
                      : "消化不佳"}
                  </div>
                </div>
                {reaction.symptoms && reaction.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reaction.symptoms.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {reaction.notes && (
                  <div className="mt-2 text-sm text-slate-500 italic">
                    "{reaction.notes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
