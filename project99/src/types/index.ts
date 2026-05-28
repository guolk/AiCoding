export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupation?: string;
  photo?: string;
  children: string[];
  spouse?: string;
  parent?: string;
  notes?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'migration' | 'historical' | 'achievement' | 'tragedy';
  description: string;
  location?: string;
}

export interface OralHistory {
  id: string;
  title: string;
  narrator: string;
  content: string;
  dateRecorded?: string;
}

export interface Photo {
  id: string;
  title: string;
  imageUrl: string;
  date?: string;
  location?: string;
  people: string[];
}

export interface Biography {
  id: string;
  memberId: string;
  title: string;
  content: string;
}

export interface FamilyTrait {
  id: string;
  type: 'motto' | 'value' | 'custom';
  title: string;
  content: string;
}

export interface ThemeStory {
  id: string;
  theme: 'struggle' | 'migration' | 'war';
  title: string;
  content: string;
}

export interface ResearchNote {
  id: string;
  infoId: string;
  sourceType: 'elder' | 'document';
  source: string;
  confirmed: boolean;
  historicalSource?: string;
}

export interface AppData {
  members: FamilyMember[];
  events: Event[];
  oralHistories: OralHistory[];
  photos: Photo[];
  biographies: Biography[];
  familyTraits: FamilyTrait[];
  themeStories: ThemeStory[];
  researchNotes: ResearchNote[];
}
