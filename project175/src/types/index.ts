export type TimeOfDay = 'morning' | 'evening' | 'other';

export type MeasurementCondition = 'resting' | 'after-exercise' | 'after-meal' | 'before-medication' | 'after-medication' | 'other';

export type MeasurementDevice = 'upper-arm' | 'wrist' | 'hospital' | 'other';

export interface BloodPressureRecord {
  id: string;
  date: string;
  timeOfDay: TimeOfDay;
  systolic: number;
  diastolic: number;
  pulse: number;
  condition?: MeasurementCondition;
  device?: MeasurementDevice;
  note?: string;
}

export type MedicationFrequency = 'daily' | 'twice-daily' | 'three-times-daily' | 'as-needed';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: MedicationFrequency;
  startTime: string;
  prescribedBy: string;
  isActive: boolean;
}

export type AdherenceStatus = 'taken' | 'missed' | 'partial' | 'skipped';

export interface AdherenceRecord {
  id: string;
  date: string;
  medicationId: string;
  status: AdherenceStatus;
  takenTimes?: string[];
}

export type SideEffectSeverity = 'mild' | 'moderate' | 'severe';

export interface SideEffectRecord {
  id: string;
  date: string;
  medicationId: string;
  symptom: string;
  severity: SideEffectSeverity;
  note?: string;
  resolved: boolean;
  resolvedDate?: string;
  doctorNotified: boolean;
}

export interface SaltIntakeRecord {
  id: string;
  date: string;
  amountGrams: number;
  note?: string;
}

export type ExerciseType = 'walking' | 'running' | 'cycling' | 'swimming' | 'yoga' | 'strength' | 'other';

export interface ExerciseRecord {
  id: string;
  date: string;
  type: ExerciseType;
  durationMinutes: number;
  caloriesBurned?: number;
  note?: string;
}

export interface BodyMeasurementRecord {
  id: string;
  date: string;
  weightKg: number;
  heightCm?: number;
  waistCm?: number;
  hipCm?: number;
  bmi?: number;
  note?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  hospital: string;
  type: 'follow-up' | 'consultation' | 'exam' | 'other';
  note?: string;
  isCompleted: boolean;
}

export interface VisitRecord {
  id: string;
  date: string;
  doctor: string;
  department: string;
  hospital: string;
  diagnosis: string;
  treatment: string;
  note?: string;
}

export type ExamType = 'urine' | 'kidney' | 'ecg' | 'blood' | 'xray' | 'ultrasound' | 'other';

export interface ExamReport {
  id: string;
  date: string;
  type: ExamType;
  typeLabel: string;
  hospital: string;
  summary: string;
  findings: string[];
  isNormal: boolean;
  note?: string;
}
