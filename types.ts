
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

export interface Provider {
  underwriter: string;
  plan: string;
}

export interface BenefitItem {
  label: string;
  values: string[]; // Supports multiple providers
}

export interface BenefitCategory {
  title: string;
  items: BenefitItem[];
  notes?: string;
}

export interface ComparisonSession {
  id: string;
  name: string;
  date: string;
  clientProfile: ClientProfile;
  type: PlanType;
  providers: Provider[]; // Refactored from providerA/B
  categories: BenefitCategory[];
  reportTitleOverride?: string;
}
