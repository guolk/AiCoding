const STORAGE_KEY = 'academic-conference-manager-data';

export interface AppData {
  conferences: any[];
  submissions: any[];
  reviews: any[];
  papers: any[];
  paperVersions: any[];
  collaborators: any[];
  checklistItems: any[];
  attendancePlans: any[];
  travelItems: any[];
  presentations: any[];
  expenses: any[];
  scholars: any[];
  collaborationIntents: any[];
  conferenceNotes: any[];
  publications: any[];
}

export function loadData(): AppData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  return {
    conferences: [],
    submissions: [],
    reviews: [],
    papers: [],
    paperVersions: [],
    collaborators: [],
    checklistItems: [],
    attendancePlans: [],
    travelItems: [],
    presentations: [],
    expenses: [],
    scholars: [],
    collaborationIntents: [],
    conferenceNotes: [],
    publications: [],
  };
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
