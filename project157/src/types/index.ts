export interface StyleAssessment {
  abstractTendency: number;
  concreteTendency: number;
  colorSense: number;
  compositionAwareness: number;
  notes: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  className: string;
  enrollmentDate: string;
  artCharacteristics: string;
  parentExpectation: string;
  avatar: string;
  styleAssessment: StyleAssessment;
}

export interface ClassObservation {
  participationLevel: number;
  emotionalExpression: string;
  skillMastery: string;
  notes: string;
}

export interface CourseRecord {
  id: string;
  studentId: string;
  date: string;
  topic: string;
  materials: string[];
  techniques: string[];
  objectives: string;
  observation: ClassObservation;
}

export interface Artwork {
  id: string;
  studentId: string;
  courseId: string;
  title: string;
  imageUrl: string;
  date: string;
  comment: string;
  isPortfolio: boolean;
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  composition: number;
  color: number;
  line: number;
  creativity: number;
  expression: number;
  suggestion: string;
}

export interface Communication {
  id: string;
  studentId: string;
  date: string;
  type: 'parent' | 'teacher';
  content: string;
}

export interface ExhibitionRecord {
  id: string;
  studentId: string;
  exhibitionName: string;
  date: string;
  artworkTitle: string;
  award: string;
  experience: string;
}

export type TabType = 'profile' | 'style' | 'communication' | 'courses' | 'tracking' | 'exhibitions';
