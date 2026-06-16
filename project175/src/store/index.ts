import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BloodPressureRecord,
  Medication,
  AdherenceRecord,
  SideEffectRecord,
  SaltIntakeRecord,
  ExerciseRecord,
  BodyMeasurementRecord,
  Appointment,
  VisitRecord,
  ExamReport,
} from '@/types';
import {
  bloodPressureData,
  medicationData,
  adherenceData,
  sideEffectData,
  saltIntakeData,
  exerciseData,
  bodyMeasurementData,
  appointmentData,
  visitRecordData,
  examReportData,
} from '@/data/mockData';

interface HealthState {
  bloodPressureRecords: BloodPressureRecord[];
  medications: Medication[];
  adherenceRecords: AdherenceRecord[];
  sideEffectRecords: SideEffectRecord[];
  saltIntakeRecords: SaltIntakeRecord[];
  exerciseRecords: ExerciseRecord[];
  bodyMeasurementRecords: BodyMeasurementRecord[];
  appointments: Appointment[];
  visitRecords: VisitRecord[];
  examReports: ExamReport[];

  addBloodPressure: (record: Omit<BloodPressureRecord, 'id'>) => void;
  updateBloodPressure: (id: string, record: Partial<BloodPressureRecord>) => void;
  deleteBloodPressure: (id: string) => void;

  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;

  addAdherence: (record: Omit<AdherenceRecord, 'id'>) => void;
  updateAdherence: (id: string, record: Partial<AdherenceRecord>) => void;

  addSideEffect: (record: Omit<SideEffectRecord, 'id'>) => void;
  updateSideEffect: (id: string, record: Partial<SideEffectRecord>) => void;
  deleteSideEffect: (id: string) => void;

  addSaltIntake: (record: Omit<SaltIntakeRecord, 'id'>) => void;
  updateSaltIntake: (id: string, record: Partial<SaltIntakeRecord>) => void;
  deleteSaltIntake: (id: string) => void;

  addExercise: (record: Omit<ExerciseRecord, 'id'>) => void;
  updateExercise: (id: string, record: Partial<ExerciseRecord>) => void;
  deleteExercise: (id: string) => void;

  addBodyMeasurement: (record: Omit<BodyMeasurementRecord, 'id'>) => void;
  updateBodyMeasurement: (id: string, record: Partial<BodyMeasurementRecord>) => void;
  deleteBodyMeasurement: (id: string) => void;

  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;

  addVisitRecord: (record: Omit<VisitRecord, 'id'>) => void;
  updateVisitRecord: (id: string, record: Partial<VisitRecord>) => void;
  deleteVisitRecord: (id: string) => void;

  addExamReport: (report: Omit<ExamReport, 'id'>) => void;
  updateExamReport: (id: string, report: Partial<ExamReport>) => void;
  deleteExamReport: (id: string) => void;

