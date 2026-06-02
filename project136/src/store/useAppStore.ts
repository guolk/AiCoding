import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  CommentaryScript,
  TimelineMarker,
  EmergencyLine,
  Team,
  Player,
  Match,
  Commentator,
  Review,
  ListenerFeedback,
  SkillImprovement,
  PrepChecklist
} from '../types';
import { mockTeams } from '../data/mockTeams';
import { mockPlayers } from '../data/mockPlayers';
import { mockMatches, mockCommentators } from '../data/mockMatches';
import {
  mockScripts,
  mockTimelineMarkers,
  mockEmergencyLines,
  mockPrepChecklists,
  mockReviews,
  mockListenerFeedback,
  mockSkillImprovements
} from '../data/mockScripts';

interface AppState {
  scripts: CommentaryScript[];
  timelineMarkers: TimelineMarker[];
  emergencyLines: EmergencyLine[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  commentators: Commentator[];
  reviews: Review[];
  listenerFeedback: ListenerFeedback[];
  skillImprovements: SkillImprovement[];
  prepChecklists: PrepChecklist[];
  
  addScript: (script: Omit<CommentaryScript, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateScript: (id: string, script: Partial<CommentaryScript>) => void;
  deleteScript: (id: string) => void;
  
  addTimelineMarker: (marker: Omit<TimelineMarker, 'id'>) => void;
  updateTimelineMarker: (id: string, marker: Partial<TimelineMarker>) => void;
  deleteTimelineMarker: (id: string) => void;
  
  addEmergencyLine: (line: Omit<EmergencyLine, 'id' | 'usageCount'>) => void;
  updateEmergencyLine: (id: string, line: Partial<EmergencyLine>) => void;
  deleteEmergencyLine: (id: string) => void;
  incrementUsageCount: (id: string) => void;
  
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, review: Partial<Review>) => void;
  
  addListenerFeedback: (feedback: Omit<ListenerFeedback, 'id'>) => void;
  
  updateSkillImprovement: (id: string, improvement: Partial<SkillImprovement>) => void;
  
  updatePrepChecklist: (id: string, checklist: Partial<PrepChecklist>) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  
  getScriptById: (id: string) => CommentaryScript | undefined;
  getMarkersByScriptId: (scriptId: string) => TimelineMarker[];
  getTeamById: (id: string) => Team | undefined;
  getPlayerById: (id: string) => Player | undefined;
  getPlayersByTeamId: (teamId: string) => Player[];
  getMatchById: (id: string) => Match | undefined;
  getChecklistByMatchId: (matchId: string) => PrepChecklist | undefined;
  getReviewByMatchId: (matchId: string) => Review | undefined;
  getFeedbackByReviewId: (reviewId: string) => ListenerFeedback[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scripts: mockScripts,
      timelineMarkers: mockTimelineMarkers,
      emergencyLines: mockEmergencyLines,
      teams: mockTeams,
      players: mockPlayers,
      matches: mockMatches,
      commentators: mockCommentators,
      reviews: mockReviews,
      listenerFeedback: mockListenerFeedback,
      skillImprovements: mockSkillImprovements,
      prepChecklists: mockPrepChecklists,

      addScript: (script) => set((state) => ({
        scripts: [...state.scripts, {
          ...script,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),

      updateScript: (id, script) => set((state) => ({
        scripts: state.scripts.map(s => 
          s.id === id ? { ...s, ...script, updatedAt: new Date().toISOString() } : s
        )
      })),

      deleteScript: (id) => set((state) => ({
        scripts: state.scripts.filter(s => s.id !== id),
        timelineMarkers: state.timelineMarkers.filter(m => m.scriptId !== id)
      })),

      addTimelineMarker: (marker) => set((state) => ({
        timelineMarkers: [...state.timelineMarkers, { ...marker, id: uuidv4() }]
      })),

      updateTimelineMarker: (id, marker) => set((state) => ({
        timelineMarkers: state.timelineMarkers.map(m =>
          m.id === id ? { ...m, ...marker } : m
        )
      })),

      deleteTimelineMarker: (id) => set((state) => ({
        timelineMarkers: state.timelineMarkers.filter(m => m.id !== id)
      })),

      addEmergencyLine: (line) => set((state) => ({
        emergencyLines: [...state.emergencyLines, { ...line, id: uuidv4(), usageCount: 0 }]
      })),

      updateEmergencyLine: (id, line) => set((state) => ({
        emergencyLines: state.emergencyLines.map(l =>
          l.id === id ? { ...l, ...line } : l
        )
      })),

      deleteEmergencyLine: (id) => set((state) => ({
        emergencyLines: state.emergencyLines.filter(l => l.id !== id)
      })),

      incrementUsageCount: (id) => set((state) => ({
        emergencyLines: state.emergencyLines.map(l =>
          l.id === id ? { ...l, usageCount: l.usageCount + 1 } : l
        )
      })),

      addTeam: (team) => set((state) => ({
        teams: [...state.teams, { ...team, id: uuidv4() }]
      })),

      updateTeam: (id, team) => set((state) => ({
        teams: state.teams.map(t => t.id === id ? { ...t, ...team } : t)
      })),

      addPlayer: (player) => set((state) => ({
        players: [...state.players, { ...player, id: uuidv4() }]
      })),

      updatePlayer: (id, player) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...player } : p)
      })),

      addReview: (review) => set((state) => ({
        reviews: [...state.reviews, { ...review, id: uuidv4(), createdAt: new Date().toISOString() }]
      })),

      updateReview: (id, review) => set((state) => ({
        reviews: state.reviews.map(r => r.id === id ? { ...r, ...review } : r)
      })),

      addListenerFeedback: (feedback) => set((state) => ({
        listenerFeedback: [...state.listenerFeedback, { ...feedback, id: uuidv4() }]
      })),

      updateSkillImprovement: (id, improvement) => set((state) => ({
        skillImprovements: state.skillImprovements.map(s =>
          s.id === id ? { ...s, ...improvement } : s
        )
      })),

      updatePrepChecklist: (id, checklist) => set((state) => ({
        prepChecklists: state.prepChecklists.map(c =>
          c.id === id ? { ...c, ...checklist } : c
        )
      })),

      toggleChecklistItem: (checklistId, itemId) => set((state) => {
        const checklist = state.prepChecklists.find(c => c.id === checklistId);
        if (!checklist) return state;
        
        const updatedItems = checklist.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        
        return {
          prepChecklists: state.prepChecklists.map(c =>
            c.id === checklistId ? {
              ...c,
              items: updatedItems,
              completedCount: updatedItems.filter(i => i.completed).length
            } : c
          )
        };
      }),

      getScriptById: (id) => get().scripts.find(s => s.id === id),
      getMarkersByScriptId: (scriptId) => get().timelineMarkers.filter(m => m.scriptId === scriptId),
      getTeamById: (id) => get().teams.find(t => t.id === id),
      getPlayerById: (id) => get().players.find(p => p.id === id),
      getPlayersByTeamId: (teamId) => get().players.filter(p => p.teamId === teamId),
      getMatchById: (id) => get().matches.find(m => m.id === id),
      getChecklistByMatchId: (matchId) => get().prepChecklists.find(c => c.matchId === matchId),
      getReviewByMatchId: (matchId) => get().reviews.find(r => r.matchId === matchId),
      getFeedbackByReviewId: (reviewId) => get().listenerFeedback.filter(f => f.reviewId === reviewId)
    }),
    {
      name: 'commentary-app-storage'
    }
  )
);
