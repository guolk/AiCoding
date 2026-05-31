
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorldSetting,
  Continent,
  Country,
  City,
  Race,
  Character,
  Faction,
  FactionRelation,
  CharacterRelation,
  PowerShift,
  Language,
  Word,
  Culture,
  Festival,
  Religion,
  Deity,
  HistoryEvent,
  MapMarker,
  Reference,
  Inspiration
} from '@/types';
import { generateId, getCurrentTimestamp } from '@/utils/idGenerator';

interface WorldState {
  worldSetting: WorldSetting | null;
  continents: Continent[];
  countries: Country[];
  cities: City[];
  races: Race[];
  characters: Character[];
  factions: Faction[];
  factionRelations: FactionRelation[];
  characterRelations: CharacterRelation[];
  powerShifts: PowerShift[];
  languages: Language[];
  words: Word[];
  cultures: Culture[];
  festivals: Festival[];
  religions: Religion[];
  deities: Deity[];
  historyEvents: HistoryEvent[];
  mapMarkers: MapMarker[];
  references: Reference[];
  inspirations: Inspiration[];
  lastEdited: string;

  setWorldSetting: (setting: Partial<WorldSetting>) => void;
  createWorldSetting: (name: string) => void;

  addContinent: (continent: Omit<Continent, 'id'>) => void;
  updateContinent: (id: string, data: Partial<Continent>) => void;
  deleteContinent: (id: string) => void;

  addCountry: (country: Omit<Country, 'id'>) => void;
  updateCountry: (id: string, data: Partial<Country>) => void;
  deleteCountry: (id: string) => void;

  addCity: (city: Omit<City, 'id'>) => void;
  updateCity: (id: string, data: Partial<City>) => void;
  deleteCity: (id: string) => void;

  addRace: (race: Omit<Race, 'id'>) => void;
  updateRace: (id: string, data: Partial<Race>) => void;
  deleteRace: (id: string) => void;

  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, data: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;

  addFaction: (faction: Omit<Faction, 'id'>) => void;
  updateFaction: (id: string, data: Partial<Faction>) => void;
  deleteFaction: (id: string) => void;

  addFactionRelation: (relation: Omit<FactionRelation, 'id'>) => void;
  updateFactionRelation: (id: string, data: Partial<FactionRelation>) => void;
  deleteFactionRelation: (id: string) => void;

  addCharacterRelation: (relation: Omit<CharacterRelation, 'id'>) => void;
  updateCharacterRelation: (id: string, data: Partial<CharacterRelation>) => void;
  deleteCharacterRelation: (id: string) => void;

  addPowerShift: (shift: Omit<PowerShift, 'id'>) => void;
  updatePowerShift: (id: string, data: Partial<PowerShift>) => void;
  deletePowerShift: (id: string) => void;

  addLanguage: (language: Omit<Language, 'id'>) => void;
  updateLanguage: (id: string, data: Partial<Language>) => void;
  deleteLanguage: (id: string) => void;

  addWord: (word: Omit<Word, 'id'>) => void;
  updateWord: (id: string, data: Partial<Word>) => void;
  deleteWord: (id: string) => void;

  addCulture: (culture: Omit<Culture, 'id'>) => void;
  updateCulture: (id: string, data: Partial<Culture>) => void;
  deleteCulture: (id: string) => void;

  addFestival: (festival: Omit<Festival, 'id'>) => void;
  updateFestival: (id: string, data: Partial<Festival>) => void;
  deleteFestival: (id: string) => void;

  addReligion: (religion: Omit<Religion, 'id'>) => void;
  updateReligion: (id: string, data: Partial<Religion>) => void;
  deleteReligion: (id: string) => void;

  addDeity: (deity: Omit<Deity, 'id'>) => void;
  updateDeity: (id: string, data: Partial<Deity>) => void;
  deleteDeity: (id: string) => void;

  addHistoryEvent: (event: Omit<HistoryEvent, 'id'>) => void;
  updateHistoryEvent: (id: string, data: Partial<HistoryEvent>) => void;
  deleteHistoryEvent: (id: string) => void;

  addMapMarker: (marker: Omit<MapMarker, 'id'>) => void;
  updateMapMarker: (id: string, data: Partial<MapMarker>) => void;
  deleteMapMarker: (id: string) => void;

  addReference: (reference: Omit<Reference, 'id'>) => void;
  updateReference: (id: string, data: Partial<Reference>) => void;
  deleteReference: (id: string) => void;

  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt'>) => void;
  updateInspiration: (id: string, data: Partial<Inspiration>) => void;
  deleteInspiration: (id: string) => void;