  resetAllData: () => void;
}

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      bloodPressureRecords: bloodPressureData,
      medications: medicationData,
      adherenceRecords: adherenceData,
      sideEffectRecords: sideEffectData,
      saltIntakeRecords: saltIntakeData,
      exerciseRecords: exerciseData,
      bodyMeasurementRecords: bodyMeasurementData,
      appointments: appointmentData,
      visitRecords: visitRecordData,
      examReports: examReportData,

      addBloodPressure: (record) =>
        set((state) => ({
          bloodPressureRecords: [
            ...state.bloodPressureRecords,
            { ...record, id: generateId() },
          ],
        })),
      updateBloodPressure: (id, record) =>
        set((state) => ({
          bloodPressureRecords: state.bloodPressureRecords.map((r) =>
            r.id === id ? { ...r, ...record } : r
          ),
        })),
      deleteBloodPressure: (id) =>
        set((state) => ({
          bloodPressureRecords: state.bloodPressureRecords.filter((r) => r.id !== id),
        })),

      addMedication: (medication) =>
        set((state) => ({
          medications: [...state.medications, { ...medication, id: generateId() }],
        })),
      updateMedication: (id, medication) =>
        set((state) => ({
          medications: state.medications.map((m) =>
            m.id === id ? { ...m, ...medication } : m
          ),
        })),
      deleteMedication: (id) =>
        set((state) => ({
          medications: state.medications.filter((m) => m.id !== id),
          adherenceRecords: state.adherenceRecords.filter((a) => a.medicationId !== id),
        })),

      addAdherence: (record) =>
        set((state) => ({
          adherenceRecords: [...state.adherenceRecords, { ...record, id: generateId() }],
        })),
      updateAdherence: (id, record) =>
        set((state) => ({
          adherenceRecords: state.adherenceRecords.map((a) =>
            a.id === id ? { ...a, ...record } : a
          ),
        })),

      addSideEffect: (record) =>
        set((state) => ({
          sideEffectRecords: [...state.sideEffectRecords, { ...record, id: generateId() }],
        })),
      updateSideEffect: (id, record) =>
        set((state) => ({
          sideEffectRecords: state.sideEffectRecords.map((s) =>
            s.id === id ? { ...s, ...record } : s
          ),
        })),
      deleteSideEffect: (id) =>
        set((state) => ({
          sideEffectRecords: state.sideEffectRecords.filter((s) => s.id !== id),
        })),

      addSaltIntake: (record) =>
        set((state) => ({
          saltIntakeRecords: [...state.saltIntakeRecords, { ...record, id: generateId() }],
        })),
      updateSaltIntake: (id, record) =>
        set((state) => ({
          saltIntakeRecords: state.saltIntakeRecords.map((s) =>
            s.id === id ? { ...s, ...record } : s
          ),
        })),
      deleteSaltIntake: (id) =>
        set((state) => ({
          saltIntakeRecords: state.saltIntakeRecords.filter((s) => s.id !== id),
        })),

      addExercise: (record) =>
        set((state) => ({
          exerciseRecords: [...state.exerciseRecords, { ...record, id: generateId() }],
        })),
      updateExercise: (id, record) =>
        set((state) => ({
          exerciseRecords: state.exerciseRecords.map((e) =>
            e.id === id ? { ...e, ...record } : e
          ),
        })),
      deleteExercise: (id) =>
        set((state) => ({
          exerciseRecords: state.exerciseRecords.filter((e) => e.id !== id),
        })),

      addBodyMeasurement: (record) =>
        set((state) => ({
          bodyMeasurementRecords: [
            ...state.bodyMeasurementRecords,
            { ...record, id: generateId() },
          ],
        })),
      updateBodyMeasurement: (id, record) =>
        set((state) => ({
          bodyMeasurementRecords: state.bodyMeasurementRecords.map((b) =>
            b.id === id ? { ...b, ...record } : b
          ),
        })),
      deleteBodyMeasurement: (id) =>
        set((state) => ({
          bodyMeasurementRecords: state.bodyMeasurementRecords.filter((b) => b.id !== id),
        })),

      addAppointment: (appointment) =>
        set((state) => ({
          appointments: [...state.appointments, { ...appointment, id: generateId() }],
        })),
      updateAppointment: (id, appointment) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...appointment } : a
          ),
        })),
      deleteAppointment: (id) =>
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        })),

      addVisitRecord: (record) =>
        set((state) => ({
          visitRecords: [...state.visitRecords, { ...record, id: generateId() }],
        })),
      updateVisitRecord: (id, record) =>
        set((state) => ({
          visitRecords: state.visitRecords.map((v) =>
            v.id === id ? { ...v, ...record } : v
          ),
        })),
      deleteVisitRecord: (id) =>
        set((state) => ({
          visitRecords: state.visitRecords.filter((v) => v.id !== id),
        })),

      addExamReport: (report) =>
        set((state) => ({
          examReports: [...state.examReports, { ...report, id: generateId() }],
        })),
      updateExamReport: (id, report) =>
        set((state) => ({
          examReports: state.examReports.map((e) =>
            e.id === id ? { ...e, ...report } : e
          ),
        })),
      deleteExamReport: (id) =>
        set((state) => ({
          examReports: state.examReports.filter((e) => e.id !== id),
        })),

      resetAllData: () =>
        set({
          bloodPressureRecords: bloodPressureData,
          medications: medicationData,
          adherenceRecords: adherenceData,
          sideEffectRecords: sideEffectData,
          saltIntakeRecords: saltIntakeData,
          exerciseRecords: exerciseData,
          bodyMeasurementRecords: bodyMeasurementData,
          appointments: appointmentData,
          visitRecords: visitRecordData,
          examReports: examReportData,
        }),
    }),
    {
      name: 'health-management-storage',
    }
  )
);
