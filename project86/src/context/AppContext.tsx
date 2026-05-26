import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppContextType, TechStack, Project, CodingProblem, InterviewQuestion, MockInterview, KnowledgeGap, JobApplication } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { mockData } from '../data/mockData';

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'UPDATE_TECH_STACK'; payload: TechStack }
  | { type: 'DELETE_TECH_STACK'; payload: string }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'UPDATE_CODING_PROBLEM'; payload: CodingProblem }
  | { type: 'DELETE_CODING_PROBLEM'; payload: string }
  | { type: 'UPDATE_INTERVIEW_QUESTION'; payload: InterviewQuestion }
  | { type: 'DELETE_INTERVIEW_QUESTION'; payload: string }
  | { type: 'UPDATE_MOCK_INTERVIEW'; payload: MockInterview }
  | { type: 'DELETE_MOCK_INTERVIEW'; payload: string }
  | { type: 'UPDATE_KNOWLEDGE_GAP'; payload: KnowledgeGap }
  | { type: 'DELETE_KNOWLEDGE_GAP'; payload: string }
  | { type: 'UPDATE_JOB_APPLICATION'; payload: JobApplication }
  | { type: 'DELETE_JOB_APPLICATION'; payload: string };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_TECH_STACK': {
      const existingIndex = state.techStacks.findIndex(ts => ts.id === action.payload.id);
      if (existingIndex >= 0) {
        const newTechStacks = [...state.techStacks];
        newTechStacks[existingIndex] = action.payload;
        return { ...state, techStacks: newTechStacks };
      }
      return { ...state, techStacks: [...state.techStacks, action.payload] };
    }
    case 'DELETE_TECH_STACK':
      return { ...state, techStacks: state.techStacks.filter(ts => ts.id !== action.payload) };
    case 'UPDATE_PROJECT': {
      const existingIndex = state.projects.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        const newProjects = [...state.projects];
        newProjects[existingIndex] = action.payload;
        return { ...state, projects: newProjects };
      }
      return { ...state, projects: [...state.projects, action.payload] };
    }
    case 'DELETE_PROJECT':
      return { ...state, projects: state.projects.filter(p => p.id !== action.payload) };
    case 'UPDATE_CODING_PROBLEM': {
      const existingIndex = state.codingProblems.findIndex(cp => cp.id === action.payload.id);
      if (existingIndex >= 0) {
        const newProblems = [...state.codingProblems];
        newProblems[existingIndex] = action.payload;
        return { ...state, codingProblems: newProblems };
      }
      return { ...state, codingProblems: [...state.codingProblems, action.payload] };
    }
    case 'DELETE_CODING_PROBLEM':
      return { ...state, codingProblems: state.codingProblems.filter(cp => cp.id !== action.payload) };
    case 'UPDATE_INTERVIEW_QUESTION': {
      const existingIndex = state.interviewQuestions.findIndex(iq => iq.id === action.payload.id);
      if (existingIndex >= 0) {
        const newQuestions = [...state.interviewQuestions];
        newQuestions[existingIndex] = action.payload;
        return { ...state, interviewQuestions: newQuestions };
      }
      return { ...state, interviewQuestions: [...state.interviewQuestions, action.payload] };
    }
    case 'DELETE_INTERVIEW_QUESTION':
      return { ...state, interviewQuestions: state.interviewQuestions.filter(iq => iq.id !== action.payload) };
    case 'UPDATE_MOCK_INTERVIEW': {
      const existingIndex = state.mockInterviews.findIndex(mi => mi.id === action.payload.id);
      if (existingIndex >= 0) {
        const newInterviews = [...state.mockInterviews];
        newInterviews[existingIndex] = action.payload;
        return { ...state, mockInterviews: newInterviews };
      }
      return { ...state, mockInterviews: [...state.mockInterviews, action.payload] };
    }
    case 'DELETE_MOCK_INTERVIEW':
      return { ...state, mockInterviews: state.mockInterviews.filter(mi => mi.id !== action.payload) };
    case 'UPDATE_KNOWLEDGE_GAP': {
      const existingIndex = state.knowledgeGaps.findIndex(kg => kg.id === action.payload.id);
      if (existingIndex >= 0) {
        const newGaps = [...state.knowledgeGaps];
        newGaps[existingIndex] = action.payload;
        return { ...state, knowledgeGaps: newGaps };
      }
      return { ...state, knowledgeGaps: [...state.knowledgeGaps, action.payload] };
    }
    case 'DELETE_KNOWLEDGE_GAP':
      return { ...state, knowledgeGaps: state.knowledgeGaps.filter(kg => kg.id !== action.payload) };
    case 'UPDATE_JOB_APPLICATION': {
      const existingIndex = state.jobApplications.findIndex(ja => ja.id === action.payload.id);
      if (existingIndex >= 0) {
        const newApps = [...state.jobApplications];
        newApps[existingIndex] = action.payload;
        return { ...state, jobApplications: newApps };
      }
      return { ...state, jobApplications: [...state.jobApplications, action.payload] };
    }
    case 'DELETE_JOB_APPLICATION':
      return { ...state, jobApplications: state.jobApplications.filter(ja => ja.id !== action.payload) };
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, mockData);

  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      dispatch({ type: 'SET_STATE', payload: savedData });
    }
  }, []);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const contextValue: AppContextType = {
    state,
    updateTechStack: (techStack: TechStack) => dispatch({ type: 'UPDATE_TECH_STACK', payload: techStack }),
    deleteTechStack: (id: string) => dispatch({ type: 'DELETE_TECH_STACK', payload: id }),
    updateProject: (project: Project) => dispatch({ type: 'UPDATE_PROJECT', payload: project }),
    deleteProject: (id: string) => dispatch({ type: 'DELETE_PROJECT', payload: id }),
    updateCodingProblem: (problem: CodingProblem) => dispatch({ type: 'UPDATE_CODING_PROBLEM', payload: problem }),
    deleteCodingProblem: (id: string) => dispatch({ type: 'DELETE_CODING_PROBLEM', payload: id }),
    updateInterviewQuestion: (question: InterviewQuestion) => dispatch({ type: 'UPDATE_INTERVIEW_QUESTION', payload: question }),
    deleteInterviewQuestion: (id: string) => dispatch({ type: 'DELETE_INTERVIEW_QUESTION', payload: id }),
    updateMockInterview: (interview: MockInterview) => dispatch({ type: 'UPDATE_MOCK_INTERVIEW', payload: interview }),
    deleteMockInterview: (id: string) => dispatch({ type: 'DELETE_MOCK_INTERVIEW', payload: id }),
    updateKnowledgeGap: (gap: KnowledgeGap) => dispatch({ type: 'UPDATE_KNOWLEDGE_GAP', payload: gap }),
    deleteKnowledgeGap: (id: string) => dispatch({ type: 'DELETE_KNOWLEDGE_GAP', payload: id }),
    updateJobApplication: (app: JobApplication) => dispatch({ type: 'UPDATE_JOB_APPLICATION', payload: app }),
    deleteJobApplication: (id: string) => dispatch({ type: 'DELETE_JOB_APPLICATION', payload: id }),
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
