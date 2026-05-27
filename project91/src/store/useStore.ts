import { create } from 'zustand';
import {
  Volunteer,
  Activity,
  Organization,
  ServiceDemand,
  Registration,
  Material,
  ActivityReview,
  Feedback,
  Group,
  Announcement,
  FinanceRecord,
} from '@/types';
import {
  mockVolunteers,
  mockActivities,
  mockOrganization,
  mockServiceDemands,
} from '@/data/mockData';

interface Store {
  volunteers: Volunteer[];
  activities: Activity[];
  organization: Organization;
  serviceDemands: ServiceDemand[];
  currentUser: Volunteer | null;

  addVolunteer: (volunteer: Omit<Volunteer, 'id'>) => void;
  updateVolunteer: (id: string, volunteer: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;

  addActivity: (activity: Omit<Activity, 'id' | 'registrations' | 'materials' | 'feedbacks'>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addRegistration: (activityId: string, registration: Omit<Registration, 'id'>) => void;
  updateRegistration: (activityId: string, registrationId: string, data: Partial<Registration>) => void;
  addMaterial: (activityId: string, material: Omit<Material, 'id'>) => void;
  updateMaterial: (activityId: string, materialId: string, data: Partial<Material>) => void;
  deleteMaterial: (activityId: string, materialId: string) => void;
  addActivityReview: (activityId: string, review: Omit<ActivityReview, 'id'>) => void;
  addFeedback: (activityId: string, feedback: Omit<Feedback, 'id'>) => void;

  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  deleteAnnouncement: (id: string) => void;
  addFinanceRecord: (record: Omit<FinanceRecord, 'id'>) => void;

  addServiceDemand: (demand: Omit<ServiceDemand, 'id' | 'applicants' | 'matchedVolunteers'>) => void;
  updateServiceDemand: (id: string, demand: Partial<ServiceDemand>) => void;
  deleteServiceDemand: (id: string) => void;
  applyForDemand: (demandId: string, applicant: { volunteerId: string; volunteerName: string }) => void;
  approveApplicant: (demandId: string, volunteerId: string) => void;
  rejectApplicant: (demandId: string, volunteerId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<Store>((set) => ({
  volunteers: mockVolunteers,
  activities: mockActivities,
  organization: mockOrganization,
  serviceDemands: mockServiceDemands,
  currentUser: mockVolunteers[0],

  addVolunteer: (volunteer) =>
    set((state) => ({
      volunteers: [...state.volunteers, { ...volunteer, id: generateId() }],
    })),
  updateVolunteer: (id, volunteer) =>
    set((state) => ({
      volunteers: state.volunteers.map((v) => (v.id === id ? { ...v, ...volunteer } : v)),
    })),
  deleteVolunteer: (id) =>
    set((state) => ({
      volunteers: state.volunteers.filter((v) => v.id !== id),
    })),

  addActivity: (activity) =>
    set((state) => ({
      activities: [
        ...state.activities,
        { ...activity, id: generateId(), registrations: [], materials: [], feedbacks: [] },
      ],
    })),
  updateActivity: (id, activity) =>
    set((state) => ({
      activities: state.activities.map((a) => (a.id === id ? { ...a, ...activity } : a)),
    })),
  deleteActivity: (id) =>
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
    })),
  addRegistration: (activityId, registration) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? { ...a, registrations: [...a.registrations, { ...registration, id: generateId() }] }
          : a
      ),
    })),
  updateRegistration: (activityId, registrationId, data) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              registrations: a.registrations.map((r) =>
                r.id === registrationId ? { ...r, ...data } : r
              ),
            }
          : a
      ),
    })),
  addMaterial: (activityId, material) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? { ...a, materials: [...a.materials, { ...material, id: generateId() }] }
          : a
      ),
    })),
  updateMaterial: (activityId, materialId, data) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              materials: a.materials.map((m) => (m.id === materialId ? { ...m, ...data } : m)),
            }
          : a
      ),
    })),
  deleteMaterial: (activityId, materialId) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? { ...a, materials: a.materials.filter((m) => m.id !== materialId) }
          : a
      ),
    })),
  addActivityReview: (activityId, review) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, review: { ...review, id: generateId() } } : a
      ),
    })),
  addFeedback: (activityId, feedback) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? { ...a, feedbacks: [...a.feedbacks, { ...feedback, id: generateId() }] }
          : a
      ),
    })),

  addGroup: (group) =>
    set((state) => ({
      organization: {
        ...state.organization,
        groups: [...state.organization.groups, { ...group, id: generateId() }],
      },
    })),
  updateGroup: (id, group) =>
    set((state) => ({
      organization: {
        ...state.organization,
        groups: state.organization.groups.map((g) => (g.id === id ? { ...g, ...group } : g)),
      },
    })),
  deleteGroup: (id) =>
    set((state) => ({
      organization: {
        ...state.organization,
        groups: state.organization.groups.filter((g) => g.id !== id),
      },
    })),
  addAnnouncement: (announcement) =>
    set((state) => ({
      organization: {
        ...state.organization,
        announcements: [
          { ...announcement, id: generateId() },
          ...state.organization.announcements,
        ],
      },
    })),
  deleteAnnouncement: (id) =>
    set((state) => ({
      organization: {
        ...state.organization,
        announcements: state.organization.announcements.filter((a) => a.id !== id),
      },
    })),
  addFinanceRecord: (record) =>
    set((state) => ({
      organization: {
        ...state.organization,
        finances: [...state.organization.finances, { ...record, id: generateId() }],
      },
    })),

  addServiceDemand: (demand) =>
    set((state) => ({
      serviceDemands: [
        ...state.serviceDemands,
        { ...demand, id: generateId(), applicants: [], matchedVolunteers: [] },
      ],
    })),
  updateServiceDemand: (id, demand) =>
    set((state) => ({
      serviceDemands: state.serviceDemands.map((d) => (d.id === id ? { ...d, ...demand } : d)),
    })),
  deleteServiceDemand: (id) =>
    set((state) => ({
      serviceDemands: state.serviceDemands.filter((d) => d.id !== id),
    })),
  applyForDemand: (demandId, applicant) =>
    set((state) => ({
      serviceDemands: state.serviceDemands.map((d) =>
        d.id === demandId
          ? {
              ...d,
              applicants: [
                ...d.applicants,
                { ...applicant, applyTime: new Date().toISOString(), status: 'pending' },
              ],
            }
          : d
      ),
    })),
  approveApplicant: (demandId, volunteerId) =>
    set((state) => ({
      serviceDemands: state.serviceDemands.map((d) =>
        d.id === demandId
          ? {
              ...d,
              applicants: d.applicants.map((a) =>
                a.volunteerId === volunteerId ? { ...a, status: 'approved' } : a
              ),
              matchedVolunteers: [...d.matchedVolunteers, volunteerId],
            }
          : d
      ),
    })),
  rejectApplicant: (demandId, volunteerId) =>
    set((state) => ({
      serviceDemands: state.serviceDemands.map((d) =>
        d.id === demandId
          ? {
              ...d,
              applicants: d.applicants.map((a) =>
                a.volunteerId === volunteerId ? { ...a, status: 'rejected' } : a
              ),
            }
          : d
      ),
    })),
}));
