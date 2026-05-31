export type MarketingType = 'birthday' | 'renewal' | 'activity';
export type MarketingStatus = 'pending' | 'sent' | 'cancelled';

export interface Marketing {
  id: string;
  memberId: string;
  type: MarketingType;
  content: string;
  scheduledDate: string;
  sentDate?: string;
  status: MarketingStatus;
}
