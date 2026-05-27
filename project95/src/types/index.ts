export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'leader' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'proposed' | 'in_progress' | 'completed' | 'published';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description: string;
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  milestone_id: number | null;
  title: string;
  description: string;
  assignee_id: number;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface LabRecord {
  id: number;
  user_id: number;
  project_id: number;
  experiment_date: string;
  purpose: string;
  method: string;
  results: string;
  conclusion: string;
  conditions: ExperimentCondition;
  created_at: string;
  updated_at: string;
}

export interface ExperimentCondition {
  reagents: Reagent[];
  instruments: Instrument[];
  environment: Environment;
}

export interface Reagent {
  name: string;
  batch: string;
  supplier: string;
}

export interface Instrument {
  name: string;
  model: string;
  settings: string;
}

export interface Environment {
  temperature: number;
  humidity: number;
  lighting: string;
}

export interface DataVersion {
  id: number;
  lab_record_id: number;
  version_number: number;
  file_name: string;
  file_path: string;
  data_type: string;
  description: string;
  created_at: string;
}

export interface Literature {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  url: string;
  added_by: number;
  created_at: string;
}

export interface ReadingProgress {
  id: number;
  literature_id: number;
  user_id: number;
  status: 'unread' | 'reading' | 'finished';
  progress: number;
  recommended: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReadingReport {
  id: number;
  literature_id: number;
  user_id: number;
  summary: string;
  key_points: string[];
  comments: string;
  created_at: string;
}

export interface Achievement {
  id: number;
  project_id: number;
  title: string;
  type: 'paper' | 'patent' | 'report';
  status: 'draft' | 'submitted' | 'reviewing' | 'accepted' | 'published';
  details: string;
  versions: AchievementVersion[];
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface AchievementVersion {
  version_number: number;
  file_name: string;
  file_path: string;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  minutes: string;
  hosted_by: number;
  action_items: ActionItem[];
  created_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  description: string;
  assignee_id: number;
  due_date: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface Discussion {
  id: number;
  title: string;
  content: string;
  tags: string[];
  created_by: number;
  project_id: number | null;
  replies: Reply[];
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: number;
  content: string;
  created_by: number;
  created_at: string;
}

export interface Activity {
  id: number;
  type: 'project' | 'task' | 'lab_record' | 'literature' | 'achievement' | 'meeting' | 'discussion';
  user_id: number;
  content: string;
  created_at: string;
}
