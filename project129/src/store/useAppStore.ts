import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserProfile, KanaProgress, KanjiProgress, GrammarProgress,
  VocabularyItem, ExampleSentence, MockExam, ListeningRecord,
  SpeakingRecord, DiaryEntry, ExamHistory, JLPTLevel, MasteryStatus
} from '@/types';
import { createInitialKanaProgress } from '@/data/kana';
import { createInitialKanjiProgress } from '@/data/kanji';
import { createInitialGrammarProgress } from '@/data/grammar';
import { createInitialVocabulary } from '@/data/vocabulary';
import { generateId, todayISO } from '@/utils/helpers';
import { calculateSM2, isDueForReview } from '@/utils/sm2';

const LEVEL_ORDER: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

interface AppState {
  profile: UserProfile;
  kanaProgress: KanaProgress[];
  kanjiProgress: KanjiProgress[];
  grammarProgress: GrammarProgress[];
  vocabulary: VocabularyItem[];
  sentences: ExampleSentence[];
  mockExams: MockExam[];
  listeningRecords: ListeningRecord[];
  speakingRecords: SpeakingRecord[];
  diaryEntries: DiaryEntry[];
  examHistory: ExamHistory[];

  setupProfile: (level: JLPTLevel, examDate: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  updateKanaStatus: (id: string, status: MasteryStatus, correct: boolean) => void;

  updateKanjiStatus: (id: string, status: MasteryStatus) => void;

  updateGrammarStatus: (id: string, status: MasteryStatus) => void;

  addVocabulary: (word: string, reading: string, meaning: string, level: JLPTLevel) => void;
  updateVocabularyStatus: (id: string, status: MasteryStatus) => void;
  reviewVocabulary: (id: string, quality: number) => void;
  getDueVocabulary: () => VocabularyItem[];

  addSentence: (vocabularyId: string, sentence: string, translation: string) => void;
  deleteSentence: (id: string) => void;

  addMockExam: (exam: Omit<MockExam, 'id'>) => void;
  deleteMockExam: (id: string) => void;

  addListeningRecord: (record: Omit<ListeningRecord, 'id'>) => void;
  updateListeningRecord: (id: string, updates: Partial<ListeningRecord>) => void;
  deleteListeningRecord: (id: string) => void;

  addSpeakingRecord: (record: Omit<SpeakingRecord, 'id'>) => void;
  deleteSpeakingRecord: (id: string) => void;

  addDiaryEntry: (content: string) => void;
  updateDiaryEntry: (id: string, content: string) => void;
  deleteDiaryEntry: (id: string) => void;

  addExamHistory: (exam: Omit<ExamHistory, 'id'>) => void;
  deleteExamHistory: (id: string) => void;

  getStats: () => {
    kanaMastered: number;
    kanaTotal: number;
    kanjiMastered: number;
    kanjiTotal: number;
    kanjiLearning: number;
    grammarMastered: number;
    grammarTotal: number;
    grammarLearning: number;
    vocabMastered: number;
    vocabTotal: number;
    vocabLearning: number;
    dueReviews: number;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: { id: generateId(), targetLevel: 'N3', examDate: '', createdAt: todayISO(), isSetup: false },
      kanaProgress: [],
      kanjiProgress: [],
      grammarProgress: [],
      vocabulary: [],
      sentences: [],
      mockExams: [],
      listeningRecords: [],
      speakingRecords: [],
      diaryEntries: [],
      examHistory: [],

      setupProfile: (level, examDate) => {
        const levelIndex = LEVEL_ORDER.indexOf(level);
        const levelsToInit = LEVEL_ORDER.slice(0, levelIndex + 1);
        const kana = [...createInitialKanaProgress('hiragana'), ...createInitialKanaProgress('katakana')];
        const kanji = levelsToInit.flatMap(lvl => createInitialKanjiProgress(lvl));
        const grammar = levelsToInit.flatMap(lvl => createInitialGrammarProgress(lvl));
        const vocabulary = levelsToInit.flatMap(lvl => createInitialVocabulary(lvl));
        set(state => ({
          profile: { ...state.profile, targetLevel: level, examDate, isSetup: true },
          kanaProgress: kana,
          kanjiProgress: kanji,
          grammarProgress: grammar,
          vocabulary,
        }));
      },

      updateProfile: (updates) => {
        set(state => ({ profile: { ...state.profile, ...updates } }));
      },

      updateKanaStatus: (id, status, correct) => {
        set(state => ({
          kanaProgress: state.kanaProgress.map(k =>
            k.id === id
              ? {
                  ...k,
                  status,
                  lastTested: todayISO(),
                  correctCount: correct ? k.correctCount + 1 : k.correctCount,
                  totalTests: k.totalTests + 1,
                }
              : k
          ),
        }));
      },

      updateKanjiStatus: (id, status) => {
        set(state => ({
          kanjiProgress: state.kanjiProgress.map(k =>
            k.id === id ? { ...k, status, lastStudied: todayISO() } : k
          ),
        }));
      },

      updateGrammarStatus: (id, status) => {
        set(state => ({
          grammarProgress: state.grammarProgress.map(g =>
            g.id === id ? { ...g, status, lastStudied: todayISO() } : g
          ),
        }));
      },

      addVocabulary: (word, reading, meaning, level) => {
        const today = todayISO();
        const newItem: VocabularyItem = {
          id: generateId(),
          word,
          reading,
          meaning,
          level,
          status: 'unlearned',
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: today,
          addedDate: today,
        };
        set(state => ({ vocabulary: [...state.vocabulary, newItem] }));
      },

      updateVocabularyStatus: (id, status) => {
        set(state => ({
          vocabulary: state.vocabulary.map(v =>
            v.id === id ? { ...v, status } : v
          ),
        }));
      },

      reviewVocabulary: (id, quality) => {
        set(state => ({
          vocabulary: state.vocabulary.map(v =>
            v.id === id ? { ...v, ...calculateSM2(v, quality) } : v
          ),
        }));
      },

      getDueVocabulary: () => {
        return get().vocabulary.filter(isDueForReview);
      },

      addSentence: (vocabularyId, sentence, translation) => {
        const newSentence: ExampleSentence = {
          id: generateId(),
          vocabularyId,
          sentence,
          translation,
          createdAt: todayISO(),
        };
        set(state => ({ sentences: [...state.sentences, newSentence] }));
      },

      deleteSentence: (id) => {
        set(state => ({ sentences: state.sentences.filter(s => s.id !== id) }));
      },

      addMockExam: (exam) => {
        set(state => ({
          mockExams: [...state.mockExams, { ...exam, id: generateId() }],
        }));
      },

      deleteMockExam: (id) => {
        set(state => ({ mockExams: state.mockExams.filter(e => e.id !== id) }));
      },

      addListeningRecord: (record) => {
        set(state => ({
          listeningRecords: [...state.listeningRecords, { ...record, id: generateId() }],
        }));
      },

      updateListeningRecord: (id, updates) => {
        set(state => ({
          listeningRecords: state.listeningRecords.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteListeningRecord: (id) => {
        set(state => ({ listeningRecords: state.listeningRecords.filter(r => r.id !== id) }));
      },

      addSpeakingRecord: (record) => {
        set(state => ({
          speakingRecords: [...state.speakingRecords, { ...record, id: generateId() }],
        }));
      },

      deleteSpeakingRecord: (id) => {
        set(state => ({ speakingRecords: state.speakingRecords.filter(r => r.id !== id) }));
      },

      addDiaryEntry: (content) => {
        const newEntry: DiaryEntry = {
          id: generateId(),
          content,
          date: todayISO(),
          wordCount: content.split(/\s+/).filter(Boolean).length,
        };
        set(state => ({ diaryEntries: [...state.diaryEntries, newEntry] }));
      },

      updateDiaryEntry: (id, content) => {
        set(state => ({
          diaryEntries: state.diaryEntries.map(e =>
            e.id === id
              ? { ...e, content, wordCount: content.split(/\s+/).filter(Boolean).length }
              : e
          ),
        }));
      },

      deleteDiaryEntry: (id) => {
        set(state => ({ diaryEntries: state.diaryEntries.filter(e => e.id !== id) }));
      },

      addExamHistory: (exam) => {
        set(state => ({
          examHistory: [...state.examHistory, { ...exam, id: generateId() }],
        }));
      },

      deleteExamHistory: (id) => {
        set(state => ({ examHistory: state.examHistory.filter(e => e.id !== id) }));
      },

      getStats: () => {
        const state = get();
        return {
          kanaMastered: state.kanaProgress.filter(k => k.status === 'mastered').length,
          kanaTotal: state.kanaProgress.length,
          kanjiMastered: state.kanjiProgress.filter(k => k.status === 'mastered').length,
          kanjiTotal: state.kanjiProgress.length,
          kanjiLearning: state.kanjiProgress.filter(k => k.status === 'learning').length,
          grammarMastered: state.grammarProgress.filter(g => g.status === 'mastered').length,
          grammarTotal: state.grammarProgress.length,
          grammarLearning: state.grammarProgress.filter(g => g.status === 'learning').length,
          vocabMastered: state.vocabulary.filter(v => v.status === 'mastered').length,
          vocabTotal: state.vocabulary.length,
          vocabLearning: state.vocabulary.filter(v => v.status === 'learning').length,
          dueReviews: state.getDueVocabulary().length,
        };
      },
    }),
    {
      name: 'jlpt-tracker-storage',
    }
  )
);
