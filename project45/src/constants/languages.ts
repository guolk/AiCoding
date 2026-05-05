import type { Language, LanguageCode, LanguageLevel, LearningGoal, InterestTag } from '@/types';

export type { LanguageCode, LanguageLevel, LearningGoal, InterestTag };

export const LANGUAGES: Record<LanguageCode, Language> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
  },
  'en-US': {
    code: 'en-US',
    name: 'English (United States)',
    nativeName: 'English (US)',
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
  },
  'fr-FR': {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
  },
  'de-DE': {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
  },
  'es-ES': {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
  },
  'it-IT': {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
  },
  'ru-RU': {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
  },
  'hi-IN': {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
  },
  'th-TH': {
    code: 'th-TH',
    name: 'Thai',
    nativeName: 'ไทย',
  },
  'vi-VN': {
    code: 'vi-VN',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
  },
};

export const LANGUAGE_LEVELS: Record<LanguageLevel, { value: LanguageLevel; label: string; description: string }> = {
  beginner: {
    value: 'beginner',
    label: 'Beginner',
    description: 'Just starting to learn',
  },
  elementary: {
    value: 'elementary',
    label: 'Elementary',
    description: 'Can understand basic phrases',
  },
  intermediate: {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Can hold simple conversations',
  },
  'upper-intermediate': {
    value: 'upper-intermediate',
    label: 'Upper Intermediate',
    description: 'Can communicate fluently in most situations',
  },
  advanced: {
    value: 'advanced',
    label: 'Advanced',
    description: 'Near-native proficiency',
  },
  native: {
    value: 'native',
    label: 'Native',
    description: 'Native speaker',
  },
};

export const LANGUAGE_LEVEL_VALUES: Record<LanguageLevel, number> = {
  beginner: 1,
  elementary: 2,
  intermediate: 3,
  'upper-intermediate': 4,
  advanced: 5,
  native: 6,
};

export const LEARNING_GOALS: Record<LearningGoal, { value: LearningGoal; label: string; icon: string }> = {
  travel: {
    value: 'travel',
    label: 'Travel',
    icon: '✈️',
  },
  business: {
    value: 'business',
    label: 'Business',
    icon: '💼',
  },
  academic: {
    value: 'academic',
    label: 'Academic',
    icon: '📚',
  },
  daily_conversation: {
    value: 'daily_conversation',
    label: 'Daily Conversation',
    icon: '💬',
  },
  exam_preparation: {
    value: 'exam_preparation',
    label: 'Exam Preparation',
    icon: '📝',
  },
  cultural_interest: {
    value: 'cultural_interest',
    label: 'Cultural Interest',
    icon: '🌍',
  },
};

export const INTEREST_TAGS: Record<InterestTag, { value: InterestTag; label: string; icon: string }> = {
  travel: {
    value: 'travel',
    label: 'Travel',
    icon: '✈️',
  },
  music: {
    value: 'music',
    label: 'Music',
    icon: '🎵',
  },
  movies: {
    value: 'movies',
    label: 'Movies',
    icon: '🎬',
  },
  books: {
    value: 'books',
    label: 'Books',
    icon: '📖',
  },
  sports: {
    value: 'sports',
    label: 'Sports',
    icon: '⚽',
  },
  food: {
    value: 'food',
    label: 'Food & Cooking',
    icon: '🍳',
  },
  technology: {
    value: 'technology',
    label: 'Technology',
    icon: '💻',
  },
  art: {
    value: 'art',
    label: 'Art',
    icon: '🎨',
  },
  history: {
    value: 'history',
    label: 'History',
    icon: '🏛️',
  },
  science: {
    value: 'science',
    label: 'Science',
    icon: '🔬',
  },
  gaming: {
    value: 'gaming',
    label: 'Gaming',
    icon: '🎮',
  },
  photography: {
    value: 'photography',
    label: 'Photography',
    icon: '📷',
  },
  fitness: {
    value: 'fitness',
    label: 'Fitness',
    icon: '💪',
  },
  politics: {
    value: 'politics',
    label: 'Politics',
    icon: '🗳️',
  },
  fashion: {
    value: 'fashion',
    label: 'Fashion',
    icon: '👗',
  },
};

export const TIMEZONES = [
  { name: 'UTC-12:00', offset: -12, label: 'Baker Island Time' },
  { name: 'UTC-11:00', offset: -11, label: 'Samoa Standard Time' },
  { name: 'UTC-10:00', offset: -10, label: 'Hawaii-Aleutian Standard Time' },
  { name: 'UTC-09:00', offset: -9, label: 'Alaska Standard Time' },
  { name: 'UTC-08:00', offset: -8, label: 'Pacific Standard Time' },
  { name: 'UTC-07:00', offset: -7, label: 'Mountain Standard Time' },
  { name: 'UTC-06:00', offset: -6, label: 'Central Standard Time' },
  { name: 'UTC-05:00', offset: -5, label: 'Eastern Standard Time' },
  { name: 'UTC-04:00', offset: -4, label: 'Atlantic Standard Time' },
  { name: 'UTC-03:00', offset: -3, label: 'Argentina Standard Time' },
  { name: 'UTC-02:00', offset: -2, label: 'South Georgia Time' },
  { name: 'UTC-01:00', offset: -1, label: 'Azores Standard Time' },
  { name: 'UTC+00:00', offset: 0, label: 'Greenwich Mean Time' },
  { name: 'UTC+01:00', offset: 1, label: 'Central European Time' },
  { name: 'UTC+02:00', offset: 2, label: 'Eastern European Time' },
  { name: 'UTC+03:00', offset: 3, label: 'Moscow Standard Time' },
  { name: 'UTC+04:00', offset: 4, label: 'Gulf Standard Time' },
  { name: 'UTC+05:00', offset: 5, label: 'Pakistan Standard Time' },
  { name: 'UTC+05:30', offset: 5.5, label: 'India Standard Time' },
  { name: 'UTC+06:00', offset: 6, label: 'Bangladesh Standard Time' },
  { name: 'UTC+07:00', offset: 7, label: 'Indochina Time' },
  { name: 'UTC+08:00', offset: 8, label: 'China Standard Time' },
  { name: 'UTC+09:00', offset: 9, label: 'Japan Standard Time' },
  { name: 'UTC+10:00', offset: 10, label: 'Australian Eastern Standard Time' },
  { name: 'UTC+11:00', offset: 11, label: 'Solomon Islands Time' },
  { name: 'UTC+12:00', offset: 12, label: 'New Zealand Standard Time' },
];

export function getLanguageNativeName(code: LanguageCode): string {
  return LANGUAGES[code]?.nativeName || code;
}

export function getLanguageLevelValue(level: LanguageLevel): number {
  return LANGUAGE_LEVEL_VALUES[level] || 0;
}

export function getCommonInterests(interests1: InterestTag[], interests2: InterestTag[]): InterestTag[] {
  return interests1.filter((interest) => interests2.includes(interest));
}
