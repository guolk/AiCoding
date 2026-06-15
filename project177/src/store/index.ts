import { create } from "zustand";
import type {
  Event, Category, RoutePoint, Volunteer, Participant,
  BibNumber, PickupRecord, TimeRecord, Result,
  Award, Winner, Prize, PrizeDistribution, SurveyResponse,
} from "@/types";
import { mockData } from "@/data/mockData";
import { generateId } from "@/utils";

interface EventStore {
  currentEvent: Event | null;
  categories: Category[];
  routePoints: RoutePoint[];
  volunteers: Volunteer[];
  participants: Participant[];
  bibNumbers: BibNumber[];
  pickupRecords: PickupRecord[];
  timeRecords: TimeRecord[];
  results: Result[];
  awards: Award[];
  winners: Winner[];
  prizes: Prize[];
  prizeDistributions: PrizeDistribution[];
  surveyResponses: SurveyResponse[];

  initMockData: () => void;

  updateEvent: (event: Partial<Event>) => void;
  addCategory: (category: Omit<Category, "id" | "event_id">) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addRoutePoint: (point: Omit<RoutePoint, "id" | "event_id">) => void;
  updateRoutePoint: (id: string, data: Partial<RoutePoint>) => void;
  deleteRoutePoint: (id: string) => void;

  addVolunteer: (volunteer: Omit<Volunteer, "id" | "event_id">) => void;
  updateVolunteer: (id: string, data: Partial<Volunteer>) => void;
  deleteVolunteer: (id: string) => void;

  addParticipant: (participant: Omit<Participant, "id" | "event_id" | "registered_at">) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;

  assignBibNumbers: () => void;
  updateBibNumber: (id: string, number: number) => void;

  markPickup: (participantId: string, operator: string) => void;
  unmarkPickup: (participantId: string) => void;

  addStartTime: (participantId: string, time: string, source: TimeRecord["source"]) => void;
  addFinishTime: (participantId: string, time: string, source: TimeRecord["source"]) => void;
  importChipCSV: (rows: Record<string, string>[]) => number;
  calculateResults: () => void;

  addAward: (award: Omit<Award, "id" | "event_id">) => void;
  updateAward: (id: string, data: Partial<Award>) => void;
  deleteAward: (id: string) => void;
  generateWinners: () => void;
  markPresented: (winnerId: string, presenter: string) => void;

  addPrize: (prize: Omit<Prize, "id" | "event_id">) => void;
  updatePrize: (id: string, data: Partial<Prize>) => void;
  distributePrize: (prizeId: string, participantId: string, operator: string) => void;
}

const getEventId = () => mockData.events[0]?.id || "";

