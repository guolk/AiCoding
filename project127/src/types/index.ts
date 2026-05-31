
export interface WorldSetting {
  id: string;
  name: string;
  description: string;
  cosmicOrigin: string;
  physicsRules: string;
  magicSystem: MagicSystem | null;
  techSystem: TechSystem | null;
  createdAt: string;
  updatedAt: string;
}

export interface MagicSystem {
  name: string;
  rules: string[];
  limitations: string[];
  sources: string[];
}

export interface TechSystem {
  level: string;
  keyInventions: string[];
  limitations: string[];
}

export interface Continent {
  id: string;
  name: string;
  description: string;
  geography: string;
}

export interface Country {
  id: string;
  continentId: string;
  name: string;
  capital: string;
  government: string;
  population: string;
}

export interface City {
  id: string;
  countryId: string;
  name: string;
  description: string;
  notableLocations: string[];
}

export interface Race {
  id: string;
  name: string;
  physicalTraits: string;
  culturalTraits: string;
  lifespan: string;
}

export interface Character {
  id: string;
  name: string;
  alias: string[];
  race: string;
  birthdate: string;
  deathdate: string | null;
  appearance: string;
  personality: string;
  abilities: string[];
  backstory: string;
  motivations: string[];
  factionId: string | null;
}

export interface Faction {
  id: string;
  name: string;
  type: string;
  ideology: string;
  leadership: string;
  territory: string;
}

export interface FactionRelation {
  id: string;
  factionA: string;
  factionB: string;
  type: 'ally' | 'enemy' | 'neutral' | 'vassal';
  description: string;
}

export interface CharacterRelation {
  id: string;
  characterA: string;
  characterB: string;
  type: string;
  description: string;
}

export interface PowerShift {
  id: string;
  factionId: string;
  period: string;
  change: string;
  description: string;
}

export interface Language {
  id: string;
  name: string;
  family: string;
  speakers: string;
  grammarRules: string;
  writingSystem: string;
}

export interface Word {
  id: string;
  languageId: string;
  original: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
}

export interface Culture {
  id: string;
  name: string;
  values: string[];
  taboos: string[];
  socialStructure: string;
}

export interface Festival {
  id: string;
  cultureId: string;
  name: string;
  date: string;
  purpose: string;
  traditions: string[];
}

export interface Religion {
  id: string;
  name: string;
  type: string;
  coreBeliefs: string[];
  practices: string[];
}

export interface Deity {
  id: string;
  religionId: string;
  name: string;
  domain: string;
  mythology: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  participants: string[];
  consequences: string;
  locationId: string | null;
}

export interface MapMarker {
  id: string;
  name: string;
  type: 'city' | 'landmark' | 'battlefield' | 'mystical';
  lat: number;
  lng: number;
  description: string;
}

export interface Reference {
  id: string;
  title: string;
  type: 'book' | 'movie' | 'game' | 'music' | 'other';
  author: string;
  url: string;
  notes: string;
  rating?: number;
  tags?: string[];
}

export interface Inspiration {
  id: string;
  title: string;
  category: 'character' | 'plot' | 'world' | 'magic' | 'tech' | 'culture' | 'other';
  content: string;
  tags: string[];
  createdAt: string;
}

export interface RuleCheckResult {
  type: 'warning' | 'error' | 'info';
  message: string;
  details: string;
}
