import { FoodItem, Nutrients } from "./types";
import { generateId } from "./calculations";

const OFF_API_BASE = "https://world.openfoodfacts.org";

export async function searchFood(query: string): Promise<FoodItem[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `${OFF_API_BASE}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20`
    );
    const data = await res.json();
    if (!data.products) return [];
    return data.products.slice(0, 20).map(parseOFFProduct);
  } catch (e) {
    console.error("Search food failed:", e);
    return getMockFoods(query);
  }
}

export async function searchByBarcode(barcode: string): Promise<FoodItem | null> {
  try {
    const res = await fetch(`${OFF_API_BASE}/api/v0/product/${barcode}.json`);
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    return parseOFFProduct(data.product);
  } catch (e) {
    console.error("Barcode search failed:", e);
    return null;
  }
}

function parseOFFProduct(product: any): FoodItem {
  const nutriments = product.nutriments || {};
  const servingSize =
    parseFloat(product.serving_quantity) ||
    parseFloat(product.product_quantity) ||
    100;
  const servingUnit = product.serving_size?.match(/[a-zA-Z]+/)?.[0] || "g";
  const factor = servingSize / 100;

  const nutrients: Nutrients = {
    calories: Math.round((nutriments["energy-kcal"] || nutriments.energy || 0) * factor),
    protein: +(nutriments.proteins || 0).toFixed(1),
    fat: +(nutriments.fat || 0).toFixed(1),
    carbs: +(nutriments.carbohydrates || 0).toFixed(1),
    fiber: +(nutriments.fiber || 0).toFixed(1),
    vitaminA: +((nutriments["vitamin-a"] || 0) * 1000).toFixed(0),
    vitaminC: +(nutriments["vitamin-c"] || 0).toFixed(1),
    vitaminD: +(nutriments["vitamin-d"] || 0).toFixed(1),
    calcium: +(nutriments.calcium || 0).toFixed(1),
    iron: +(nutriments.iron || 0).toFixed(1),
    magnesium: +(nutriments.magnesium || 0).toFixed(1),
    potassium: +(nutriments.potassium || 0).toFixed(1),
    sodium: +(nutriments.sodium || 0).toFixed(1),
  };

  return {
    id: product.code || generateId(),
    name: product.product_name || product.generic_name || "未知食物",
    brand: product.brands || undefined,
    servingSize,
    servingUnit,
    nutrients,
    barcode: product.code || undefined,
    imageUrl: product.image_url || product.image_small_url || undefined,
    source: "openfoodfacts",
    isFavorite: false,
  };
}

const MOCK_FOODS: FoodItem[] = [
  {
    id: "mock-1",
    name: "鸡胸肉",
    brand: "新鲜",
    servingSize: 100,
    servingUnit: "g",
    nutrients: { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, vitaminA: 6, vitaminC: 0, vitaminD: 0, calcium: 15, iron: 1.3, magnesium: 28, potassium: 256, sodium: 74 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-2",
    name: "糙米",
    servingSize: 100,
    servingUnit: "g",
    nutrients: { calories: 216, protein: 5, fat: 1.8, carbs: 45, fiber: 3.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 10, iron: 1.2, magnesium: 43, potassium: 150, sodium: 5 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-3",
    name: "西兰花",
    servingSize: 100,
    servingUnit: "g",
    nutrients: { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6, vitaminA: 31, vitaminC: 89, vitaminD: 0, calcium: 47, iron: 0.7, magnesium: 21, potassium: 316, sodium: 33 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-4",
    name: "鸡蛋",
    servingSize: 50,
    servingUnit: "g",
    nutrients: { calories: 78, protein: 6.3, fat: 5.3, carbs: 0.6, fiber: 0, vitaminA: 80, vitaminC: 0, vitaminD: 0.9, calcium: 28, iron: 0.9, magnesium: 6, potassium: 69, sodium: 71 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-5",
    name: "牛奶",
    servingSize: 250,
    servingUnit: "ml",
    nutrients: { calories: 150, protein: 8, fat: 8, carbs: 12, fiber: 0, vitaminA: 150, vitaminC: 0, vitaminD: 3.2, calcium: 300, iron: 0, magnesium: 27, potassium: 380, sodium: 130 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-6",
    name: "三文鱼",
    servingSize: 100,
    servingUnit: "g",
    nutrients: { calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0, vitaminA: 12, vitaminC: 0, vitaminD: 13, calcium: 9, iron: 0.5, magnesium: 27, potassium: 490, sodium: 59 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-7",
    name: "燕麦片",
    servingSize: 40,
    servingUnit: "g",
    nutrients: { calories: 150, protein: 5.9, fat: 2.7, carbs: 27, fiber: 4, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 20, iron: 1.4, magnesium: 54, potassium: 144, sodium: 2 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-8",
    name: "香蕉",
    servingSize: 120,
    servingUnit: "g",
    nutrients: { calories: 107, protein: 1.3, fat: 0.4, carbs: 27, fiber: 3.1, vitaminA: 3, vitaminC: 8.7, vitaminD: 0, calcium: 5, iron: 0.3, magnesium: 27, potassium: 422, sodium: 1 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-9",
    name: "全麦面包",
    servingSize: 30,
    servingUnit: "g",
    nutrients: { calories: 74, protein: 3.6, fat: 1, carbs: 13, fiber: 2, vitaminA: 0, vitaminC: 0, vitaminD: 0, calcium: 15, iron: 1, magnesium: 24, potassium: 71, sodium: 170 },
    source: "custom",
    isFavorite: false,
  },
  {
    id: "mock-10",
    name: "牛油果",
    servingSize: 150,
    servingUnit: "g",
    nutrients: { calories: 240, protein: 3, fat: 22, carbs: 12, fiber: 10, vitaminA: 7, vitaminC: 15, vitaminD: 0, calcium: 18, iron: 0.9, magnesium: 44, potassium: 727, sodium: 14 },
    source: "custom",
    isFavorite: false,
  },
];

export function getMockFoods(query?: string): FoodItem[] {
  if (!query) return MOCK_FOODS;
  const q = query.toLowerCase();
  return MOCK_FOODS.filter(
    (f) => f.name.toLowerCase().includes(q) || f.brand?.toLowerCase().includes(q)
  );
}
