export interface Plot {
  id: string;
  plot_number: string;
  area: number;
  soil_type: string;
  previous_crop: string;
  irrigation_method: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface PlantingRecord {
  id: string;
  plot_id: string;
  crop_variety: string;
  sowing_date: string;
  harvest_date?: string;
  yield?: number;
  year: number;
  notes?: string;
  created_at: string;
}

export interface SoilTest {
  id: string;
  plot_id: string;
  test_date: string;
  ph?: number;
  organic_matter?: number;
  total_nitrogen?: number;
  available_phosphorus?: number;
  available_potassium?: number;
  testing_agency?: string;
  notes?: string;
  created_at: string;
}

export interface Pesticide {
  id: string;
  name: string;
  brand?: string;
  active_ingredient?: string;
  purchase_date?: string;
  batch_number?: string;
  type: 'pesticide' | 'fertilizer';
  quantity?: number;
  unit?: string;
  notes?: string;
  created_at: string;
}

export interface Machinery {
  id: string;
  name: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface FarmingOperation {
  id: string;
  plot_id: string;
  operation_type: string;
  operation_date: string;
  operation_area?: number;
  pesticide_id?: string;
  pesticide_quantity?: number;
  fertilizer_id?: string;
  fertilizer_quantity?: number;
  machinery_id?: string;
  operation_hours?: number;
  fuel_consumption?: number;
  operator?: string;
  cost?: number;
  notes?: string;
  created_at: string;
}

export interface PestDisease {
  id: string;
  name: string;
  type: string;
  symptoms?: string;
  common_season?: string;
  prevention_methods?: string;
  created_at: string;
}

export interface PestDiseaseRecord {
  id: string;
  plot_id: string;
  pest_disease_id?: string;
  discovery_date: string;
  symptoms: string;
  affected_area?: number;
  severity?: string;
  photos?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface ControlMeasure {
  id: string;
  pest_record_id: string;
  measure_type: string;
  measure_date: string;
  pesticide_id?: string;
  quantity?: number;
  description?: string;
  operator?: string;
  effect?: string;
  notes?: string;
  created_at: string;
}

export interface HarvestRecord {
  id: string;
  plot_id: string;
  planting_record_id?: string;
  harvest_date: string;
  yield: number;
  quality_grade?: string;
  unit_price?: number;
  total_revenue?: number;
  notes?: string;
  created_at: string;
}

export interface TraceabilityCode {
  id: string;
  code: string;
  harvest_record_id: string;
  plot_id: string;
  generated_at: string;
  batch_number?: string;
  product_info?: string;
  qr_code_path?: string;
}

export interface YieldAnalysis {
  plot_id: string;
  plot_number: string;
  total_input_cost: number;
  total_yield: number;
  area: number;
  cost_per_mu: number;
  yield_per_mu: number;
  revenue_per_mu: number;
  profit_per_mu: number;
}

export interface VarietyYieldCompare {
  crop_variety: string;
  average_yield: number;
  total_yield: number;
  count: number;
  average_area: number;
  yield_per_mu: number;
}

export interface PestSeasonPattern {
  month: number;
  pest_name: string;
  count: number;
}

export interface TraceabilityData {
  traceability_code: TraceabilityCode;
  harvest_record: HarvestRecord & { plot?: Plot; planting_record?: PlantingRecord };
  soil_tests: SoilTest[];
  farming_operations: (FarmingOperation & { pesticide?: Pesticide; fertilizer?: Pesticide; machinery?: Machinery })[];
  pest_records: (PestDiseaseRecord & { pest_disease?: PestDisease; control_measures?: ControlMeasure[] })[];
}
