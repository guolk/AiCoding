import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Competition, User, TrainingCourse, Notification, Honor } from '../types';
import { storage } from '../services/storage';
import { mockDepartments } from '../services/mockData';

interface AppContextType {
  questions: Question[];
  competitions: Competition[];
  user: User;
  courses: TrainingCourse[];
  notifications: Notification[];
  honors: Honor[];
  departments: typeof mockDepartments;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setCompetitions: React.Dispatch<React.SetStateAction<Competition[]>>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [user, setUser] = useState<User>({} as User);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [honors, setHonors] = useState<Honor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.init();
    setQuestions(storage.getQuestions());
    setCompetitions(storage.getCompetitions());
    setUser(storage.getUser());
    setCourses(storage.getCourses());
    setNotifications(storage.getNotifications());
    setHonors(storage.getHonors());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      storage.saveQuestions(questions);
    }
  }, [questions, loading]);

  useEffect(() => {
    if (!loading) {
      storage.saveCompetitions(competitions);
    }
  }, [competitions, loading]);

  useEffect(() => {
    if (!loading) {
      storage.saveUser(user);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading) {
      storage.saveNotifications(notifications);
    }
  }, [notifications, loading]);

  return (
    <AppContext.Provider
      value={{
        questions,
        competitions,
        user,
        courses,
        notifications,
        honors,
        departments: mockDepartments,
        setQuestions,
        setCompetitions,
        setUser,
        setNotifications,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
