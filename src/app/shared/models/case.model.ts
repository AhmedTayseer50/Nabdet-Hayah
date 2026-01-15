export type CaseStatus = 'onhold' | 'processed';

export interface CaseRecord {
  id?: string;
  userId: string;
  userEmail: string;
  courseIds: Record<string, true>;
  proofUrl?: string;
  amount: number;
  status: CaseStatus;
  createdAt: number;
  createdBy: string;
  processedAt?: number | null;
  processedBy?: string | null;
}
