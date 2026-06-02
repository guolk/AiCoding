import { create } from 'zustand';
import type { Activity, ActivityParticipant, ActivityFeedback } from '../types';
import { mockActivities } from '../data/mockData';
import { generateId, saveToLocalStorage, loadFromLocalStorage } from '../utils/helpers';

interface ActivityStore {
  activities: Activity[];
  loadActivities: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'participants' | 'feedbacks'> & { participantIds: string[] }) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  getActivityById: (id: string) => Activity | undefined;
  addParticipant: (activityId: string, participant: ActivityParticipant) => void;
  updateParticipantStatus: (activityId: string, projectId: string, status: ActivityParticipant['status']) => void;
  checkInParticipant: (activityId: string, projectId: string) => void;
  addActivityFeedback: (activityId: string, feedback: Omit<ActivityFeedback, 'id'>) => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],

  loadActivities: () => {
    const saved = loadFromLocalStorage<Activity[]>('incubator_activities', mockActivities);
    set({ activities: saved });
  },

  addActivity: (activity) => {
    const participants: ActivityParticipant[] = activity.participantIds.map((pid) => ({
      projectId: pid,
      checkedIn: false,
      status: 'registered',
    }));

    const newActivity: Activity = {
      id: generateId(),
      type: activity.type,
      name: activity.name,
      date: activity.date,
      location: activity.location,
      description: activity.description,
      status: activity.status,
      participants,
      feedbacks: [],
    };

    const activities = [...get().activities, newActivity];
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  updateActivity: (id, updates) => {
    const activities = get().activities.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  deleteActivity: (id) => {
    const activities = get().activities.filter((a) => a.id !== id);
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  getActivityById: (id) => {
    return get().activities.find((a) => a.id === id);
  },

  addParticipant: (activityId, participant) => {
    const activities = get().activities.map((a) =>
      a.id === activityId
        ? { ...a, participants: [...a.participants, participant] }
        : a
    );
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  updateParticipantStatus: (activityId, projectId, status) => {
    const activities = get().activities.map((a) =>
      a.id === activityId
        ? {
            ...a,
            participants: a.participants.map((p) =>
              p.projectId === projectId ? { ...p, status } : p
            ),
          }
        : a
    );
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  checkInParticipant: (activityId, projectId) => {
    const now = new Date().toTimeString().substring(0, 5);
    const activities = get().activities.map((a) =>
      a.id === activityId
        ? {
            ...a,
            participants: a.participants.map((p) =>
              p.projectId === projectId
                ? { ...p, checkedIn: true, checkInTime: now, status: 'signed_in' as const }
                : p
            ),
          }
        : a
    );
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },

  addActivityFeedback: (activityId, feedback) => {
    const newFeedback: ActivityFeedback = {
      ...feedback,
      id: generateId(),
    };
    const activities = get().activities.map((a) =>
      a.id === activityId
        ? { ...a, feedbacks: [...a.feedbacks, newFeedback] }
        : a
    );
    set({ activities });
    saveToLocalStorage('incubator_activities', activities);
  },
}));
