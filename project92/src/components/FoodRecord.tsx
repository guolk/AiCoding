"use client";

import React, { useState, useRef, useCallback } from "react";
import { FoodItem, MealEntry } from "@/lib/types";
import { useApp } from "@/lib/AppContext";
import { searchFood, searchByBarcode, getMockFoods } from "@/lib/foodApi";
import {
  generateId,
  getMealTypeLabel,
  isHighCalorieLowNutrient,
} from "@/lib/calculations";
import {
  Search,
  Camera,
  Barcode,
  Star,
  Plus,
  X,
  Utensils,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function FoodRecord() {
  const { addMeal, favorites, addFavorite, removeFavorite } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState<MealEntry["mealType"]>("breakfast");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchFood(query);
      setSearchResults(results.length > 0 ? results : getMockFoods(query));
    } catch {
      setSearchResults(getMockFoods(query));
    }
    setSearching(false);
  }, []);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => handleSearch(query), 400);
    },
    [handleSearch]
  );

  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) return;
    setSearching(true);
    const result = await searchByBarcode(barcode);
    if (result) {
      setSearchResults([result]);
    } else {
      setSearchResults(getMockFoods(barcode));
    }
    setSearching(false);
    setShowBarcodeInput(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoUrl(ev.target?.result as string);
        setShowPhotoInput(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQuantity(food.servingSize);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirmMeal = () => {
    if (!selectedFood) return;
    const meal: MealEntry = {
      id: generateId(),
      foodItem: { ...selectedFood, isFavorite: undefined },
      quantity,
      mealType,
      timestamp: new Date().toISOString(),
      photoUrl: photoUrl || undefined,
    };
    addMeal(meal);
    setSelectedFood(null);
    setPhotoUrl(null);
    setQuantity(100);
  };

  const toggleFavorite = (food: FoodItem) => {
    const isFav = favorites.some((f) => f.id === food.id);
    if (isFav) {
      removeFavorite(food.id);
    } else {
      addFavorite(food);
    }
  };

  const displayFoods = showFavorites
    ? favorites
    : searchResults;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">添加食物</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setShowFavorites(false);
              setShowBarcodeInput(false);
              setShowPhotoInput(false);
              setSearchResults([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !showFavorites && !showBarcodeInput && !showPhotoInput
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Search className="w-4 h-4" />
            搜索
          </button>
          <button
            onClick={() => {
              setShowFavorites(true);
              setShowBarcodeInput(false);
              setShowPhotoInput(false);
              setSearchResults([]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showFavorites
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Star className="w-4 h-4" />
            收藏 ({favorites.length})
          </button>
          <button
            onClick={() => {
              setShowBarcodeInput(!showBarcodeInput);
              setShowPhotoInput(false);
              setShowFavorites(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showBarcodeInput
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Barcode className="w-4 h-4" />
            条形码
          </button>
          <button
            onClick={() => {
              setShowPhotoInput(!showPhotoInput);
              setShowBarcodeInput(false);
              setShowFavorites(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showPhotoInput
                ? "bg-primary-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            拍照
          </button>
        </div>

        {!showFavorites && !showBarcodeInput && !showPhotoInput && (
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="搜索食物名称..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
        )}

        {showBarcodeInput && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="输入条形码..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeSearch()}
            />
            <button
              onClick={handleBarcodeSearch}
              className="px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
            >
              搜索
            </button>
          </div>
        )}

        {showPhotoInput && (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 rounded-xl border-2 border-dashed border-slate-300 hover:border-primary-500 transition-colors flex flex-col items-center gap-2 text-slate-500 hover:text-primary-500"
            >
              <Camera className="w-8 h-8" />
              <span className="text-sm">点击拍照或上传图片</span>
            </button>
          </div>
        )}

        {photoUrl && (
          <div className="relative mb-4 rounded-xl overflow-hidden">
            <img src={photoUrl} alt="Food" className="w-full h-40 object-cover" />
            <button
              onClick={() => setPhotoUrl(null)}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
              请选择对应的食物
            </div>
          </div>
        )}

        {(displayFoods.length > 0 || searching) && (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {searching && (
              <div className="text-center py-4 text-slate-400 text-sm">
                搜索中...
              </div>
            )}
            {displayFoods.map((food) => {
              const isFav = favorites.some((f) => f.id === food.id);
              const isHighCalLowNut = isHighCalorieLowNutrient(food);
              return (
                <div
                  key={food.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
                  onClick={() => handleSelectFood(food)}
                >
                  {food.imageUrl && (
                    <img
                      src={food.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800 text-sm truncate">
                      {food.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {food.servingSize}
                      {food.servingUnit} · {food.nutrients.calories} kcal
                    </div>
                    {isHighCalLowNut && (
                      <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        高热量低营养
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(food);
                    }}
                    className={`p-2 rounded-lg ${
                      isFav
                        ? "text-yellow-500 bg-yellow-50"
                        : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!searching && displayFoods.length === 0 && !selectedFood && (
          <div className="text-center py-8 text-slate-400 text-sm">
            {showFavorites
              ? "暂无收藏的食物"
              : "搜索或选择添加方式开始记录"}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">确认添加</h2>

        {selectedFood ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              {selectedFood.imageUrl && (
                <img
                  src={selectedFood.imageUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div>
                <div className="font-semibold text-slate-800">
                  {selectedFood.name}
                </div>
                {selectedFood.brand && (
                  <div className="text-xs text-slate-500">{selectedFood.brand}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                份量 ({selectedFood.servingUnit})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(+e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                min={1}
                step={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                餐次
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all ${
                      mealType === type
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {getMealTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-medium text-slate-600">
                预计营养摄入
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">热量</span>
                  <span className="font-medium text-slate-800">
                    {(
                      selectedFood.nutrients.calories *
                      (quantity / selectedFood.servingSize)
                    ).toFixed(0)}{" "}
                    kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">蛋白质</span>
                  <span className="font-medium text-slate-800">
                    {(
                      selectedFood.nutrients.protein *
                      (quantity / selectedFood.servingSize)
                    ).toFixed(1)}{" "}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">碳水</span>
                  <span className="font-medium text-slate-800">
                    {(
                      selectedFood.nutrients.carbs *
                      (quantity / selectedFood.servingSize)
                    ).toFixed(1)}{" "}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">脂肪</span>
                  <span className="font-medium text-slate-800">
                    {(
                      selectedFood.nutrients.fat *
                      (quantity / selectedFood.servingSize)
                    ).toFixed(1)}{" "}
                    g
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedFood(null);
                  setPhotoUrl(null);
                }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmMeal}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">从左侧选择食物开始记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
