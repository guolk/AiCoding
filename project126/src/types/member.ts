export interface Member {
  id: string;
  name: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  joinDate: string;
  recommender: string;
  photo: string;
  medicalNotes: string;
  preferences: string;
  notes: string;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
  birthday?: string;
}

export interface MemberFormData {
  name: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  joinDate: string;
  recommender: string;
  photo: string;
  medicalNotes: string;
  preferences: string;
  notes: string;
  birthday?: string;
}
