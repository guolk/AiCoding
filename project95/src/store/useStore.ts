import { create } from 'zustand';
import { Project, Milestone, Task, LabRecord, Literature, ReadingProgress, ReadingReport, Achievement, Meeting, Discussion, Reply, User, Activity } from '../types';
import { mockUsers, mockProjects, mockMilestones, mockTasks, mockLabRecords, mockLiterature, mockReadingProgress, mockReadingReports, mockAchievements, mockMeetings, mockDiscussions, mockActivities } from '../data/mockData';

interface AppState {
  users: User[];
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  labRecords: LabRecord[];
  literature: Literature[];
  readingProgress: ReadingProgress[];
  readingReports: ReadingReport[];
  achievements: Achievement[];
  meetings: Meeting[];
  discussions: Discussion[];
  activities: Activity[];
  currentUser: User | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  setCurrentUser: (user: User) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProject: (id: number, project: Partial<Project>) => void;
  deleteProject: (id: number) => void;

  addMilestone: (milestone: Omit<Milestone, 'id' | 'created_at'>) => void;
  updateMilestone: (id: number, milestone: Partial<Milestone>) => void;

  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (id: number, task: Partial<Task>) => void;
  deleteTask: (id: number) => void;

  addLabRecord: (record: Omit<LabRecord, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLabRecord: (id: number, record: Partial<LabRecord>) => void;
  deleteLabRecord: (id: number) => void;

  addLiterature: (lit: Omit<Literature, 'id' | 'created_at'>) => void;
  updateReadingProgress: (literatureId: number, userId: number, progress: number, status: ReadingProgress['status']) => void;
  addReadingReport: (report: Omit<ReadingReport, 'id' | 'created_at'>) => void;

  addAchievement: (achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) => void;
  updateAchievement: (id: number, achievement: Partial<Achievement>) => void;

  addMeeting: (meeting: Omit<Meeting, 'id' | 'created_at'>) => void;
  addActionItem: (meetingId: number, item: Omit<Meeting['action_items'][0], 'id' | 'meeting_id' | 'created_at'>) => void;
  updateActionItem: (meetingId: number, itemId: number, updates: Partial<Meeting['action_items'][0]>) => void;

  addDiscussion: (discussion: Omit<Discussion, 'id' | 'created_at' | 'updated_at'>) => void;
  deleteDiscussion: (id: number) => void;
  addReply: (discussionId: number, reply: Omit<Reply, 'id' | 'created_at'>) => void;

  addActivity: (activity: Omit<Activity, 'id'>) => void;
}

export const useStore = create<AppState>((set) => ({
  users: mockUsers,
  projects: mockProjects,
  milestones: mockMilestones,
  tasks: mockTasks,
  labRecords: mockLabRecords,
  literature: mockLiterature,
  readingProgress: mockReadingProgress,
  readingReports: mockReadingReports,
  achievements: mockAchievements,
  meetings: mockMeetings,
  discussions: mockDiscussions,
  activities: mockActivities,
  currentUser: mockUsers[0],
  toast: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  showToast: (message, type = 'info') => set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  addProject: (project) => set((state) => ({
    projects: [...state.projects, {
      ...project,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  })),

  updateProject: (id, project) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...project, updated_at: new Date().toISOString() } : p),
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    milestones: state.milestones.filter((m) => m.project_id !== id),
    tasks: state.tasks.filter((t) => t.project_id !== id),
  })),

  addMilestone: (milestone) => set((state) => ({
    milestones: [...state.milestones, {
      ...milestone,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }],
  })),

  updateMilestone: (id, milestone) => set((state) => ({
    milestones: state.milestones.map((m) => m.id === id ? { ...m, ...milestone } : m),
  })),

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      ...task,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  })),

  updateTask: (id, task) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...task, updated_at: new Date().toISOString() } : t),
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
  })),

  addLabRecord: (record) => set((state) => ({
    labRecords: [...state.labRecords, {
      ...record,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  })),

  updateLabRecord: (id, record) => set((state) => ({
    labRecords: state.labRecords.map((r) => r.id === id ? { ...r, ...record, updated_at: new Date().toISOString() } : r),
  })),

  deleteLabRecord: (id) => set((state) => ({
    labRecords: state.labRecords.filter((r) => r.id !== id),
  })),

  addLiterature: (lit) => set((state) => ({
    literature: [...state.literature, {
      ...lit,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }],
  })),

  updateReadingProgress: (literatureId, userId, progress, status) => set((state) => {
    const existing = state.readingProgress.find(
      (rp) => rp.literature_id === literatureId && rp.user_id === userId
    );
    if (existing) {
      return {
        readingProgress: state.readingProgress.map((rp) =>
          rp.id === existing.id
            ? { ...rp, progress, status, updated_at: new Date().toISOString() }
            : rp
        ),
      };
    }
    return {
      readingProgress: [...state.readingProgress, {
        id: Date.now(),
        literature_id: literatureId,
        user_id: userId,
        progress,
        status,
        recommended: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }],
    };
  }),

  addReadingReport: (report) => set((state) => ({
    readingReports: [...state.readingReports, {
      ...report,
      id: Date.now(),
      created_at: new Date().toISOString(),
    }],
  })),

  addAchievement: (achievement) => set((state) => ({
    achievements: [...state.achievements, {
      ...achievement,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  })),

  updateAchievement: (id, achievement) => set((state) => ({
    achievements: state.achievements.map((a) => a.id === id ? { ...a, ...achievement, updated_at: new Date().toISOString() } : a),
  })),

  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, {
      ...meeting,
      id: Date.now(),
      action_items: [],
      created_at: new Date().toISOString(),
    }],
  })),

  addActionItem: (meetingId, item) => set((state) => ({
    meetings: state.meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            action_items: [...m.action_items, {
              ...item,
              id: Date.now(),
              meeting_id: meetingId,
              created_at: new Date().toISOString(),
            }],
          }
        : m
    ),
  })),

  updateActionItem: (meetingId, itemId, updates) => set((state) => ({
    meetings: state.meetings.map((m) =>
      m.id === meetingId
        ? {
            ...m,
            action_items: m.action_items.map((ai) =>
              ai.id === itemId ? { ...ai, ...updates } : ai
            ),
          }
        : m
    ),
  })),

  addDiscussion: (discussion) => set((state) => ({
    discussions: [...state.discussions, {
      ...discussion,
      id: Date.now(),
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }],
  })),

  deleteDiscussion: (id) => set((state) => ({
    discussions: state.discussions.filter((d) => d.id !== id),
  })),

  addReply: (discussionId, reply) => set((state) => ({
    discussions: state.discussions.map((d) =>
      d.id === discussionId
        ? {
            ...d,
            replies: [...d.replies, {
              ...reply,
              id: Date.now(),
              created_at: new Date().toISOString(),
            }],
            updated_at: new Date().toISOString(),
          }
        : d
    ),
  })),

  addActivity: (activity) => set((state) => ({
    activities: [{
      ...activity,
      id: Date.now(),
    }, ...state.activities].slice(0, 20),
  })),
}));
