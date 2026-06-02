import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FOODS } from "../data/foods";
import {
  MOCK_RECORDS,
  QuestionnaireRecord,
  DailyRecord as MockDailyRecord,
  MedicationRecord,
  SymptomRecord,
} from "../data/mockRecords";
import { transformKnowledgeArticles } from "../data/knowledge";
import type {
  ConstitutionResult,
  DailyRecord,
  Medicine,
  FoodItem,
  Symptom,
  ConstitutionScores,
  KnowledgeArticle,
} from "../types";

const reverseConstitutionTypeMap: Record<keyof ConstitutionScores, string> = {
  pinghe: "平和质",
  qixu: "气虚质",
  yangxu: "阳虚质",
  yinxu: "阴虚质",
  tanshi: "痰湿质",
  shire: "湿热质",
  xueyu: "血瘀质",
  qiyu: "气郁质",
  tebing: "特禀质",
};

function transformConstitutionScores(
  scores: Record<string, number>
): ConstitutionScores {
  return {
    pinghe: scores["平和质"] ?? 0,
    qixu: scores["气虚质"] ?? 0,
    yangxu: scores["阳虚质"] ?? 0,
    yinxu: scores["阴虚质"] ?? 0,
    tanshi: scores["痰湿质"] ?? 0,
    shire: scores["湿热质"] ?? 0,
    xueyu: scores["血瘀质"] ?? 0,
    qiyu: scores["气郁质"] ?? 0,
    tebing: scores["特禀质"] ?? 0,
  };
}

function getSubTypes(scores: ConstitutionScores, mainType: string): string[] {
  const threshold = 15;
  const subTypes: string[] = [];
  for (const [key, value] of Object.entries(scores)) {
    const typeName =
      reverseConstitutionTypeMap[key as keyof ConstitutionScores];
    if (typeName !== mainType && value >= threshold) {
      subTypes.push(typeName);
    }
  }
  return subTypes;
}

function transformConstitutionResult(
  record: QuestionnaireRecord
): ConstitutionResult {
  const scores = transformConstitutionScores(record.scores);
  const mainType = record.result;
  const subTypes = getSubTypes(scores, mainType);
  return {
    id: String(record.id),
    date: record.date,
    scores,
    mainType,
    subTypes,
    notes: record.note ?? "",
  };
}

function transformDailyRecord(record: MockDailyRecord): DailyRecord {
  return {
    id: String(record.id),
    date: record.date,
    diet: {
      breakfast: record.diet.breakfast,
      lunch: record.diet.lunch,
      dinner: record.diet.dinner,
      snacks: record.diet.snacks ?? "",
      compliance: 3,
    },
    sleep: {
      quality: record.sleep.quality,
      duration: record.sleep.duration,
      bedtime: record.sleep.bedtime,
      wakeTime: record.sleep.wakeup,
    },
    energy: {
      morning: record.energy,
      afternoon: record.energy,
      evening: record.energy,
    },
    symptoms: [],
  };
}

function transformMedicine(record: MedicationRecord): Medicine {
  return {
    id: String(record.id),
    name: record.name,
    type: record.type,
    dosage: `${record.dosage} ${record.frequency}`,
    startDate: record.startDate,
    endDate: record.endDate ?? "",
    effect: record.reason,
    notes: record.note ?? "",
    isActive: !record.endDate || new Date(record.endDate) > new Date(),
  };
}

function transformSymptom(record: SymptomRecord): Symptom {
  return {
    id: String(record.id),
    name: record.name,
    date: record.date,
    severity: record.severity,
    location: record.location ?? "",
    relatedConstitution: "",
    notes: record.note ?? "",
  };
}

function transformFoodItems(): FoodItem[] {
  return FOODS.map((food) => ({
    id: String(food.id),
    name: food.name,
    nature: food.nature,
    flavor: food.flavor,
    meridian: food.meridian.join("、"),
    effects: food.effects.join("、"),
    usage: food.usage,
    isFavorite: food.isFavorite,
  }));
}

interface AppState {
  constitutionResults: ConstitutionResult[];
  dailyRecords: DailyRecord[];
  medicines: Medicine[];
  foodItems: FoodItem[];
  favoriteFoods: string[];
  symptoms: Symptom[];
  currentAssessmentAnswers: number[];
  assessmentStep: number;
  favoriteArticles: string[];
  knowledgeArticles: KnowledgeArticle[];
  readArticles: string[];

