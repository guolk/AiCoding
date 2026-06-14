export interface Institution {
  id: number;
  name: string;
  mission: string;
  operation_mode: string;
  transparency_rating: number;
  created_at: string;
}

export interface Donation {
  id: number;
  donation_date: string;
  institution_id: number;
  institution_name?: string;
  amount: number;
  payment_method: string;
  purpose: string;
  notes: string;
  created_at: string;
}

export interface DonationReceipt {
  id: number;
  donation_id: number;
  file_path: string;
  file_type: string;
  created_at: string;
}

export interface AnnualReport {
  id: number;
  institution_id: number;
  year: number;
  financial_summary: string;
  project_outcomes: string;
  created_at: string;
}

export interface CredibilityAssessment {
  id: number;
  institution_id: number;
  has_public_finance: boolean;
  has_third_party_audit: boolean;
  assessment_notes: string;
  assessment_date: string;
  created_at: string;
}

export interface VolunteerRecord {
  id: number;
  service_date: string;
  hours: number;
  service_type: string;
  beneficiary_group: string;
  institution_id: number;
  institution_name?: string;
  notes: string;
  created_at: string;
}

export interface ItemDonation {
  id: number;
  donation_date: string;
  item_name: string;
  quantity: number;
  condition: string;
  institution_id: number;
  institution_name?: string;
  notes: string;
  created_at: string;
}

export interface OnlineAction {
  id: number;
  action_date: string;
  action_type: string;
  initiative_name: string;
  institution_id: number;
  institution_name?: string;
  notes: string;
  created_at: string;
}

export interface ProjectProgress {
  id: number;
  donation_id: number;
  update_date: string;
  progress_description: string;
  status: string;
  created_at: string;
}

export interface ImpactEstimate {
  id: number;
  donation_id: number;
  people_helped: number;
  description: string;
  created_at: string;
}

export interface InstitutionStatistics {
  institution_id: number;
  institution_name: string;
  total_amount: number;
  donation_count: number;
}

export interface AnnualReportData {
  year: number;
  total_donations: number;
  total_volunteer_hours: number;
  donation_count: number;
  volunteer_count: number;
  institutions_count: number;
  donations_by_month: { month: number; amount: number }[];
  donations_by_institution: { name: string; amount: number }[];
  volunteer_by_month: { month: number; hours: number }[];
  total_people_helped: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