export const useEventStore = create<EventStore>((set, get) => ({
  currentEvent: null,
  categories: [],
  routePoints: [],
  volunteers: [],
  participants: [],
  bibNumbers: [],
  pickupRecords: [],
  timeRecords: [],
  results: [],
  awards: [],
  winners: [],
  prizes: [],
  prizeDistributions: [],
  surveyResponses: [],

  initMockData: () => {
    set({
      currentEvent: mockData.events[0] || null,
      categories: mockData.categories,
      routePoints: mockData.routePoints,
      volunteers: mockData.volunteers,
      participants: mockData.participants,
      bibNumbers: mockData.bibNumbers,
      pickupRecords: mockData.pickupRecords,
      timeRecords: mockData.timeRecords,
      results: mockData.results,
      awards: mockData.awards,
      winners: mockData.winners,
      prizes: mockData.prizes,
      prizeDistributions: mockData.prizeDistributions,
      surveyResponses: mockData.surveyResponses,
    });
  },

  updateEvent: (event) => set((state) => ({
    currentEvent: state.currentEvent ? { ...state.currentEvent, ...event } : null,
  })),

  addCategory: (category) => set((state) => ({
    categories: [...state.categories, { ...category, id: generateId(), event_id: getEventId() }],
  })),

  updateCategory: (id, data) => set((state) => ({
    categories: state.categories.map((c) => c.id === id ? { ...c, ...data } : c),
  })),

  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter((c) => c.id !== id),
  })),

  addRoutePoint: (point) => set((state) => ({
    routePoints: [...state.routePoints, { ...point, id: generateId(), event_id: getEventId() }],
  })),

  updateRoutePoint: (id, data) => set((state) => ({
    routePoints: state.routePoints.map((p) => p.id === id ? { ...p, ...data } : p),
  })),

  deleteRoutePoint: (id) => set((state) => ({
    routePoints: state.routePoints.filter((p) => p.id !== id),
  })),

  addVolunteer: (volunteer) => set((state) => ({
    volunteers: [...state.volunteers, { ...volunteer, id: generateId(), event_id: getEventId() }],
  })),

  updateVolunteer: (id, data) => set((state) => ({
    volunteers: state.volunteers.map((v) => v.id === id ? { ...v, ...data } : v),
  })),

  deleteVolunteer: (id) => set((state) => ({
    volunteers: state.volunteers.filter((v) => v.id !== id),
  })),

  addParticipant: (participant) => {
    const newParticipant: Participant = {
      ...participant,
      id: generateId(),
      event_id: getEventId(),
      registered_at: new Date().toISOString(),
    };
    set((state) => {
      const participants = [...state.participants, newParticipant];
      const cat = state.categories.find((c) => c.id === participant.category_id);
      const countInCat = participants.filter((p) => p.category_id === participant.category_id).length;
      const bibNumber: BibNumber = {
        id: generateId(),
        participant_id: newParticipant.id,
        category_id: participant.category_id,
        prefix: cat?.bib_prefix || "EX",
        number: (cat?.bib_start || 100) + countInCat - 1,
      };
      const pickupRecord: PickupRecord = {
        id: generateId(),
        participant_id: newParticipant.id,
        picked: false,
      };
      return {
        participants,
        bibNumbers: [...state.bibNumbers, bibNumber],
        pickupRecords: [...state.pickupRecords, pickupRecord],
      };
    });
  },

  updateParticipant: (id, data) => set((state) => ({
    participants: state.participants.map((p) => p.id === id ? { ...p, ...data } : p),
  })),

  deleteParticipant: (id) => set((state) => ({
    participants: state.participants.filter((p) => p.id !== id),
    bibNumbers: state.bibNumbers.filter((b) => b.participant_id !== id),
    pickupRecords: state.pickupRecords.filter((r) => r.participant_id !== id),
    timeRecords: state.timeRecords.filter((r) => r.participant_id !== id),
    results: state.results.filter((r) => r.participant_id !== id),
  })),

  assignBibNumbers: () => set((state) => {
    const categories = state.categories;
    const participants = [...state.participants].sort((a, b) =>
      new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime()
    );
    const newBibs: BibNumber[] = [];
    
    for (const cat of categories) {
      const catParticipants = participants.filter((p) => p.category_id === cat.id);
      catParticipants.forEach((p, idx) => {
        const existing = state.bibNumbers.find((b) => b.participant_id === p.id);
        newBibs.push({
          id: existing?.id || generateId(),
          participant_id: p.id,
          category_id: cat.id,
          prefix: cat.bib_prefix,
          number: cat.bib_start + idx,
        });
      });
    }
    return { bibNumbers: newBibs };
  }),

  updateBibNumber: (id, number) => set((state) => ({
    bibNumbers: state.bibNumbers.map((b) => b.id === id ? { ...b, number } : b),
  })),

  markPickup: (participantId, operator) => set((state) => ({
    pickupRecords: state.pickupRecords.map((r) =>
      r.participant_id === participantId
        ? { ...r, picked: true, picked_at: new Date().toISOString(), operator }
        : r
    ),
  })),

  unmarkPickup: (participantId) => set((state) => ({
    pickupRecords: state.pickupRecords.map((r) =>
      r.participant_id === participantId
        ? { ...r, picked: false, picked_at: undefined, operator: undefined }
        : r
    ),
  })),

  addStartTime: (participantId, time, source) => set((state) => {
    const existing = state.timeRecords.find((r) => r.participant_id === participantId);
    if (existing) {
      return {
        timeRecords: state.timeRecords.map((r) =>
          r.id === existing.id ? { ...r, start_time: time, source, dns: false } : r
        ),
      };
    }
    return {
      timeRecords: [...state.timeRecords, {
        id: generateId(),
        participant_id: participantId,
        start_time: time,
        source,
      }],
    };
  }),

  addFinishTime: (participantId, time, source) => set((state) => {
    const existing = state.timeRecords.find((r) => r.participant_id === participantId);
    if (existing) {
      return {
        timeRecords: state.timeRecords.map((r) =>
          r.id === existing.id ? { ...r, finish_time: time, source, dnf: false } : r
        ),
      };
    }
    return {
      timeRecords: [...state.timeRecords, {
        id: generateId(),
        participant_id: participantId,
        finish_time: time,
        source,
      }],
    };
  }),

  importChipCSV: (rows) => {
    let count = 0;
    set((state) => {
      const bibMap = new Map<string, string>();
      state.bibNumbers.forEach((b) => {
        bibMap.set(`${b.prefix}${b.number}`, b.participant_id);
        bibMap.set(String(b.number), b.participant_id);
      });

      const newTimeRecords = [...state.timeRecords];
      for (const row of rows) {
        const bib = row.bib || row.number || row.chip || row["号码布"] || "";
        const startTime = row.start_time || row.start || row["出发时间"] || "";
        const finishTime = row.finish_time || row.finish || row.time || row["成绩"] || row["到达时间"] || "";
        const participantId = bibMap.get(bib) || bibMap.get(bib.toUpperCase());
        
        if (participantId) {
          const idx = newTimeRecords.findIndex((r) => r.participant_id === participantId);
          if (idx >= 0) {
            newTimeRecords[idx] = {
              ...newTimeRecords[idx],
              start_time: startTime || newTimeRecords[idx].start_time,
              finish_time: finishTime || newTimeRecords[idx].finish_time,
              source: "csv",
            };
            count++;
          } else {
            newTimeRecords.push({
              id: generateId(),
              participant_id: participantId,
              start_time: startTime || undefined,
              finish_time: finishTime || undefined,
              source: "csv",
            });
            count++;
          }
        }
      }
      return { timeRecords: newTimeRecords };
    });
    return count;
  },

  calculateResults: () => set((state) => {
    const results: Result[] = [];
    const categories = state.categories;
    
    for (const participant of state.participants) {
      const cat = categories.find((c) => c.id === participant.category_id);
      const timeRecord = state.timeRecords.find((t) => t.participant_id === participant.id);
      let status: Result["status"] = "pending";
      let gunTime = 0;
      let netTime = 0;
      
      if (timeRecord?.dns) {
        status = "dns";
      } else if (timeRecord?.dnf) {
        status = "dnf";
      } else if (timeRecord?.start_time && timeRecord?.finish_time) {
        status = "finished";
        gunTime = (new Date(timeRecord.finish_time).getTime() - new Date(timeRecord.start_time).getTime()) / 1000;
        netTime = gunTime;
      } else if (state.results.find((r) => r.participant_id === participant.id)) {
        const existing = state.results.find((r) => r.participant_id === participant.id)!;
        status = existing.status;
        gunTime = existing.gun_time_seconds;
        netTime = existing.net_time_seconds;
      }
      
      const avgSpeed = status === "finished" 
        ? Math.round(((cat?.distance_km || state.currentEvent?.distance_km || 0) / (gunTime / 3600)) * 100) / 100
        : 0;
      const pace = status === "finished" && cat?.distance_km
        ? (gunTime / 60) / cat.distance_km
        : 0;
      
      results.push({
        id: generateId(),
        participant_id: participant.id,
        category_id: participant.category_id,
        gun_time_seconds: gunTime,
        net_time_seconds: netTime,
        avg_speed: avgSpeed,
        overall_rank: 0,
        category_rank: 0,
        status,
        pace_min_per_km: pace,
      });
    }

    const finishedResults = results.filter((r) => r.status === "finished").sort((a, b) => a.net_time_seconds - b.net_time_seconds);
    finishedResults.forEach((r, idx) => {
      const target = results.find((res) => res.id === r.id);
      if (target) target.overall_rank = idx + 1;
    });

    for (const cat of categories) {
      const catFinished = results
        .filter((r) => r.category_id === cat.id && r.status === "finished")
        .sort((a, b) => a.net_time_seconds - b.net_time_seconds);
      catFinished.forEach((r, idx) => {
        const target = results.find((res) => res.id === r.id);
        if (target) target.category_rank = idx + 1;
      });
    }

    return { results };
  }),

  addAward: (award) => set((state) => ({
    awards: [...state.awards, { ...award, id: generateId(), event_id: getEventId() }],
  })),

  updateAward: (id, data) => set((state) => ({
    awards: state.awards.map((a) => a.id === id ? { ...a, ...data } : a),
  })),

  deleteAward: (id) => set((state) => ({
    awards: state.awards.filter((a) => a.id !== id),
    winners: state.winners.filter((w) => w.award_id !== id),
  })),

  generateWinners: () => set((state) => {
    const newWinners: Winner[] = [...state.winners];
    
    for (const award of state.awards) {
      if (state.winners.some((w) => w.award_id === award.id)) continue;

      let eligibleResults: Result[] = [];
      
      if (award.type === "overall") {
        eligibleResults = state.results
          .filter((r) => r.status === "finished")
          .sort((a, b) => a.net_time_seconds - b.net_time_seconds);
      } else if (award.type === "category" && award.category_id) {
        eligibleResults = state.results
          .filter((r) => r.category_id === award.category_id && r.status === "finished")
          .sort((a, b) => a.net_time_seconds - b.net_time_seconds);
      } else if (award.type === "special") {
        if (award.name.includes("年轻")) {
          const sorted = [...state.participants]
            .filter((p) => state.results.some((r) => r.participant_id === p.id && r.status === "finished"))
            .sort((a, b) => new Date(b.birth_date).getTime() - new Date(a.birth_date).getTime());
          if (sorted[0]) {
            newWinners.push({
              id: generateId(),
              award_id: award.id,
              participant_id: sorted[0].id,
              presented: false,
            });
          }
          continue;
        } else if (award.name.includes("老将") || award.name.includes("年长")) {
          const sorted = [...state.participants]
            .filter((p) => state.results.some((r) => r.participant_id === p.id && r.status === "finished"))
            .sort((a, b) => new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime());
          if (sorted[0]) {
            newWinners.push({
              id: generateId(),
              award_id: award.id,
              participant_id: sorted[0].id,
              presented: false,
            });
          }
          continue;
        } else {
          const finished = state.results.filter((r) => r.status === "finished");
          const rand = finished[Math.floor(Math.random() * Math.min(5, finished.length))];
          if (rand) {
            newWinners.push({
              id: generateId(),
              award_id: award.id,
              participant_id: rand.participant_id,
              presented: false,
            });
          }
          continue;
        }
      }

      const range = eligibleResults.slice(award.rank_from - 1, award.rank_to);
      for (const result of range) {
        newWinners.push({
          id: generateId(),
          award_id: award.id,
          participant_id: result.participant_id,
          presented: false,
        });
      }
    }

    return { winners: newWinners };
  }),

  markPresented: (winnerId, presenter) => set((state) => ({
    winners: state.winners.map((w) =>
      w.id === winnerId
        ? { ...w, presented: true, presented_at: new Date().toISOString(), presenter }
        : w
    ),
  })),

  addPrize: (prize) => set((state) => ({
    prizes: [...state.prizes, { ...prize, id: generateId(), event_id: getEventId(), distributed: 0 }],
  })),

  updatePrize: (id, data) => set((state) => ({
    prizes: state.prizes.map((p) => p.id === id ? { ...p, ...data } : p),
  })),

  distributePrize: (prizeId, participantId, operator) => set((state) => {
    const prize = state.prizes.find((p) => p.id === prizeId);
    if (!prize || prize.distributed >= prize.total_quantity) return {};
    
    return {
      prizes: state.prizes.map((p) => p.id === prizeId ? { ...p, distributed: p.distributed + 1 } : p),
      prizeDistributions: [...state.prizeDistributions, {
        id: generateId(),
        prize_id: prizeId,
        participant_id: participantId,
        distributed_at: new Date().toISOString(),
        operator,
        quantity: 1,
      }],
    };
  }),
}));
