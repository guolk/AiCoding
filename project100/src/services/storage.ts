import { Question, Competition, User, TrainingCourse, Notification, Honor, Certificate } from '../types';
import { mockQuestions, mockCompetitions, mockUser, mockTrainingCourses, mockNotifications, mockHonors } from './mockData';

const STORAGE_KEYS = {
  QUESTIONS: 'ekc_questions',
  COMPETITIONS: 'ekc_competitions',
  USER: 'ekc_user',
  COURSES: 'ekc_courses',
  NOTIFICATIONS: 'ekc_notifications',
  HONORS: 'ekc_honors'
};

export const storage = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(mockQuestions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPETITIONS)) {
      localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(mockCompetitions));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER)) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(mockTrainingCourses));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockNotifications));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HONORS)) {
      localStorage.setItem(STORAGE_KEYS.HONORS, JSON.stringify(mockHonors));
    }
  },

  getQuestions(): Question[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  },

  saveQuestions(questions: Question[]) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getCompetitions(): Competition[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETITIONS) || '[]');
  },

  saveCompetitions(competitions: Competition[]) {
    localStorage.setItem(STORAGE_KEYS.COMPETITIONS, JSON.stringify(competitions));
  },

  getUser(): User {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  },

  saveUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getCourses(): TrainingCourse[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]');
  },

  getNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  saveNotifications(notifications: Notification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  getHonors(): Honor[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HONORS) || '[]');
  }
};
