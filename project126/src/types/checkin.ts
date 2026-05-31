export type CheckinMethod = 'manual' | 'qr' | 'face';

export interface Checkin {
  id: string;
  memberId: string;
  memberCardId: string;
  checkinTime: string;
  checkinMethod: CheckinMethod;
  consumedCount: number;
  notes: string;
}

export interface CheckinFormData {
  memberId: string;
  memberCardId: string;
  checkinMethod: CheckinMethod;
  notes: string;
}
