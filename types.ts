
export enum PlanType {
  MEDICAL_AID = 'Medical Aid',
  HOSPITAL = 'Hospital Plan',
  GAP_COVER = 'Gap Cover'
}

export interface ClientProfile {
  memberName: string;
  familyComposition: string;
  incomeBracket: string;
  region: string;
  primaryPriority: string;
}

export interface BenefitItem {
  label: string;
  valueA: string;
  valueB: string;
}

export interface BenefitCategory {
  title: string;
  items: BenefitItem[];
}

export interface ComparisonSession {
  id: string;
  name: string;
  date: string;
  clientProfile: ClientProfile;
  type: PlanType;
  providerAUnderwriter: string;
  providerBUnderwriter: string;
  providerAPlan: string;
  providerBPlan: string;
  categories: BenefitCategory[];
}
