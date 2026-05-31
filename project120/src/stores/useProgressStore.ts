import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Skill, Milestone, AnalyticsData } from '@/types';
import { mockSkills, mockMilestones } from '@/utils/mockData';
import { generateId } from '@/utils/storage';

interface ProgressState {
  skills: Skill[];
  milestones: Milestone[];
  addSkill: (skill: Omit<Skill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  getSkillsBySport: (sportType: string) => Skill[];
  getSkillsByCategory: (sportType: string, category: string) => Skill[];
  getRecentMilestones: (limit?: number) => Milestone[];
  getAnalytics: (sportType?: string) => AnalyticsData;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      skills: mockSkills,
      milestones: mockMilestones,
      addSkill: (skill) => {
        const newSkill: Skill = {
          ...skill,
          id: generateId(),
        };
        set((state) => ({
          skills: [...state.skills, newSkill],
        }));
      },
      updateSkill: (id, updates) => {
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },
      addMilestone: (milestone) => {
        const newMilestone: Milestone = {
          ...milestone,
          id: generateId(),
        };
        set((state) => ({
          milestones: [newMilestone, ...state.milestones],
        }));
      },
      getSkillsBySport: (sportType) => {
        return get().skills.filter((s) => s.sportType === sportType);
      },
      getSkillsByCategory: (sportType, category) => {
        return get().skills.filter(
          (s) => s.sportType === sportType && s.category === category
        );
      },
      getRecentMilestones: (limit = 5) => {
        return [...get().milestones]
          .sort(
            (a, b) =>
              new Date(b.achievedDate).getTime() -
              new Date(a.achievedDate).getTime()
          )
          .slice(0, limit);
      },
      getAnalytics: (sportType) => {
        const skills = sportType
          ? get().skills.filter((s) => s.sportType === sportType)
          : get().skills;
        
        const totalSessions = skills.reduce(
          (sum, s) => sum + s.trainingSessions,
          0
        );
        
        const masteredSkills = skills.filter(
          (s) => s.masteryDate && s.progressPercent === 100
        );
        
        const avgDaysToMaster =
          masteredSkills.length > 0
            ? masteredSkills.reduce((sum, s) => {
                if (s.firstAttemptDate && s.masteryDate) {
                  const days =
                    (new Date(s.masteryDate).getTime() -
                      new Date(s.firstAttemptDate).getTime()) /
                    (1000 * 60 * 60 * 24);
                  return sum + days;
                }
                return sum;
              }, 0) / masteredSkills.length
            : 0;

        const categories = [...new Set(skills.map((s) => s.category))];
        const skillDistribution = categories.map((cat) => {
          const catSkills = skills.filter((s) => s.category === cat);
          const avgProgress =
            catSkills.reduce((sum, s) => sum + s.progressPercent, 0) /
            catSkills.length;
          return { category: cat, progress: Math.round(avgProgress) };
        });

        const last8Weeks = Array.from({ length: 8 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (7 - i) * 7);
          return {
            week: `第${8 - i}周`,
            hours: 4 + Math.random() * 6,
            sessions: 2 + Math.floor(Math.random() * 3),
          };
        });

        return {
          totalTrainingHours: totalSessions * 2,
          totalSessions: totalSessions,
          averageSessionsPerWeek: 3.5,
          skillMasteryAverageDays: Math.round(avgDaysToMaster),
          progressTrend: 'improving',
          weeklyData: last8Weeks,
          skillDistribution,
        };
      },
    }),
    {
      name: 'progress-storage',
    }
  )
);
