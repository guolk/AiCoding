export type LearningStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export type ResourceType = 'book' | 'video' | 'document' | 'course' | 'article';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ApplicationStatus = 'researching' | 'applied' | 'interviewing' | 'offer' | 'rejected';

export interface LearningResource {
  id: string;
  name: string;
  type: ResourceType;
  url: string;
  rating: number;
  review: string;
  completed: boolean;
}

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
}

export interface LearningNote {
  id: string;
  title: string;
  content: string;
  codeExamples: CodeExample[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapNode {
  id: string;
  name: string;
  description: string;
  status: LearningStatus;
  level: number;
  position: { x: number; y: number };
  resources: LearningResource[];
  notes: LearningNote[];
  prerequisites: string[];
}

export interface TechStack {
  id: string;
  name: string;
  icon: string;
  description: string;
  roadmap: RoadmapNode[];
}

export interface ProjectMedia {
  id: string;
  type: 'screenshot' | 'video';
  url: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  techStack: string[];
  description: string;
  features: string[];
  challenges: string;
  solutions: string;
  sourceCodeUrl: string;
  demoUrl: string;
  media: ProjectMedia[];
  highlights: string[];
  startDate: string;
  endDate: string;
}

export interface CodingProblem {
  id: string;
  platform: 'leetcode' | 'nowcoder' | 'other';
  title: string;
  difficulty: Difficulty;
  url: string;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
  completedDate: string;
  isWrong: boolean;
  wrongNotes: string;
  retryCount: number;
  tags: string[];
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  mastery: number;
  lastReviewed: string;
}

export interface MockInterview {
  id: string;
  date: string;
  company: string;
  position: string;
  questions: {
    question: string;
    answerScore: number;
    improvement: string;
  }[];
  overallScore: number;
  notes: string;
}

export interface KnowledgeGap {
  id: string;
  topic: string;
  category: string;
  description: string;
  status: 'identified' | 'learning' | 'mastered';
  priority: 'high' | 'medium' | 'low';
}

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  researchNotes: string;
  companyCulture: string;
  keyProducts: string;
  status: ApplicationStatus;
  appliedDate: string;
  contactPerson: string;
  contactEmail: string;
  interviewDates: string[];
  followUpNotes: string;
}

export interface AppState {
  techStacks: TechStack[];
  projects: Project[];
  codingProblems: CodingProblem[];
  interviewQuestions: InterviewQuestion[];
  mockInterviews: MockInterview[];
  knowledgeGaps: KnowledgeGap[];
  jobApplications: JobApplication[];
}

export interface AppContextType {
  state: AppState;
  updateTechStack: (techStack: TechStack) => void;
  deleteTechStack: (id: string) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  updateCodingProblem: (problem: CodingProblem) => void;
  deleteCodingProblem: (id: string) => void;
  updateInterviewQuestion: (question: InterviewQuestion) => void;
  deleteInterviewQuestion: (id: string) => void;
  updateMockInterview: (interview: MockInterview) => void;
  deleteMockInterview: (id: string) => void;
  updateKnowledgeGap: (gap: KnowledgeGap) => void;
  deleteKnowledgeGap: (id: string) => void;
  updateJobApplication: (app: JobApplication) => void;
  deleteJobApplication: (id: string) => void;
}
