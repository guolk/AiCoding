export interface Student {
  id: number;
  name: string;
  grade: number;
  className: string;
  avatar: string;
  interests: string;
  learningStyle: string;
  familyBackground: string;
  shortTermGoals: string;
  longTermGoals: string;
  createdAt: string;
}

export interface ParentCommunication {
  id: number;
  studentId: number;
  date: string;
  type: 'home_visit' | 'parent_meeting';
  content: string;
  teacher: string;
}

export interface Portfolio {
  id: number;
  studentId: number;
  title: string;
  category: 'art' | 'writing' | 'math' | 'science';
  description: string;
  fileUrl: string;
  thumbnail: string;
  grade: number;
  semester: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface Intelligence {
  linguistic: number;
  logicalMathematical: number;
  spatial: number;
  musical: number;
  bodilyKinesthetic: number;
  interpersonal: number;
  intrapersonal: number;
}

export interface KeySkills {
  criticalThinking: number;
  creativity: number;
  collaboration: number;
  learningHabits: number;
}

export interface Milestone {
  id: number;
  studentId: number;
  title: string;
  description: string;
  date: string;
  badge: string;
}

export interface Assessment {
  id: number;
  studentId: number;
  semester: string;
  intelligence: Intelligence;
  keySkills: KeySkills;
  teacherComment: string;
  createdAt: string;
}

export interface Report {
  id: number;
  studentId: number;
  semester: string;
  featuredWorks: number[];
  assessmentId: number;
  teacherComment: string;
  highlights: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalPortfolios: number;
  assessmentCompletion: number;
  monthlyMilestones: number;
}

export interface GrowthComparison {
  semester: string;
  overallScore: number;
  intelligence: Intelligence;
  keySkills: KeySkills;
}