  addConstitutionResult: (result: ConstitutionResult) => void;
  getLatestConstitutionResult: () => ConstitutionResult | undefined;
  addDailyRecord: (record: DailyRecord) => void;
  updateDailyRecord: (id: string, updates: Partial<DailyRecord>) => void;
  getDailyRecordByDate: (date: string) => DailyRecord | undefined;
  addMedicine: (medicine: Medicine) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  toggleFoodFavorite: (id: string) => void;
  addSymptom: (symptom: Symptom) => void;
  updateSymptom: (id: string, updates: Partial<Symptom>) => void;
  deleteSymptom: (id: string) => void;
  setAssessmentAnswer: (index: number, value: number) => void;
  resetAssessment: () => void;
  toggleArticleFavorite: (id: string) => void;
  markArticleRead: (id: string) => void;
  updateReadProgress: (id: string, progress: number) => void;
}

const initialFoodItems = transformFoodItems();

const initialConstitutionResults: ConstitutionResult[] =
  MOCK_RECORDS.questionnaireRecords.map(transformConstitutionResult);

const initialDailyRecords: DailyRecord[] =
  MOCK_RECORDS.dailyRecords.map(transformDailyRecord);

const initialMedicines: Medicine[] =
  MOCK_RECORDS.medicationRecords.map(transformMedicine);

const initialSymptoms: Symptom[] =
  MOCK_RECORDS.symptomRecords.map(transformSymptom);

const initialFavoriteFoods: string[] = initialFoodItems
  .filter((f) => f.isFavorite)
  .map((f) => f.id);

const initialKnowledgeArticles = transformKnowledgeArticles();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      constitutionResults: initialConstitutionResults,
      dailyRecords: initialDailyRecords,
      medicines: initialMedicines,
      foodItems: initialFoodItems,
      favoriteFoods: initialFavoriteFoods,
      symptoms: initialSymptoms,
      currentAssessmentAnswers: Array(60).fill(0),
      assessmentStep: 0,
      favoriteArticles: [],
      knowledgeArticles: initialKnowledgeArticles,
      readArticles: [],

      addConstitutionResult: (result) =>
        set((state) => ({
          constitutionResults: [...state.constitutionResults, result],
        })),

      getLatestConstitutionResult: () => {
        const results = get().constitutionResults;
        if (results.length === 0) return undefined;
        return [...results].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
      },

      addDailyRecord: (record) =>
        set((state) => ({
          dailyRecords: [...state.dailyRecords, record],
        })),

      updateDailyRecord: (id, updates) =>
        set((state) => ({
          dailyRecords: state.dailyRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      getDailyRecordByDate: (date) => {
        return get().dailyRecords.find((record) => record.date === date);
      },

      addMedicine: (medicine) =>
        set((state) => ({
          medicines: [...state.medicines, medicine],
        })),

      updateMedicine: (id, updates) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteMedicine: (id) =>
        set((state) => ({
          medicines: state.medicines.filter((m) => m.id !== id),
        })),

      toggleFoodFavorite: (id) =>
        set((state) => ({
          favoriteFoods: state.favoriteFoods.includes(id)
            ? state.favoriteFoods.filter((fid) => fid !== id)
            : [...state.favoriteFoods, id],
        })),

      addSymptom: (symptom) =>
        set((state) => ({
          symptoms: [...state.symptoms, symptom],
        })),

      updateSymptom: (id, updates) =>
        set((state) => ({
          symptoms: state.symptoms.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      deleteSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.filter((s) => s.id !== id),
        })),

      setAssessmentAnswer: (index, value) =>
        set((state) => {
          const answers = [...state.currentAssessmentAnswers];
          answers[index] = value;
          return { currentAssessmentAnswers: answers };
        }),

      resetAssessment: () =>
        set({
          currentAssessmentAnswers: Array(60).fill(0),
          assessmentStep: 0,
        }),

      toggleArticleFavorite: (id) =>
        set((state) => ({
          favoriteArticles: state.favoriteArticles.includes(id)
            ? state.favoriteArticles.filter((aid) => aid !== id)
            : [...state.favoriteArticles, id],
          knowledgeArticles: state.knowledgeArticles.map((article) =>
            article.id === id
              ? { ...article, isFavorite: !article.isFavorite }
              : article
          ),
        })),

      markArticleRead: (id) =>
        set((state) => ({
          readArticles: state.readArticles.includes(id)
            ? state.readArticles
            : [...state.readArticles, id],
        })),

      updateReadProgress: (id, progress) =>
        set((state) => ({
          knowledgeArticles: state.knowledgeArticles.map((article) =>
            article.id === id ? { ...article, readProgress: progress } : article
          ),
        })),
    }),
    {
      name: "app-storage",
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Hydration error:", error);
        } else if (state) {
          if (state.currentAssessmentAnswers.length !== 60) {
            state.currentAssessmentAnswers = Array(60).fill(0);
          }
        }
      },
    }
  )
);
