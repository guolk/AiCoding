"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import Dashboard from "@/components/Dashboard";
import FoodRecord from "@/components/FoodRecord";
import NutritionAnalysis from "@/components/NutritionAnalysis";
import GoalManagement from "@/components/GoalManagement";
import HabitsAnalysis from "@/components/HabitsAnalysis";
import FoodReactionLog from "@/components/FoodReactionLog";
import ProfileSetup from "@/components/ProfileSetup";
import DemoDataButton from "@/components/DemoDataButton";
import { Leaf, Utensils, BarChart3, Target, Activity, Heart, Menu, X } from "lucide-react";

type Tab = "dashboard" | "food" | "analysis" | "goals" | "habits" | "reactions";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "仪表盘", icon: <Leaf className="w-5 h-5" /> },
  { id: "food", label: "饮食记录", icon: <Utensils className="w-5 h-5" /> },
  { id: "analysis", label: "营养分析", icon: <BarChart3 className="w-5 h-5" /> },
  { id: "goals", label: "目标管理", icon: <Target className="w-5 h-5" /> },
  { id: "habits", label: "习惯分析", icon: <Activity className="w-5 h-5" /> },
  { id: "reactions", label: "食物关联", icon: <Heart className="w-5 h-5" /> },
];

export default function Home() {
  const { profile } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!profile) {
    return <ProfileSetup />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "food":
        return <FoodRecord />;
      case "analysis":
        return <NutritionAnalysis />;
      case "goals":
        return <GoalManagement />;
      case "habits":
        return <HabitsAnalysis />;
      case "reactions":
        return <FoodReactionLog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl shadow-sm p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-card flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              健康饮食追踪
            </h1>
            <p className="text-sm text-slate-500">记录每一口，关爱每一餐</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile && <DemoDataButton />}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      <nav className="hidden md:flex bg-white rounded-2xl shadow-sm p-2 gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {mobileMenuOpen && (
        <nav className="md:hidden bg-white rounded-2xl shadow-sm p-2 grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <main>{renderContent()}</main>
    </div>
  );
}