  clearAll: () => void;
}

const initialState = {
  worldSetting: null,
  continents: [],
  countries: [],
  cities: [],
  races: [],
  characters: [],
  factions: [],
  factionRelations: [],
  characterRelations: [],
  powerShifts: [],
  languages: [],
  words: [],
  cultures: [],
  festivals: [],
  religions: [],
  deities: [],
  historyEvents: [],
  mapMarkers: [],
  references: [],
  inspirations: [],
  lastEdited: ''
};

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      ...initialState,

      setWorldSetting: (setting) => set((state) => ({
        worldSetting: state.worldSetting 
          ? { ...state.worldSetting, ...setting, updatedAt: getCurrentTimestamp() } 
          : null,
        lastEdited: getCurrentTimestamp()
      })),

      createWorldSetting: (name) => set(() => ({
        worldSetting: {
          id: generateId(),
          name,
          description: '',
          cosmicOrigin: '',
          physicsRules: '',
          magicSystem: null,
          techSystem: null,
          createdAt: getCurrentTimestamp(),
          updatedAt: getCurrentTimestamp()
        },
        lastEdited: getCurrentTimestamp()
      })),

      addContinent: (continent) => set((state) => ({
        continents: [...state.continents, { ...continent, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateContinent: (id, data) => set((state) => ({
        continents: state.continents.map(c => c.id === id ? { ...c, ...data } : c),
        lastEdited: getCurrentTimestamp()
      })),
      deleteContinent: (id) => set((state) => ({
        continents: state.continents.filter(c => c.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addCountry: (country) => set((state) => ({
        countries: [...state.countries, { ...country, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateCountry: (id, data) => set((state) => ({
        countries: state.countries.map(c => c.id === id ? { ...c, ...data } : c),
        lastEdited: getCurrentTimestamp()
      })),
      deleteCountry: (id) => set((state) => ({
        countries: state.countries.filter(c => c.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addCity: (city) => set((state) => ({
        cities: [...state.cities, { ...city, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateCity: (id, data) => set((state) => ({
        cities: state.cities.map(c => c.id === id ? { ...c, ...data } : c),
        lastEdited: getCurrentTimestamp()
      })),
      deleteCity: (id) => set((state) => ({
        cities: state.cities.filter(c => c.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addRace: (race) => set((state) => ({
        races: [...state.races, { ...race, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateRace: (id, data) => set((state) => ({
        races: state.races.map(r => r.id === id ? { ...r, ...data } : r),
        lastEdited: getCurrentTimestamp()
      })),
      deleteRace: (id) => set((state) => ({
        races: state.races.filter(r => r.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addCharacter: (character) => set((state) => ({
        characters: [...state.characters, { ...character, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateCharacter: (id, data) => set((state) => ({
        characters: state.characters.map(c => c.id === id ? { ...c, ...data } : c),
        lastEdited: getCurrentTimestamp()
      })),
      deleteCharacter: (id) => set((state) => ({
        characters: state.characters.filter(c => c.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addFaction: (faction) => set((state) => ({
        factions: [...state.factions, { ...faction, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateFaction: (id, data) => set((state) => ({
        factions: state.factions.map(f => f.id === id ? { ...f, ...data } : f),
        lastEdited: getCurrentTimestamp()
      })),
      deleteFaction: (id) => set((state) => ({
        factions: state.factions.filter(f => f.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addFactionRelation: (relation) => set((state) => ({
        factionRelations: [...state.factionRelations, { ...relation, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateFactionRelation: (id, data) => set((state) => ({
        factionRelations: state.factionRelations.map(r => r.id === id ? { ...r, ...data } : r),
        lastEdited: getCurrentTimestamp()
      })),
      deleteFactionRelation: (id) => set((state) => ({
        factionRelations: state.factionRelations.filter(r => r.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addCharacterRelation: (relation) => set((state) => ({
        characterRelations: [...state.characterRelations, { ...relation, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateCharacterRelation: (id, data) => set((state) => ({
        characterRelations: state.characterRelations.map(r => r.id === id ? { ...r, ...data } : r),
        lastEdited: getCurrentTimestamp()
      })),
      deleteCharacterRelation: (id) => set((state) => ({
        characterRelations: state.characterRelations.filter(r => r.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addPowerShift: (shift) => set((state) => ({
        powerShifts: [...state.powerShifts, { ...shift, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updatePowerShift: (id, data) => set((state) => ({
        powerShifts: state.powerShifts.map(p => p.id === id ? { ...p, ...data } : p),
        lastEdited: getCurrentTimestamp()
      })),
      deletePowerShift: (id) => set((state) => ({
        powerShifts: state.powerShifts.filter(p => p.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addLanguage: (language) => set((state) => ({
        languages: [...state.languages, { ...language, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateLanguage: (id, data) => set((state) => ({
        languages: state.languages.map(l => l.id === id ? { ...l, ...data } : l),
        lastEdited: getCurrentTimestamp()
      })),
      deleteLanguage: (id) => set((state) => ({
        languages: state.languages.filter(l => l.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addWord: (word) => set((state) => ({
        words: [...state.words, { ...word, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateWord: (id, data) => set((state) => ({
        words: state.words.map(w => w.id === id ? { ...w, ...data } : w),
        lastEdited: getCurrentTimestamp()
      })),
      deleteWord: (id) => set((state) => ({
        words: state.words.filter(w => w.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addCulture: (culture) => set((state) => ({
        cultures: [...state.cultures, { ...culture, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateCulture: (id, data) => set((state) => ({
        cultures: state.cultures.map(c => c.id === id ? { ...c, ...data } : c),
        lastEdited: getCurrentTimestamp()
      })),
      deleteCulture: (id) => set((state) => ({
        cultures: state.cultures.filter(c => c.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addFestival: (festival) => set((state) => ({
        festivals: [...state.festivals, { ...festival, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateFestival: (id, data) => set((state) => ({
        festivals: state.festivals.map(f => f.id === id ? { ...f, ...data } : f),
        lastEdited: getCurrentTimestamp()
      })),
      deleteFestival: (id) => set((state) => ({
        festivals: state.festivals.filter(f => f.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addReligion: (religion) => set((state) => ({
        religions: [...state.religions, { ...religion, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateReligion: (id, data) => set((state) => ({
        religions: state.religions.map(r => r.id === id ? { ...r, ...data } : r),
        lastEdited: getCurrentTimestamp()
      })),
      deleteReligion: (id) => set((state) => ({
        religions: state.religions.filter(r => r.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addDeity: (deity) => set((state) => ({
        deities: [...state.deities, { ...deity, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateDeity: (id, data) => set((state) => ({
        deities: state.deities.map(d => d.id === id ? { ...d, ...data } : d),
        lastEdited: getCurrentTimestamp()
      })),
      deleteDeity: (id) => set((state) => ({
        deities: state.deities.filter(d => d.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addHistoryEvent: (event) => set((state) => ({
        historyEvents: [...state.historyEvents, { ...event, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateHistoryEvent: (id, data) => set((state) => ({
        historyEvents: state.historyEvents.map(e => e.id === id ? { ...e, ...data } : e),
        lastEdited: getCurrentTimestamp()
      })),
      deleteHistoryEvent: (id) => set((state) => ({
        historyEvents: state.historyEvents.filter(e => e.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addMapMarker: (marker) => set((state) => ({
        mapMarkers: [...state.mapMarkers, { ...marker, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateMapMarker: (id, data) => set((state) => ({
        mapMarkers: state.mapMarkers.map(m => m.id === id ? { ...m, ...data } : m),
        lastEdited: getCurrentTimestamp()
      })),
      deleteMapMarker: (id) => set((state) => ({
        mapMarkers: state.mapMarkers.filter(m => m.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addReference: (reference) => set((state) => ({
        references: [...state.references, { ...reference, id: generateId() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateReference: (id, data) => set((state) => ({
        references: state.references.map(r => r.id === id ? { ...r, ...data } : r),
        lastEdited: getCurrentTimestamp()
      })),
      deleteReference: (id) => set((state) => ({
        references: state.references.filter(r => r.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      addInspiration: (inspiration) => set((state) => ({
        inspirations: [...state.inspirations, { ...inspiration, id: generateId(), createdAt: getCurrentTimestamp() }],
        lastEdited: getCurrentTimestamp()
      })),
      updateInspiration: (id, data) => set((state) => ({
        inspirations: state.inspirations.map(i => i.id === id ? { ...i, ...data } : i),
        lastEdited: getCurrentTimestamp()
      })),
      deleteInspiration: (id) => set((state) => ({
        inspirations: state.inspirations.filter(i => i.id !== id),
        lastEdited: getCurrentTimestamp()
      })),

      clearAll: () => set(() => ({
        ...initialState,
        lastEdited: getCurrentTimestamp()
      }))
    }),
    {
      name: 'world-builder-storage',
    }
  )
);
