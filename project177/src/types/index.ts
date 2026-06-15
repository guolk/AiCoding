export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  distance_km: number;
  description: string;
  status: "draft" | "registration" | "ongoing" | "finished";
  elevation: number;
  max_participants: number;
}

export interface Category {
  id: string;
  event_id: string;
  name: string;
  gender: "male" | "female" | "mixed";
  age_min: number;
  age_max: number;
  fee: number;
  bib_prefix: string;
  bib_start: number;
  distance_km: number;
}

export interface RoutePoint {
  id: string;
  event_id: string;
  type: "start" | "finish" | "aid" | "cutoff";
  name: string;
  position_x: number;
  position_y: number;
  cut_off_time?: string;
  distance_km?: number;
}

export interface Volunteer {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  area: string;
  status: "pending" | "confirmed" | "arrived" | "completed";
  assigned_at?: string;
}

export interface Participant {
  id: string;
  event_id: string;
  category_id: string;
  name: string;
  gender: "male" | "female";
  birth_date: string;
  phone: string;
  email?: string;
  id_card?: string;
  emergency_contact: string;
  emergency_phone: string;
  health_declaration: boolean;
  registered_at: string;
  team?: string;
}

export interface BibNumber {
  id: string;
  participant_id: string;
  category_id: string;
  number: number;
  prefix: string;
}

export interface PickupRecord {
  id: string;
  participant_id: string;
  picked: boolean;
  picked_at?: string;
  operator?: string;
  items?: string[];
}

export interface TimeRecord {
  id: string;
  participant_id: string;
  start_time?: string;
  finish_time?: string;
  split_times?: { point_id: string; time: string }[];
  source: "manual" | "chip" | "csv";
  dnf?: boolean;
  dns?: boolean;
}

export interface Result {
  id: string;
  participant_id: string;
  category_id: string;
  gun_time_seconds: number;
  net_time_seconds: number;
  avg_speed: number;
  overall_rank: number;
  category_rank: number;
  status: "finished" | "dnf" | "dns" | "pending";
  pace_min_per_km: number;
}

export interface Award {
  id: string;
  event_id: string;
  category_id?: string;
  name: string;
  type: "category" | "overall" | "special";
  rank_from: number;
  rank_to: number;
  prize_id?: string;
  description?: string;
}

export interface Winner {
  id: string;
  award_id: string;
  participant_id: string;
  presented: boolean;
  presented_at?: string;
  presenter?: string;
}

export interface Prize {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  total_quantity: number;
  distributed: number;
  value?: number;
  image_url?: string;
}

export interface PrizeDistribution {
  id: string;
  prize_id: string;
  participant_id: string;
  distributed_at: string;
  operator: string;
  quantity: number;
}

export interface SurveyResponse {
  id: string;
  event_id: string;
  participant_id?: string;
  overall_rating: number;
  route_rating: number;
  organization_rating: number;
  aid_stations_rating: number;
  swag_rating: number;
  would_recommend: boolean;
  comments?: string;
  submitted_at: string;
}

export interface AppState {
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
}
