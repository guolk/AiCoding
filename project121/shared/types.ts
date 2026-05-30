export interface Movement {
  number: number;
  title: string;
  duration?: number;
  tempo?: string;
  key?: string;
}

export interface Work {
  id: string;
  composer: string;
  composerId?: string;
  title: string;
  opus?: string;
  catalogNumber?: string;
  compositionYear?: number;
  duration?: number;
  instrumentation?: string;
  form?: string;
  movements?: Movement[];
  personalRating?: number;
  listenCount: number;
  favoriteVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Version {
  id: string;
  workId: string;
  conductor: string;
  orchestra: string;
  soloists?: string;
  recordingYear?: number;
  releaseYear?: number;
  duration?: number;
  characteristics?: string;
  historicalContext?: string;
  personalRank?: number;
  label?: string;
  catalogNumber?: string;
  format?: string;
  createdAt: string;
}

export interface MovementNote {
  movementNumber: number;
  title: string;
  impression?: string;
  structureNotes?: string;
}

export interface HighlightMoment {
  timestamp: string;
  description: string;
}

export interface ListeningNote {
  id: string;
  workId: string;
  versionId?: string;
  listenDate: string;
  movementNotes: MovementNote[];
  emotionalJourney?: string;
  highlightMoments: HighlightMoment[];
  structureAnalysis?: string;
  historicalNotes?: string;
  overallImpression?: string;
  createdAt: string;
}

export interface TimelineEvent {
  year: number;
  event: string;
  type: 'birth' | 'work' | 'life' | 'death';
}

export interface ComposerRelationship {
  composerId: string;
  composerName: string;
  relationship: string;
  description?: string;
}

export interface RepresentativeWork {
  workId?: string;
  title: string;
  year?: number;
  form?: string;
}

export interface Composer {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  period?: string;
  biography?: string;
  timelineEvents: TimelineEvent[];
  relationships: ComposerRelationship[];
  representativeWorks: RepresentativeWork[];
  createdAt: string;
}

export interface ConcertProgramItem {
  order: number;
  composer: string;
  workTitle: string;
  workId?: string;
  intermission?: boolean;
}

export interface Concert {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  city?: string;
  type: 'attended' | 'planned';
  programItems: ConcertProgramItem[];
  performers?: string;
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface MusicBrainzWorkResult {
  id: string;
  title: string;
  composer?: string;
  composerId?: string;
  workType?: string;
  opus?: string;
  catalogNumber?: string;
  compositionYear?: number;
  movements?: Movement[];
}

export interface MusicBrainzArtistResult {
  id: string;
  name: string;
  sortName?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  period?: string;
}
