export type SetStatus = 'owned' | 'building' | 'completed' | 'disassembled' | 'wishlist';

export type ProjectStatus = 'planning' | 'in_progress' | 'completed';

export interface LegoSet {
  id: string;
  set_num: string;
  name: string;
  theme: string;
  year: number;
  num_parts: number;
  cover_image_url: string;
  status: SetStatus;
  storage_location: string;
  purchase_price?: number;
  purchase_date?: string;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  part_num: string;
  part_name: string;
  color_id: number;
  color_name: string;
  color_rgb: string;
  quantity: number;
  min_quantity: number;
  image_url?: string;
  source: 'set' | 'spare' | 'purchase' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  related_set_id?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  design_documents: string[];
  total_hours: number;
  started_at?: string;
  completed_at?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectStep {
  id: string;
  project_id: string;
  step_number: number;
  name: string;
  description: string;
  estimated_hours: number;
  actual_hours: number;
  photo_url?: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface BOMItem {
  id: string;
  project_id: string;
  part_num: string;
  part_name: string;
  color_id: number;
  color_name: string;
  color_rgb: string;
  required_quantity: number;
  available_quantity: number;
  created_at: string;
}

export interface Work {
  id: string;
  project_id?: string;
  title: string;
  description: string;
  difficulty_rating: number;
  satisfaction_rating: number;
  is_public: boolean;
  share_token: string;
  created_at: string;
}

export interface WorkPhoto {
  id: string;
  work_id: string;
  photo_url: string;
  caption?: string;
  display_order: number;
  is_cover: boolean;
  created_at: string;
}

export interface RebrickableSet {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string;
  set_url: string;
  last_modified_dt: string;
}

export interface RebrickablePart {
  part_num: string;
  name: string;
  part_cat_id: number;
  part_url: string;
  part_img_url: string;
}

export interface RebrickableColor {
  id: number;
  name: string;
  rgb: string;
  is_trans: boolean;
}

export interface ThemeDistribution {
  theme: string;
  count: number;
  color: string;
}

export interface AnalyticsData {
  totalSets: number;
  totalParts: number;
  totalValue: number;
  totalHours: number;
  completedProjects: number;
  themeDistribution: ThemeDistribution[];
  yearDistribution: { year: number; count: number }[];
}

export interface MissingPart {
  part_num: string;
  part_name: string;
  color_name: string;
  color_rgb: string;
  required: number;
  available: number;
  missing: number;
}

export interface RecentActivity {
  id: string;
  type: 'set' | 'inventory' | 'project' | 'work';
  action: 'added' | 'updated' | 'completed';
  title: string;
  timestamp: string;
}
